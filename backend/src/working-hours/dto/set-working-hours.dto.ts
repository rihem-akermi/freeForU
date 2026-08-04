// dto/set-working-hours.dto.ts
import { IsInt, IsString, Matches, Min, Max } from "class-validator";

export class WorkingHourDto {
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week!: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  start_time!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  //regex : format precis 
  end_time!: string;
}