import { IsIn } from "class-validator";

export class UpdateAgentStatusDto {
  @IsIn(["confirmee", "annulee"])
  status!: "confirmee" | "annulee";
}