import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class AskAssistantDto {
  @IsString()
  @MinLength(1) 
  @MaxLength(500) //empeche un msg abusif (trop long) -> (-tokens)
  message!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}