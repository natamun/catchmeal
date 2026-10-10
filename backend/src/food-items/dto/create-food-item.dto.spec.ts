import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { QuantityUnit } from '../../generated/prisma/enums';
import { CreateFoodItemDto } from './create-food-item.dto';

describe('CreateFoodItemDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const food = {
    name: 'Riz blanc',
    baseQuantity: 100,
    baseUnit: QuantityUnit.GRAM,
    kcal: 130,
    protein: 2.4,
    carbs: 28,
    fat: 0.3,
  };
  const parse = (body: object) =>
    pipe.transform(
      { ...food, ...body },
      { type: 'body', metatype: CreateFoodItemDto },
    ) as Promise<CreateFoodItemDto>;

  it('should trim the brand', async () => {
    const dto = await parse({ brand: '  Danone  ' });

    expect(dto.brand).toBe('Danone');
  });

  it('should turn a blank brand into no brand', async () => {
    const dto = await parse({ brand: '   ' });

    expect(dto.brand).toBeNull();
  });

  it('should turn a blank barcode into no barcode', async () => {
    const dto = await parse({ barcode: '   ' });

    expect(dto.barcode).toBeNull();
  });

  it('should accept a barcode of 8 to 14 digits', async () => {
    const dto = await parse({ barcode: ' 3017620422003 ' });

    expect(dto.barcode).toBe('3017620422003');
  });

  it('should reject a barcode that is not 8 to 14 digits', async () => {
    await expect(parse({ barcode: '1234567' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(parse({ barcode: '301762042200A' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      parse({ barcode: '12345678901234567890123456789012' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject a blank name', async () => {
    await expect(parse({ name: '   ' })).rejects.toThrow(BadRequestException);
  });
});
