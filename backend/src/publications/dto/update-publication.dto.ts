// dto/update-publication.dto.ts
import { IsString, IsOptional, MaxLength } from "class-validator";

export class UpdatedPublicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  titre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;
}