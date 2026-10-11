import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { z } from "zod";
import { AgentsService } from "../agents/agents.service";
import { PrismaService } from "../prisma/prisma.service";
import { GoogleGenAI } from "@google/genai";

const ServiceSchema = z.object({
  nom: z.string().min(3).max(150),
  description: z.string().min(10),
});

const PublicationSchema = z.object({
  titre: z.string().min(3).max(150),
  description: z.string().min(10),
});

export type Publication = z.infer<typeof PublicationSchema>;

export type Service = z.infer<typeof ServiceSchema>;

// TOOL :
const searchAgentsTool = {
  type: "function" as const,
  function: {
    name: "searchAgents",
    description:
      "Recherche des agents/prestataires FreeForU disponibles, filtrés par catégorie de service et/ou ville.",
    parameters: {
      type: "object",
      properties: {
        categoryId: {
          type: "integer",
          description:
            "L'identifiant de la catégorie recherchée (voir la liste des catégories fournie).",
        },
        ville: {
          type: "string",
          description: "La ville où le client souhaite trouver un agent.",
        },
      },
      required: [],
    },
  },
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly groqClient: OpenAI;
  private readonly geminiClient: GoogleGenAI;

  constructor(
    private agentsService: AgentsService,
    private prisma: PrismaService
  ) {
    this.groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
    this.geminiClient = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY!,
    });
  }

  private async callGroq(
    messages: { role: "system" | "user"; content: string }[],
    responseFormat?: any,
    maxRetries = 3
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.groqClient.chat.completions.create({
          model: process.env.GROQ_MODEL_NAME ?? "openai/gpt-oss-120b",
          messages,
          ...(responseFormat && { response_format: responseFormat }),
        });
        //each messgae has a role + content
        //role "system" : more like rules
        //role "assistant" : previous response from the AI -> History

        const text = response.choices[0]?.message?.content;
        if (!text) {
          throw new Error("Groq returned no text");
        }

        return text;
      } catch (error: any) {
        const isRetryable = error?.status === 503 || error?.status === 429;
        const isLastAttempt = attempt === maxRetries;

        if (!isRetryable || isLastAttempt) {
          throw error;
        }

        const delayMs = attempt * 1000;
        this.logger.warn(
          `Groq indisponible (tentative ${attempt}/${maxRetries}), retry dans ${delayMs}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error("Échec après plusieurs tentatives");
  }

  private async executeTool(name: string, args: any): Promise<any> {
    if (name === "searchAgents") {
      const result = await this.agentsService.getPublicAgents({
        page: 1,
        limit: 5,
        category_id: args.categoryId,
        ville: args.ville,
      });
      // On renvoie une version allégée au LLM (pas besoin de toute la pagination)
      return result.data.map((a) => ({
        nom: a.name,
        ville: a.ville,
        categorie: a.categories?.name,
        bio: a.bio,
      }));
    }
    throw new Error(`Tool inconnu: ${name}`);
  }

  // 🔑 Utilitaire de comparaison, réutilisé pour chaque recherche
  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  //simple prompt no instrucion , LLM is free
  async ask(prompt: string): Promise<string> {
    return this.callGroq([{ role: "user", content: prompt }]);
  }

  async generateAgentBio(rawBio: string): Promise<string> {
    const systemInstruction = `Tu es un assistant qui transforme la description brute d'un prestataire de services FreeForU en une bio professionnelle...
Réponds UNIQUEMENT avec le texte de la bio, sans préambule, sans guillemets et de 1 à 3 phrases.`;

    return this.callGroq([
      { role: "system", content: systemInstruction },
      { role: "user", content: rawBio },
    ]);
  }

  async generateService(rawInput: string): Promise<Service> {
    const systemInstruction = `Tu es un assistant qui transforme la description brute d'un service FreeForU en une fiche professionnelle.

Règles :
- "nom" : court, clair, orienté client (max 150 caractères)
- "description" : professionnelle, 1 à 3 phrases
- Ne JAMAIS inventer de détails absents du texte brut (prix, délais, garanties...)`;

    const rawJson = await this.callGroq(
      [
        { role: "system", content: systemInstruction },
        { role: "user", content: rawInput },
      ],
      {
        //ask LLM to return a specific JSON structure
        type: "json_schema",
        json_schema: {
          name: "service_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              nom: { type: "string" },
              description: { type: "string" },
            },
            required: ["nom", "description"],
            additionalProperties: false,
          },
        },
      }
    );

    //ZOD verifies the result of the LLM
    const parsed = ServiceSchema.safeParse(JSON.parse(rawJson));
    if (!parsed.success) {
      this.logger.error(`Validation échouée: ${parsed.error.message}`);
      throw new Error("La réponse générée ne respecte pas le format attendu");
    }

    return parsed.data;
  }

  async generatePublication(rawInput: string): Promise<Publication> {
    const systemInstruction = `Tu es un assistant qui transforme la description brute d'une publication FreeForU (post d'un agent, ex: avant/après d'un travail réalisé) en une fiche accrocheuse.

Règles :
- "titre" : court, accrocheur, orienté client (max 150 caractères)
- "description" : 1 à 3 phrases, professionnelle
- Ne JAMAIS inventer de détails absents du texte brut`;

    const rawJson = await this.callGroq(
      [
        { role: "system", content: systemInstruction },
        { role: "user", content: rawInput },
      ],
      {
        type: "json_schema",
        json_schema: {
          name: "publication_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              titre: { type: "string" },
              description: { type: "string" },
            },
            required: ["titre", "description"],
            additionalProperties: false,
          },
        },
      }
    );

    //ZOD verifies the result of the LLM
    const parsed = PublicationSchema.safeParse(JSON.parse(rawJson));
    if (!parsed.success) {
      this.logger.error(`Validation échouée: ${parsed.error.message}`);
      throw new Error("La réponse générée ne respecte pas le format attendu");
    }

    return parsed.data;
  }

  async askAssistant(
    userMessage: string,
    history: { role: "user" | "assistant"; content: string }[] = []
  ): Promise<{ reply: string; history: { role: string; content: string }[] }> {
    const categories = await this.prisma.categories.findMany({
      select: { id: true, name: true },
    });
    const categoriesList = categories
      .map((c) => `${c.id}: ${c.name}`)
      .join(", ");

    const systemInstruction = `Tu es l'assistant FreeForU, une plateforme qui met en relation des clients avec des prestataires de services.
Catégories disponibles (id: nom) : ${categoriesList}
Utilise le tool searchAgents quand l'utilisateur cherche un professionnel.

Style de réponse OBLIGATOIRE :
- Réponds comme dans une conversation de chat, pas comme un rapport
- 2 à 6 phrases maximum, sauf si tu dois lister des résultats concrets (agents trouvés)
- Pas de titres markdown (##), pas de tableaux
- Si tu listes des agents trouvés, utilise une simple liste à puces courte (nom, ville)
- Pas de suggestions non demandées (villes voisines, notifications...) sauf si l'utilisateur les demande explicitement`;
    const messages: any[] = [
      { role: "system", content: systemInstruction },
      ...history,
      { role: "user", content: userMessage },
    ];

    const firstResponse = await this.groqClient.chat.completions.create({
      model: process.env.GROQ_MODEL_NAME ?? "openai/gpt-oss-120b",
      messages,
      tools: [searchAgentsTool],
      tool_choice: "auto",
    });

    const firstMessage = firstResponse.choices[0].message;
    let finalReply: string;

    if (!firstMessage.tool_calls || firstMessage.tool_calls.length === 0) {
      finalReply =
        firstMessage.content ?? "Désolé, je n'ai pas compris votre demande.";
    } else {
      messages.push(firstMessage);

      for (const toolCall of firstMessage.tool_calls) {
        if (toolCall.type !== "function") continue;

        const args = JSON.parse(toolCall.function.arguments);
        this.logger.log(
          `Tool call: ${toolCall.function.name}(${JSON.stringify(args)})`
        );
        const toolResult = await this.executeTool(toolCall.function.name, args);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      const secondResponse = await this.groqClient.chat.completions.create({
        model: process.env.GROQ_MODEL_NAME ?? "openai/gpt-oss-120b",
        messages,
      });

      finalReply =
        secondResponse.choices[0].message.content ??
        "Désolé, je n'ai pas pu formuler de réponse.";
    }

    // On renvoie l'historique mis à jour — LE CLIENT devra le renvoyer au prochain appel
    const updatedHistory = [
      ...history,
      { role: "user" as const, content: userMessage },
      { role: "assistant" as const, content: finalReply },
    ];

    return { reply: finalReply, history: updatedHistory };
  }

  async embedText(
    text: string,
    taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"
  ): Promise<number[]> {
    const result = await this.geminiClient.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: { taskType },
    });
    return result.embeddings![0].values!;
  }

  async searchServices(query: string, limit = 5) {
    const queryEmbedding = await this.embedText(query, "RETRIEVAL_QUERY");

    const services = await this.prisma.services.findMany({
      where: { embedding: { not: null as any } },
      select: {
        id: true,
        nom: true,
        description: true,
        prix: true,
        agent_id: true,
        embedding: true,
      },
    });

    const scored = services
      .map((s) => ({
        id: s.id,
        nom: s.nom,
        description: s.description,
        prix: s.prix,
        score: this.cosineSimilarity( //calcul similarité ici puisque sans pgvector dans postgres
          queryEmbedding,
          s.embedding as unknown as number[]
        ),
      }))
      .sort((a, b) => b.score - a.score) //on trie du + pertinent au - pertinent
      .slice(0, limit);//le top

    return scored;
  }
}
