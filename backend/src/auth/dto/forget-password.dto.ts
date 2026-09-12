import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ahmed@example.com', description: 'Account email to send the reset code to' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

