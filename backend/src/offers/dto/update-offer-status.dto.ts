// dto/update-offer-status.dto.ts
import { IsIn } from "class-validator";

export class UpdateOfferStatusDto {
  @IsIn(["en_attente", "approuvee", "rejetee"])
  status!: string;
}