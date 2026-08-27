// dto/update-publication-status.dto.ts
import { IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePublicationStatusDto {
  @ApiProperty({
    description: "Statut de modération de la publication",
    enum: ["en_attente", "approuvee", "rejetee"],
    example: "approuvee",
  })
  @IsIn(["en_attente", "approuvee", "rejetee"])
  status!: string;
}