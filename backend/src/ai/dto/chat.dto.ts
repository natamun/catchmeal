import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ChatDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  message: string;
}
