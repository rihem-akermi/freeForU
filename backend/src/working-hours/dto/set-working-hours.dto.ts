import { IsInt, IsString, IsDateString, Matches, Min, Max, IsBoolean, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class WorkingHourDto {
  @ApiProperty({
    description: "Date du début de la semaine (YYYY-MM-DD)",
    example: "2026-09-06",
  })
  @IsDateString()
  week_start!: string; // "YYYY-MM-DD" — dimanche de la semaine

  @ApiProperty({
    description: "Jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)",
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week!: number;

  @ApiProperty({
    description: "Indique si l'agent travaille ce jour-là",
    example: true,
  })
  @IsBoolean()
  is_working!: boolean;

  @ApiPropertyOptional({
    description: "Heure de début (HH:mm)",
    example: "09:00",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  start_time?: string;

  @ApiPropertyOptional({
    description: "Heure de fin (HH:mm)",
    example: "18:00",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  end_time?: string;
}
