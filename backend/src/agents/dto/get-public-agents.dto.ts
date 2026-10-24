import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString, Max } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetPublicAgentsDto {
  @ApiPropertyOptional({
    description: "Numéro de page (commence à 1)",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Nombre d'agents par page (maximum 20)",
    example: 12,
    default: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(20)
  limit?: number = 12;

  @ApiPropertyOptional({
    description: "Filtrer par identifiant de catégorie",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  category_id?: number;

  @ApiPropertyOptional({
    description: "Filtrer par ville",
    example: "Sousse",
  })
  @IsOptional()
  @IsString()
  ville?: string;
}
