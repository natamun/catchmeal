import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { QuantityUnit } from '../../generated/prisma/enums';

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
  @IsString()
  @MaxLength(32)
  barcode?: string | null;

  @IsNumber()
  @IsPositive()
  baseQuantity: number;

  @IsEnum(QuantityUnit)
  baseUnit: QuantityUnit;

  @IsNumber()
  @Min(0)
  kcal: number;

  @IsNumber()
  @Min(0)
  protein: number;

  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNumber()
  @Min(0)
  fat: number;
}
