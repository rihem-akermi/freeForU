// avec documentation Swagger
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsNumber, IsInt } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Nom du service proposé par l\'agent',
    example: 'Installation électrique',
  })
  @IsString()
  nom!: string;

  @ApiPropertyOptional({
    description: 'Description courte du service',
    example: 'Installation complète pour appartement neuf',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type de tarification',
    enum: ['fixe', 'a_partir_de'],
    example: 'fixe',
  })
  @IsIn(["fixe", "a_partir_de"])
  typePrix!: "fixe" | "a_partir_de";

  @ApiProperty({
    description: 'Prix en DT',
    example: 150,
    minimum: 0,
  })
  @IsNumber()
  prix!: number;

  @ApiPropertyOptional({
    description: 'Durée estimée en minutes (optionnel)',
    example: 120,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  dureeEstimee?: number;
}