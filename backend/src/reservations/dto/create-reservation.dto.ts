import { IsInt, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  clientId!: number;

  @IsInt()
  agentId!: number;

  @IsString()
  dateReservation!: string;
}