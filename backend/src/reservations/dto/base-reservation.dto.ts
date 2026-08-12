import {
  IsInt,
  IsDateString,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class BaseReservationDto {
  @IsInt()
  agentId!: number;

  @IsInt()
  serviceId!: number; // ← ajouté

  @IsDateString()
  dateReservation!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Format attendu: HH:mm",
  })
  heureReservation!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Format attendu: HH:mm",
  })
  heureFinReservation!: string;

  @IsString()
  @MinLength(5, {
    message: "Décrivez votre besoin en quelques mots",
  })
  customRequest!: string;
}