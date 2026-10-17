import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GenerateBioDto {
  @ApiProperty({
    description: "Notes brutes ou description informelle du parcours de l'agent",
    example: "Je suis électricien depuis 8 ans à Sousse, spécialiste des tableaux électriques et du dépannage.",
  })
  @IsString()
  @IsNotEmpty()
  rawBio!: string;
}
