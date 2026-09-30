import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly groqClient: OpenAI;

  constructor() {
    this.groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  private async generateContent(
    prompt: string,
    systemInstruction?: string,
    maxRetries = 3,
  ): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.groqClient.chat.completions.create({
          model: process.env.GROQ_MODEL_NAME ?? 'openai/gpt-oss-120b',
          messages: [
            ...(systemInstruction
              ? [{ role: 'system' as const, content: systemInstruction }]
              : []),
            { role: 'user' as const, content: prompt },
          ],
        });

        const text = response.choices[0]?.message?.content;
        if (!text) {
          throw new Error('Groq returned no text');
        }

        return text;
      } catch (error: any) {
        const isRetryable = error?.status === 503 || error?.status === 429;
        const isLastAttempt = attempt === maxRetries;

        if (!isRetryable || isLastAttempt) {
          throw error;
        }

        const delayMs = attempt * 1000;
        this.logger.warn(`Groq indisponible (tentative ${attempt}/${maxRetries}), retry dans ${delayMs}ms`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error('Échec après plusieurs tentatives');
  }

  async ask(prompt: string): Promise<string> {
    return this.generateContent(prompt);
  }

  async generateAgentBio(rawBio: string): Promise<string> {
    const systemInstruction = `Tu es un assistant qui transforme la description brute d'un prestataire de services FreeForU en une bio professionnelle, chaleureuse et claire.

Règles strictes :
- 2 à 3 phrases maximum
- Ne JAMAIS inventer d'informations absentes du texte fourni
- Réponds UNIQUEMENT avec le texte de la bio, sans préambule, sans guillemets`;

    return this.generateContent(rawBio, systemInstruction);
  }
}