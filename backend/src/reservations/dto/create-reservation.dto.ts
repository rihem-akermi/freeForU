import { IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  clientId!: string;

  @IsString()
  agentId!: string;

  @IsString()
  dateReservation!: string;
}