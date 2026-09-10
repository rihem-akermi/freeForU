import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';

export class ResendOtpDto {
  @ApiProperty({
    example: 'ahmed@example.com',
    description: 'Email address to resend the verification code to',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'EMAIL_VERIFICATION',
    enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'],
    description: 'What this OTP code is being used for',
  })
  @IsIn(['EMAIL_VERIFICATION', 'PASSWORD_RESET'])
  purpose!: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
}