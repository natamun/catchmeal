import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  message: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
