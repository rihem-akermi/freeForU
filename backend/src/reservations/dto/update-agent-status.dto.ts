import { IsIn } from "class-validator";

export class UpdateAgentStatusDto {
  @IsIn(["confirmee", "rejetee"])
  status!: "confirmee" | "rejetee";
}