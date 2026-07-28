// dto/create-publication.dto.ts
import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CreatePublicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titre!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

}