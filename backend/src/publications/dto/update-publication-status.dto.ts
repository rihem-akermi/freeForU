// dto/update-publication-status.dto.ts
import { IsIn } from "class-validator";

export class UpdatePublicationStatusDto {
  @IsIn(["en_attente", "approuvee", "rejetee"])
  status!: string;
}