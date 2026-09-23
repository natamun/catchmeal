import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
  @IsInt()
  @IsPositive()
  toUserId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
