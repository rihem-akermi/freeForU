import { IsDateString, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class CreateBlockedSlotDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  start_time?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  end_time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}