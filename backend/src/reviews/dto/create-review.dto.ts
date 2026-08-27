// dto/create-review.dto.ts
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiProperty({
    description: "Identifiant de la réservation associée à l'avis",
    example: 12,
  })
  @IsInt()
  reservation_id!: number;

  @ApiProperty({
    description: "Note attribuée à l'agent (de 1 à 5 étoiles)",
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: "Commentaire détaillé sur la prestation",
    example: "Excellent travail, rapide et très professionnel !",
  })
  @IsOptional()
  @IsString()
  comment?: string;
}