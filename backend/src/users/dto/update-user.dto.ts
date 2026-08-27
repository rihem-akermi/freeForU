import { CreateUserDto } from "./create-user.dto";
import { PartialType, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsEmail, MaxLength } from "class-validator";

export class UpdatedUserDto extends PartialType(CreateUserDto) {}

export class UpdateMyProfileDto {
  @ApiPropertyOptional({
    description: "Nouveau nom complet",
    example: "Amira Mansour",
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: "Nouvelle adresse email",
    example: "amira.mansour@example.com",
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: "Nouveau numéro de téléphone",
    example: "21698765432",
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: "Nouvelle ville de résidence",
    example: "Sousse",
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  ville?: string;
}