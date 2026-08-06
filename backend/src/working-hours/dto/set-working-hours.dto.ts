import { IsInt, IsString, IsDateString, Matches, Min, Max, IsBoolean, IsOptional } from "class-validator";

export class WorkingHourDto {
  @IsDateString()
  week_start!: string; // "YYYY-MM-DD" — dimanche de la semaine

  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week!: number;

  @IsBoolean()
  is_working!: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  start_time?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  end_time?: string;
}
