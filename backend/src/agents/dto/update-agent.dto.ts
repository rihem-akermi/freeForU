import { Type } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatedAgentDto {
  @ApiPropertyOptional({
    description: "Nom complet de l'agent",
    example: 'Karim Ben Salem',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Adresse email de l'agent",
    example: 'karim.bensalem@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '21698123456',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Ville',
    example: 'Tunis',
  })
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional({
    description: 'Nouveau mot de passe',
    example: 'newpassword123',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: "Identifiant de la catégorie",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @ApiPropertyOptional({
    description: "Biographie de l'agent",
    example: 'Électricien qualifié avec 10 ans d’expérience.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: "Zone géographique d'intervention",
    example: 'Grand Tunis',
  })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiPropertyOptional({
    description: 'Mode de prestation de service',
    enum: ['se_deplace', 'recoit', 'les_deux'],
    example: 'se_deplace',
  })
  @IsOptional()
  @IsString()
  service_mode?: string;

  @ApiPropertyOptional({
    description: "Âge de l'agent",
    example: 35,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  age?: number;

  @ApiPropertyOptional({
    description: 'Sexe',
    enum: ['homme', 'femme'],
    example: 'homme',
  })
  @IsOptional()
  @IsString()
  sexe?: string;

  @ApiPropertyOptional({
    description: "Années d'expérience professionnelle",
    example: 8,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experience_years?: number;

  @ApiPropertyOptional({
    description: 'Liens vers les réseaux sociaux',
    example: { facebook: 'https://facebook.com/karim', instagram: 'https://instagram.com/karim' },
  })
  @IsOptional()
  social_links?: object;

  @ApiPropertyOptional({
    description: "URL de la pièce d'identité",
    example: 'https://res.cloudinary.com/.../id_card.jpg',
  })
  @IsOptional()
  @IsString()
  id_card_url?: string;

  @ApiPropertyOptional({
    description: 'URL du certificat de travail',
    example: 'https://res.cloudinary.com/.../certificate.pdf',
  })
  @IsOptional()
  @IsString()
  work_certificate_url?: string;
}