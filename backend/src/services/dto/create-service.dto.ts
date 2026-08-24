import {
  IsString,
  IsNumber,
  IsIn,
  IsOptional,
  IsInt,
  MinLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateServiceDto {
  @IsString()
  @MinLength(2, { message: "Le nom du service est trop court" })
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(["fixe", "a_partir_de"], {
    message: "type_prix doit être 'fixe' ou 'a_partir_de'",
  })
  typePrix!: "fixe" | "a_partir_de";

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  prix!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dureeEstimee?: number; // en minutes
}