import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { UpdateMealDto } from './update-meal.dto';

describe('UpdateMealDto', () => {
  // same options as the global pipe in main.ts
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const parse = (body: object) =>
    pipe.transform(body, {
      type: 'body',
      metatype: UpdateMealDto,
    }) as Promise<UpdateMealDto>;

  it('should accept a body that changes nothing', async () => {
    await expect(parse({})).resolves.toEqual({});
  });

  it('should reject a null date', async () => {
    await expect(parse({ loggedAt: null })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should reject null items', async () => {
    await expect(parse({ items: null })).rejects.toThrow(BadRequestException);
  });

  it('should accept a null name, which clears it', async () => {
    const dto = await parse({ name: null });

    expect(dto.name).toBeNull();
  });

  it('should turn a blank name into no name', async () => {
    const dto = await parse({ name: '   ' });

    expect(dto.name).toBeNull();
  });
});
