import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

export class LogWeightDto {
  @IsNumber()
  @IsPositive()
  @Max(500)
  weight!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(100)
  bodyFat?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(500)
  fatFreeMass?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(100)
  bodyWater?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(500)
  muscleMass?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
