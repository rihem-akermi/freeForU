import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatedPublicationDto {
  @ApiPropertyOptional({
    description: "Nouveau titre de la publication",
    example: "Rénovation complète cuisine & salon",
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  titre?: string;

  @ApiPropertyOptional({
    description: "Nouvelle description",
    example: "Travaux terminés avec succès.",
  })
  @IsOptional()
  @IsString()
  description?: string;
}