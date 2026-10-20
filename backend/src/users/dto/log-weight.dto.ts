import { IsNumber, IsOptional, IsPositive, Max } from 'class-validator';

const MAX_DECIMALS = 2;

export class LogWeightDto {
  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @IsPositive()
  @Max(500)
  weight!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @IsPositive()
  @Max(100)
  bodyFat?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @IsPositive()
  @Max(500)
  fatFreeMass?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @IsPositive()
  @Max(100)
  bodyWater?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @IsPositive()
  @Max(500)
  muscleMass?: number;
}
