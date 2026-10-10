import {
  IsInt,
  IsNotEmpty,
  IsOptional,
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

  @IsOptional()
  @IsInt()
  @IsPositive()
  activityId?: number;
}
