import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CompleteOAuthProfileDto {
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name: string;

  @Transform(trim)
  @IsEmail()
  @MaxLength(255)
  email: string;
}
