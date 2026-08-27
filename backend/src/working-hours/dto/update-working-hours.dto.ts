// dto/update-working-hours.dto.ts
import { IsInt, IsBoolean, IsOptional, IsString, Matches, ValidateNested, Min, Max, ArrayMinSize, ArrayMaxSize } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DayHoursDto {
  @ApiProperty({
    description: "Jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)",
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsInt() @Min(0) @Max(6)
  dayOfWeek!: number;

  @ApiProperty({
    description: "Indique si l'agent travaille ce jour-là",
    example: true,
  })
  @IsBoolean()
  isWorking!: boolean;

  @ApiPropertyOptional({
    description: "Heure de début de service (HH:mm)",
    example: "08:00",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  startTime?: string;

  @ApiPropertyOptional({
    description: "Heure de fin de service (HH:mm)",
    example: "17:00",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format attendu: HH:mm" })
  endTime?: string;
}

export class UpdateWorkingHoursDto {
  @ApiProperty({
    description: "Configuration des 7 jours de la semaine",
    type: [DayHoursDto],
  })
  @ValidateNested({ each: true })
  @Type(() => DayHoursDto)
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  days!: DayHoursDto[];
}