import { IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateAgentStatusDto {
  @ApiProperty({
    description: "Statut de réponse de l'agent face à une demande de réservation",
    enum: ["confirmee", "rejetee"],
    example: "confirmee",
  })
  @IsIn(["confirmee", "rejetee"])
  status!: "confirmee" | "rejetee";
}