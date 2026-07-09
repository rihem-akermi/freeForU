import { IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  cin!: string;
  @IsString()
  name!: string;
  @IsString()
  email!: string;
  @IsString()
  phone!: string;
  @IsString()
  password! : string;
  @IsString()
  role!: "CLIENT" | "ADMIN";
  @IsString()
  ville!: string ;
}