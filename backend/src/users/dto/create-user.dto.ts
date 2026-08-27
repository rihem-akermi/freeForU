import { IsString, IsEmail, IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: "Amira Mansour",
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: "Adresse email",
    example: "amira.mansour@example.com",
  })
  @IsEmail()
  @IsString()
  email!: string;

  @ApiProperty({
    description: "Numéro de téléphone",
    example: "21698765432",
  })
  @IsString()
  phone!: string;

  @ApiProperty({
    description: "Mot de passe",
    example: "password123",
  })
  @IsString()
  password!: string;

  @ApiProperty({
    description: "Rôle attribué à l'utilisateur",
    enum: ["CLIENT", "ADMIN"],
    example: "CLIENT",
  })
  @IsIn(["CLIENT", "ADMIN"])
  @IsString()
  role!: "CLIENT" | "ADMIN";

  @ApiProperty({
    description: "Ville de résidence",
    example: "Sousse",
  })
  @IsString()
  ville!: string;
}