import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

import { QuantityUnit } from '../../generated/prisma/enums';

export class CreateFoodItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

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
