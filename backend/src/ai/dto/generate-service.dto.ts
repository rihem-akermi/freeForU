import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GenerateServiceDto {
  @ApiProperty({
    description:
      "Description brute du service pour générer une fiche professionnelle",
    example:
      "Installation climatiseur split et vérification du circuit frigorifique",
  })
  @IsString()
  @IsNotEmpty()
  rawInput!: string;
}
