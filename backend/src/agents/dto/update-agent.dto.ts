import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString
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
  @IsInt()
  category_id?: number;


  @IsOptional()
  @IsString()
  photo_url?: string;


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
  @IsNumber()
  tarif_min?: number;


  @IsOptional()
  @IsNumber()
  tarif_max?: number;


  @IsOptional()
  @IsInt()
  age?: number;


  @IsOptional()
  @IsString()
  sexe?: string;


  @IsOptional()
  @IsInt()
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