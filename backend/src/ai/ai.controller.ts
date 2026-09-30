import { Controller, Post, Body } from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("ask")
  async ask(@Body('prompt') prompt :string) {
    console.log("prompt reçu :", prompt);
    console.log("type de prompt :", typeof prompt);
    const result = await this.aiService.ask(prompt);
    return { result };
  }
}
