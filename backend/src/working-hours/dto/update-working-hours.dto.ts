// dto/update-working-hours.dto.ts
import { IsInt, IsBoolean, IsOptional, IsString, Matches, ValidateNested, Min, Max, ArrayMinSize, ArrayMaxSize } from "class-validator";
import { Type } from "class-transformer";

export class DayHoursDto {
  @IsInt() @Min(0) @Max(6)
  dayOfWeek!: number;

  @IsBoolean()
  isWorking!: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  endTime?: string;
}

export class UpdateWorkingHoursDto {
  @ValidateNested({ each: true })
  @Type(() => DayHoursDto)
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  days!: DayHoursDto[];
}