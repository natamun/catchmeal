import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { MealType } from '../../generated/prisma/enums';
import { DATE_ONLY_PATTERN } from '../pipes/parse-date-only.pipe';

const trimOrNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

const isQuickAdd = (dto: CreateMealItemDto) => dto.foodItemId === undefined;

const isDefined = (_: unknown, value: unknown) => value !== undefined;

export class CreateMealItemDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  foodItemId?: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @ValidateIf(isQuickAdd)
  @IsNumber()
  @Min(0)
  kcal?: number;

  @ValidateIf(isQuickAdd)
  @IsNumber()
  @Min(0)
  protein?: number;

  @ValidateIf(isQuickAdd)
  @IsNumber()
  @Min(0)
  carbs?: number;

  @ValidateIf(isQuickAdd)
  @IsNumber()
  @Min(0)
  fat?: number;
}

export class CreateMealDto {
  @Transform(trimOrNull)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string | null;

  @IsOptional()
  @IsEnum(MealType)
  typeMeal?: MealType;

  @ValidateIf(isDefined)
  @Matches(DATE_ONLY_PATTERN, {
    message: 'loggedAt must be formatted as YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  loggedAt?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMealItemDto)
  items: CreateMealItemDto[];
}
