import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReservationDto {
  @ApiPropertyOptional({
    description: 'Nouveau statut de la réservation',
    enum: ['en_attente', 'confirmee', 'terminee', 'rejetee', 'annulee', 'expiree'],
    example: 'confirmee',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Nouvelle date de la réservation (YYYY-MM-DD)',
    example: '2026-09-12',
  })
  @IsOptional()
  @IsString()
  date_reservation?: string;
}
