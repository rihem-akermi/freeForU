// update-offer.dto.ts
import { IsString, IsOptional, IsNumber, Min, MaxLength, IsBoolean } from "class-validator";

export class UpdatedOfferDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_price?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}