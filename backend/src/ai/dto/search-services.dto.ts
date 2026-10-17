import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SearchServicesDto {
  @ApiProperty({
    description: "Requête de recherche textuelle pour trouver des prestations similaires par embedding",
    example: "réparation fuite lavabo",
  })
  @IsString()
  @IsNotEmpty()
  query!: string;
}
