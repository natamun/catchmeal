import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

import { QuantityUnit } from '../../generated/prisma/enums';

const MAX_DECIMALS = 2;

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const trimOrNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

export class CreateFoodItemDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @Transform(trimOrNull)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  brand?: string | null;

  @Transform(trimOrNull)
  @IsOptional()
  @Matches(/^\d{8,14}$/, { message: 'barcode must be 8 to 14 digits' })
  barcode?: string | null;

  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @IsPositive()
  baseQuantity: number;

  @IsEnum(QuantityUnit)
  baseUnit: QuantityUnit;

  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @Min(0)
  kcal: number;

  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @Min(0)
  protein: number;

  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @Min(0)
  carbs: number;

  @IsNumber({ maxDecimalPlaces: MAX_DECIMALS })
  @Min(0)
  fat: number;
}
