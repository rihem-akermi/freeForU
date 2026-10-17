import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GeneratePublicationDto {
  @ApiProperty({
    description: "Description brute des travaux ou de la réalisation pour générer une publication",
    example: "Rénovation complète d'une cuisine avec pose d'îlot central et carrelage moderne",
  })
  @IsString()
  @IsNotEmpty()
  rawInput!: string;
}
