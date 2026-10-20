import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const parse = (body: object) =>
    pipe.transform(body, {
      type: 'body',
      metatype: UpdateProfileDto,
    }) as Promise<UpdateProfileDto>;

  it('should accept measures with up to 2 decimals', async () => {
    const dto = await parse({
      height: 180.5,
      targetWeight: 72.25,
      bodyFat: 18.4,
    });

    expect(dto.targetWeight).toBe(72.25);
  });

  it.each([
    'height',
    'targetWeight',
    'bodyFat',
    'fatFreeMass',
    'bodyWater',
    'muscleMass',
  ])('should reject a %s with more than 2 decimals', async (field) => {
    await expect(parse({ [field]: 50.123 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should accept whole numbers as goals', async () => {
    const dto = await parse({ dailyCalorieGoal: 2000, dailyProteinGoal: 150 });

    expect(dto.dailyCalorieGoal).toBe(2000);
  });

  it.each([
    'dailyCalorieGoal',
    'dailyProteinGoal',
    'dailyCarbsGoal',
    'dailyFatGoal',
  ])('should reject a %s that is not a whole number', async (field) => {
    await expect(parse({ [field]: 150.5 })).rejects.toThrow(
      BadRequestException,
    );
  });
});
