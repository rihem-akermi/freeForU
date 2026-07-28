// dto/create-my-reservation.dto.ts (route CLIENT — pas de clientId, vient du token)
import { IsInt, IsDateString, IsOptional, IsString } from "class-validator";

export class CreateMyReservationDto {
  @IsInt()
  agentId!: number;

  @IsDateString()
  dateReservation!: string;

  @IsOptional()
  @IsInt()
  offerId?: number;

  @IsOptional()
  @IsString()
  customRequest?: string;
}