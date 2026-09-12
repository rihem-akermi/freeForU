import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '042917', description: '6-digit OTP code' })
  @IsString()
  @Length(6, 6)
  code!: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}