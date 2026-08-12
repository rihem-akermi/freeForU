import { IsInt } from "class-validator";
import { BaseReservationDto } from "./base-reservation.dto";

export class CreateReservationDto extends BaseReservationDto {
  @IsInt()
  clientId!: number;
}