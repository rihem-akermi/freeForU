// update-offer.dto.ts
import { Transform, Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsBoolean,
} from "class-validator";

export class UpdatedOfferDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  active?: boolean;
}
