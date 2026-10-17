import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AskPromptDto {
  @ApiProperty({
    description: "Question ou prompt textuel libre pour l'IA",
    example: "Quels sont les avantages de faire appel à un agent FreeForU ?",
  })
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}
