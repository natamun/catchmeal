import { PartialType } from '@nestjs/mapped-types';

import { CreateFoodItemDto } from './create-food-item.dto';

export class UpdateFoodItemDto extends PartialType(CreateFoodItemDto, {
  skipNullProperties: false,
}) {}
