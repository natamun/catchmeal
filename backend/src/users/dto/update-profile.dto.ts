import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ActivityLevel, Gender } from '../../generated/prisma/client';

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

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(300)
  height?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(500)
  targetWeight?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(10000)
  dailyCalorieGoal?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(1000)
  dailyProteinGoal?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(2000)
  dailyCarbsGoal?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(1000)
  dailyFatGoal?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(100)
  bodyFat?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(100)
  skeletalMuscle?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(500)
  fatFreeMass?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(100)
  subcutaneousFat?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(30)
  visceralFat?: number;

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
  @IsNumber()
  @IsPositive()
  @Max(20)
  boneMass?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(100)
  protein?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(120)
  metabolicAge?: number;
}
