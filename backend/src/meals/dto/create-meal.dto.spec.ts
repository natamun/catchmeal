import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { CreateMealDto } from './create-meal.dto';

describe('CreateMealDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const items = [{ quantity: 1, kcal: 100, protein: 1, carbs: 1, fat: 1 }];
  const parse = (body: object) =>
    pipe.transform(
      { items, ...body },
      { type: 'body', metatype: CreateMealDto },
    ) as Promise<CreateMealDto>;

  it('should accept a meal without a date', async () => {
    const dto = await parse({});

    expect(dto.loggedAt).toBeUndefined();
  });

  it('should accept a YYYY-MM-DD date', async () => {
    const dto = await parse({ loggedAt: '2026-09-13' });

    expect(dto.loggedAt).toBe('2026-09-13');
  });

  it('should reject a null date', async () => {
    await expect(parse({ loggedAt: null })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should reject a date that does not exist', async () => {
    await expect(parse({ loggedAt: '2026-02-30' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should reject a date carrying a time', async () => {
    await expect(
      parse({ loggedAt: '2026-09-13T00:30:00+02:00' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should trim the name', async () => {
    const dto = await parse({ name: '  Riz-steak  ' });

    expect(dto.name).toBe('Riz-steak');
  });

  it('should turn a blank name into no name', async () => {
    const dto = await parse({ name: '   ' });

    expect(dto.name).toBeNull();
  });

  it('should accept a food line quantity with 2 decimals', async () => {
    const dto = await parse({ items: [{ foodItemId: 3, quantity: 150.25 }] });

    expect(dto.items[0].quantity).toBe(150.25);
  });

  it('should reject a quantity with more than 2 decimals', async () => {
    await expect(
      parse({ items: [{ foodItemId: 3, quantity: 1.005 }] }),
    ).rejects.toThrow(BadRequestException);
  });

  it.each(['kcal', 'protein', 'carbs', 'fat'])(
    'should reject a quick add %s with more than 2 decimals',
    async (field) => {
      await expect(
        parse({ items: [{ ...items[0], [field]: 1.234 }] }),
      ).rejects.toThrow(BadRequestException);
    },
  );
});
