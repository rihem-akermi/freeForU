import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class SetDayExceptionDto {
  @ApiProperty({
    example: '2026-08-30',
    description: 'Date of the availability exception',
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    example: 'off',
    enum: ['off', 'full'],
    description: 'Type of exception',
  })
  @IsIn(['off', 'full'])
  type!: 'off' | 'full';

  @ApiPropertyOptional({
    example: 'Personal day',
    description: 'Optional reason for the exception',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}