import { IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  clientCin!: string;

  @IsString()
  agentCin!: string;

  @IsString()
  dateReservation!: string;
}