import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { AiService } from "./ai.service";
import { AskAssistantDto } from "./dto/ask-assistant.dto";
import { AskPromptDto } from "./dto/ask-prompt.dto";
import { GenerateBioDto } from "./dto/generate-bio.dto";
import { GenerateServiceDto } from "./dto/generate-service.dto";
import { GeneratePublicationDto } from "./dto/generate-publication.dto";
import { SearchServicesDto } from "./dto/search-services.dto";
import { OptionalAuthGuard } from "src/auth/guards/optinal-auth.guard";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";

@ApiTags("AI")
@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({
    summary: "Poser une question libre à l'IA",
    description: "Envoie un prompt au modèle LLM et retourne la réponse brute générée.",
  })
  @ApiResponse({
    status: 201,
    description: "Réponse générée par l'IA retournée avec succès.",
  })
  @Post("ask")
  async ask(@Body() body: AskPromptDto) {
    console.log("prompt reçu :", body.prompt);
    console.log("type de prompt :", typeof body.prompt);
    const result = await this.aiService.ask(body.prompt);
    return { result };
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Générer une biographie professionnelle pour agent (Agent connecté)",
    description:
      "Transforme une description brute du parcours de l'agent en une biographie claire, engageante et professionnelle.",
  })
  @ApiResponse({
    status: 201,
    description: "Biographie générée avec succès.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post("generate-bio")
  async generateBio(@Body() body: GenerateBioDto) {
    const bio = await this.aiService.generateAgentBio(body.rawBio);
    return { bio };
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Générer les informations d'un service (Agent connecté)",
    description:
      "Génère un nom optimisé et une description professionnelle à partir d'une description informelle.",
  })
  @ApiResponse({
    status: 201,
    description: "Fiche service générée avec succès (nom et description).",
  })
  @ApiResponse({
    status: 400,
    description:
      "La génération a échoué, description insuffisante ou format invalide.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post("generate-service-infos")
  async generateService(@Body() body: GenerateServiceDto) {
    try {
      return await this.aiService.generateService(body.rawInput);
    } catch (error: any) {
      throw new BadRequestException(
        "La génération a échoué, réessaie avec une description un peu plus détaillée."
      );
    }
  }

  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary:
      "Générer le titre et la description d'une publication (Agent connecté)",
    description:
      "Génère un titre accrocheur et une description engageante pour une réalisation de l'agent.",
  })
  @ApiResponse({
    status: 201,
    description: "Publication générée avec succès (titre et description).",
  })
  @ApiResponse({
    status: 400,
    description:
      "La génération a échoué, description insuffisante ou format invalide.",
  })
  @ApiResponse({ status: 401, description: "Non authentifié." })
  @ApiResponse({ status: 403, description: "Rôle AGENT requis." })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post("generate-publication-infos")
  async generatePublication(@Body() body: GeneratePublicationDto) {
    try {
      return await this.aiService.generatePublication(body.rawInput);
    } catch {
      throw new BadRequestException(
        "La génération a échoué, réessaie avec une description un peu plus détaillée."
      );
    }
  }

  @ApiOperation({
    summary: "Interagir avec l'assistant intelligent FreeForU",
    description:
      "Assistant conversationnel avec gestion d'historique, support client et recherche d'agents pour utilisateurs connectés.",
  })
  @ApiResponse({
    status: 201,
    description: "Réponse générée par l'assistant et ID de session conversationnelle.",
  })
  @UseGuards(OptionalAuthGuard)
  @Post("assistant")
  async askAssistant(@Body() dto: AskAssistantDto, @Req() req?: any) {
    const authenticatedUserId = req?.user?.sub ? Number(req.user.sub) : undefined;
    return this.aiService.askAssistant(
      dto.message,
      dto.conversationId,
      authenticatedUserId
    );
  }

  @ApiOperation({
    summary: "Rechercher des services par similarité sémantique (Embeddings)",
    description:
      "Compare la requête utilisateur aux embeddings des services enregistrés pour trouver les plus pertinents.",
  })
  @ApiResponse({
    status: 201,
    description: "Liste des services scorés par pertinence sémantique.",
  })
  @Post("search-services")
  async searchServices(@Body() body: SearchServicesDto) {
    return this.aiService.searchServices(body.query);
  }
}
