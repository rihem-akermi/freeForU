import { IsDateString, IsOptional, IsString, IsIn, MaxLength } from "class-validator";

export class CreateBlockedSlotDto {
  @IsDateString()
  date!: string;

  @IsIn(["off", "full"])
  type!: "off" | "full";

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}