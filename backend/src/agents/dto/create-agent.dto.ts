import { IsBoolean, IsString } from "class-validator";

export class CreateAgentDto {
  @IsString()
  cin!: string;

  @IsString()
  name!: string;
  //name must be a string 
  @IsString()
  category!: string;

  @IsString()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  password!: string;

  @IsString()
  ville!: string;

  @IsBoolean()
  published!: boolean;

}

