import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { AiService } from "./ai.service";
import { AskAssistantDto } from "./dto/ask-assistant.dto";
import { OptionalAuthGuard } from "src/auth/guards/optinal-auth.guard";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { RolesGuard } from "src/auth/guards/roles.guard";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("ask")
  async ask(@Body("prompt") prompt: string) {
    console.log("prompt reçu :", prompt);
    console.log("type de prompt :", typeof prompt);
    const result = await this.aiService.ask(prompt);
    return { result };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post("generate-bio")
  async generateBio(@Body("rawBio") rawBio: string) {
    const bio = await this.aiService.generateAgentBio(rawBio);
    return { bio };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post("generate-service-infos")
  async generateService(@Body("rawInput") rawInput: string) {
    try {
      return await this.aiService.generateService(rawInput);
    } catch (error: any) {
      throw new BadRequestException(
        "La génération a échoué, réessaie avec une description un peu plus détaillée."
      );
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("AGENT")
  @Post("generate-publication-infos")
  async generatePublication(@Body("rawInput") rawInput: string) {
    try {
      return await this.aiService.generatePublication(rawInput);
    } catch {
      throw new BadRequestException(
        "La génération a échoué, réessaie avec une description un peu plus détaillée."
      );
    }
  }

  @UseGuards(OptionalAuthGuard)
  @Post("assistant")
  async askAssistant(@Body() dto: AskAssistantDto) {
    return this.aiService.askAssistant(dto.message, dto.conversationId);
  }

  @Post("search-services")
  async searchServices(@Body("query") query: string) {
    return this.aiService.searchServices(query);
  }
}
