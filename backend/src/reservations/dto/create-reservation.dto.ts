import { IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BaseReservationDto } from "./base-reservation.dto";

export class CreateReservationDto extends BaseReservationDto {
  @ApiProperty({
    description: "Identifiant du client pour qui la réservation est créée",
    example: 3,
  })
  @IsInt()
  clientId!: number;
}