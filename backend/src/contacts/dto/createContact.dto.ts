import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateContactDto {
  @ApiProperty({
    description: "Nom de la personne qui contacte",
    example: "Sonia Trabelsi",
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: "Adresse email de contact",
    example: "sonia.trabelsi@example.com",
  })
  @IsString()
  email!: string;

  @ApiProperty({
    description: "Message envoyé via le formulaire de contact",
    example: "Bonjour, je souhaiterais des renseignements sur vos services.",
  })
  @IsString()
  message!: string;
} 