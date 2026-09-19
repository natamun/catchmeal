import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateProfileDto {
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;
}
