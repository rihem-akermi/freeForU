import { CreateUserDto } from "./create-user.dto";
import { PartialType } from "@nestjs/mapped-types";
import { IsString, IsOptional, IsEmail, MaxLength } from "class-validator";

export class UpdatedUserDto extends PartialType(CreateUserDto){}



export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ville?: string;
}