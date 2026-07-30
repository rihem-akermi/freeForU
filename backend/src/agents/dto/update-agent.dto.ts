import { Type } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from "class-validator";


export class UpdatedAgentDto {

  @IsOptional()
  @IsString()
  name?: string;


  @IsOptional()
  @IsEmail()
  email?: string;


  @IsOptional()
  @IsString()
  phone?: string;


  @IsOptional()
  @IsString()
  ville?: string;


  @IsOptional()
  @IsString()
  password?: string;


  @IsOptional()
  @Type(()=>Number)
  @IsInt()
  category_id?: number;


  @IsOptional()
  @IsString()
  bio?: string;


  @IsOptional()
  @IsString()
  zone?: string;


  @IsOptional()
  @IsString()
  service_mode?: string;


  @IsOptional()
  @Type(()=>Number)
  @IsInt()
  @Min(0)
  age?: number;


  @IsOptional()
  @IsString()
  sexe?: string;


  @IsOptional()
  @Type(()=>Number)
  @IsInt()
  @Min(0)
  experience_years?: number;


  @IsOptional()
  social_links?: object;


  @IsOptional()
  @IsString()
  id_card_url?: string;


  @IsOptional()
  @IsString()
  work_certificate_url?: string;

}