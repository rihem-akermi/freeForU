import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, MaxLength, MinLength } from "class-validator";

export class AskAssistantDto {
  @ApiProperty({
    description: "Message envoyé à l'assistant intelligent FreeForU",
    example:
      "Bonjour, je cherche un plombier à Tunis pour une réparation d'évier.",
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500) //empeche un msg abusif (trop long) -> (-tokens)
  message!: string;

  @ApiPropertyOptional({
    description: "Identifiant de la conversation pour maintenir le contexte",
    example: "a8d3e921-39bc-4b02-8692-23c2174c86be",
  })
  @IsOptional()
  @IsString()
  conversationId?: string;
}
