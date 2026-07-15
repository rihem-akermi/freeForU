import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateAgentDto {

  @IsString()
  @IsNotEmpty()
  name!: string;


  @IsEmail()
  email!: string;


  @IsString()
  @MinLength(6)
  password!: string;


  @IsString()
  phone!: string;


  @IsString()
  ville!: string;


  @IsInt()
  category_id!: number;
}