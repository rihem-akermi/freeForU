// base-reservation.dto.ts
import { IsInt, IsDateString, IsString, IsOptional, Matches, MinLength } from "class-validator";

export class BaseReservationDto {
  @IsInt()
  agentId!: number;

  @IsOptional()
  @IsInt()
  serviceId?: number;

  @IsOptional()
  @IsString()
  @MinLength(5, { message: "Décrivez votre besoin en quelques mots" })
  customRequest?: string;

  @IsDateString()
  dateReservation!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  heureReservation!: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  heureFinReservation?: string;
}