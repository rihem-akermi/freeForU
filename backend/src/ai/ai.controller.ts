import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { AiService } from "./ai.service";

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

  @Post("generate-bio")
  async generateBio(@Body("rawBio") rawBio: string) {
    const bio = await this.aiService.generateAgentBio(rawBio);
    return { bio };
  }

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
}
