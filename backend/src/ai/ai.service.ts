import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { z } from "zod";

const ServiceSchema = z.object({
  nom: z.string().min(3).max(150),
  description: z.string().min(10),
});

const PublicationSchema = z.object({
  titre: z.string().min(3).max(150),
  description: z.string().min(10),
})

export type Publication = z.infer<typeof PublicationSchema>;

export type Service = z.infer<typeof ServiceSchema>;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly groqClient: OpenAI;

  constructor() {
    this.groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
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
      {//ask LLM to return a specific JSON structure 
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
      { role: 'system', content: systemInstruction },
      { role: 'user', content: rawInput },
    ],
    {
      type: 'json_schema',
      json_schema: {
        name: 'publication_schema',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            titre: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['titre', 'description'],
          additionalProperties: false,
        },
      },
    },
  );

  //ZOD verifies the result of the LLM
  const parsed = PublicationSchema.safeParse(JSON.parse(rawJson));
  if (!parsed.success) {
    this.logger.error(`Validation échouée: ${parsed.error.message}`);
    throw new Error('La réponse générée ne respecte pas le format attendu');
  }

  return parsed.data;
}
}
