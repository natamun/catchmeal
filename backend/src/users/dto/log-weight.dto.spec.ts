import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { LogWeightDto } from './log-weight.dto';

describe('LogWeightDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const parse = (body: object) =>
    pipe.transform(
      { weight: 72.5, ...body },
      { type: 'body', metatype: LogWeightDto },
    ) as Promise<LogWeightDto>;

  it('should accept a weigh-in with up to 2 decimals', async () => {
    const dto = await parse({ weight: 72.55, bodyFat: 18.4 });

    expect(dto.weight).toBe(72.55);
  });

  it.each(['weight', 'bodyFat', 'fatFreeMass', 'bodyWater', 'muscleMass'])(
    'should reject a %s with more than 2 decimals',
    async (field) => {
      await expect(parse({ [field]: 50.123 })).rejects.toThrow(
        BadRequestException,
      );
    },
  );
});
