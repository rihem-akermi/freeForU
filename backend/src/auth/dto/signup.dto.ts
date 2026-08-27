import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'Ahmed Ben Ali',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'ahmed@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    example: 'Sousse',
    description: 'User city',
  })
  @IsString()
  @IsNotEmpty()
  ville!: string;

  @ApiProperty({
    example: '20 123 456',
    description: 'User phone number',
  })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({
    example: 'CLIENT',
    enum: ['CLIENT', 'AGENT'],
    description: 'Account role',
  })
  @IsIn(['CLIENT', 'AGENT'])
  role!: 'CLIENT' | 'AGENT';

  @ApiPropertyOptional({
    example: 3,
    description: 'Category ID, required when registering as an agent',
  })
  @IsOptional()
  @IsInt()
  category_id?: number;
}