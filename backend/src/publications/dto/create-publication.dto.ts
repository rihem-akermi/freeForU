// dto/create-publication.dto.ts
import { IsString, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePublicationDto {
  @ApiProperty({
    description: "Titre de la publication / réalisation",
    example: "Rénovation salle de bain moderne",
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titre!: string;

  @ApiProperty({
    description: "Description détaillée de la réalisation",
    example: "Installation complète de plomberie et pose de carrelage en 3 jours.",
  })
  @IsString()
  @IsNotEmpty()
  description!: string;
}