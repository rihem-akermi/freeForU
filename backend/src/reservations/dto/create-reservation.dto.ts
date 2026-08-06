import { IsInt, IsDateString, IsOptional, IsString, Matches } from "class-validator";

export class CreateReservationDto {
  @IsInt()
  clientId!: number;

  @IsInt()
  agentId!: number;

  @IsDateString()
  dateReservation!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  heureReservation!: string;

  @IsOptional()
  @IsInt()
  offerId?: number;

  @IsOptional()
  @IsString()
  customRequest?: string;
}