// base-reservation.dto.ts
import { IsInt, IsDateString, IsString, IsOptional, Matches, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BaseReservationDto {
  @ApiProperty({
    description: "Identifiant de l'agent réservé",
    example: 1,
  })
  @IsInt()
  agentId!: number;

  @ApiPropertyOptional({
    description: "Identifiant du service choisi (optionnel si demande personnalisée)",
    example: 2,
  })
  @IsOptional()
  @IsInt()
  serviceId?: number;

  @ApiPropertyOptional({
    description: "Description de la demande personnalisée",
    example: "Réparation urgente d'une fuite sous l'évier",
    minLength: 5,
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: "Décrivez votre besoin en quelques mots" })
  customRequest?: string;

  @ApiProperty({
    description: "Date de la réservation (YYYY-MM-DD)",
    example: "2026-09-10",
  })
  @IsDateString()
  dateReservation!: string;

  @ApiProperty({
    description: "Heure de début de la réservation (HH:mm)",
    example: "14:00",
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  heureReservation!: string;

  @ApiPropertyOptional({
    description: "Heure de fin estimée de la réservation (HH:mm)",
    example: "15:30",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  heureFinReservation?: string;
}