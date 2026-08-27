import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateAgentDto {
  @ApiProperty({
    description: "Nom complet de l'agent",
    example: 'Karim Ben Salem',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "Adresse email de l'agent",
    example: 'karim.bensalem@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: "Mot de passe (minimum 6 caractères)",
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '21698123456',
  })
  @IsString()
  phone!: string;

  @ApiProperty({
    description: 'Ville de résidence ou exercice',
    example: 'Tunis',
  })
  @IsString()
  ville!: string;

  @ApiProperty({
    description: "Identifiant de la catégorie de métier",
    example: 1,
  })
  @IsInt()
  category_id!: number;
}