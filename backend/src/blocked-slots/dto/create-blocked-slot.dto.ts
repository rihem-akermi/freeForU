import { IsDateString, IsOptional, IsString, IsIn, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBlockedSlotDto {
  @ApiProperty({
    description: "Date du créneau bloqué (format YYYY-MM-DD)",
    example: "2026-09-01",
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    description: "Type de blocage (off: jour de repos, full: journée pleine)",
    enum: ["off", "full"],
    example: "off",
  })
  @IsIn(["off", "full"])
  type!: "off" | "full";

  @ApiPropertyOptional({
    description: "Raison du blocage",
    example: "Congé annuel",
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}