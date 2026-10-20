import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { UpdateFoodItemDto } from './update-food-item.dto';

describe('UpdateFoodItemDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const parse = (body: object) =>
    pipe.transform(body, {
      type: 'body',
      metatype: UpdateFoodItemDto,
    }) as Promise<UpdateFoodItemDto>;

  it('should accept a partial update', async () => {
    await expect(parse({ kcal: 120 })).resolves.toEqual({ kcal: 120 });
  });

  it.each([
    'name',
    'baseQuantity',
    'baseUnit',
    'kcal',
    'protein',
    'carbs',
    'fat',
  ])('should reject a null %s', async (field) => {
    await expect(parse({ [field]: null })).rejects.toThrow(BadRequestException);
  });

  it.each(['brand', 'barcode'])(
    'should still accept a null %s to clear it',
    async (field) => {
      await expect(parse({ [field]: null })).resolves.toEqual({
        [field]: null,
      });
    },
  );
});
