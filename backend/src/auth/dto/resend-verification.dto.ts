import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ResendVerificationDto {
  @Transform(trim)
  @IsEmail()
  @MaxLength(255)
  email: string;
}
