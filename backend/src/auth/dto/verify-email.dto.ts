import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyEmailDto {
  @ApiProperty({
    example: "rihem@example.com",
    description: "Email address to verify",
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: "161004",
    description: "6-digit OTP code sent by email",
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}
