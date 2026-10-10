import {
  BadRequestException,
  HttpException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { QuantityUnit } from '../generated/prisma/enums';
import { OpenFoodFactsService } from './open-food-facts.service';

const NUTELLA = '3017620422003';
const COCA = '5449000000996';
const WATER = '7610200337467';

const nutellaBody = {
  code: NUTELLA,
  status: 'success',
  result: { id: 'product_found' },
  product: {
    product_name: 'Nutella',
    product_name_fr: 'Nutella',
    brands: 'Nutella, Ferrero',
    product_quantity_unit: 'g',
    nutriments: {
      'energy-kcal_100g': 539,
      'energy-kj_100g': 2252,
      energy_100g: 2252,
      proteins_100g: 6.3,
      carbohydrates_100g: 57.5,
      fat_100g: 30.9,
    },
  },
};

const cocaBody = {
  code: COCA,
  status: 'success',
  product: {
    product_name: 'Coca-Cola Original',
    brands: 'COCA-COLA SERVICES SA/NV',
    product_quantity_unit: 'ml',
    nutriments: {
      'energy-kcal_100g': 42.4,
      'energy-kj_100g': 180,
      proteins_100g: 0,
      carbohydrates_100g: 10.6,
      fat_100g: 0,
    },
  },
};

const waterBody = {
  code: WATER,
  status: 'success',
  product: {
    product_name: 'Eau naturelle',
    product_name_fr: 'Eau naturelle',
    brands: 'M Budget, M-Budget',
    product_quantity_unit: 'ml',
    nutriments: { 'added-sugars': 0, 'added-sugars_100g': 0 },
  },
};

const notFoundBody = {
  code: '4000000000006',
  status: 'failure',
  result: { id: 'product_not_found' },
  errors: [{ message: { id: 'product_not_found' } }],
};

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status });

const ean13 = (n: number) => {
  const digits = `40000000${String(n).padStart(4, '0')}`;
  const sum = digits
    .split('')
    .reduce((acc, digit, i) => acc + Number(digit) * (i % 2 === 0 ? 1 : 3), 0);
  return `${digits}${(10 - (sum % 10)) % 10}`;
};

describe('OpenFoodFactsService', () => {
  let service: OpenFoodFactsService;
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(async () => {
    jest.restoreAllMocks();
    fetchMock = jest.spyOn(globalThis, 'fetch');
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenFoodFactsService],
    }).compile();

    service = module.get<OpenFoodFactsService>(OpenFoodFactsService);
  });

  it('should return a product converted to our format', async () => {
    fetchMock.mockResolvedValue(json(nutellaBody));

    await expect(service.lookup(NUTELLA)).resolves.toEqual({
      barcode: NUTELLA,
      name: 'Nutella',
      brand: 'Nutella',
      baseQuantity: 100,
      baseUnit: QuantityUnit.GRAM,
      kcal: 539,
      protein: 6.3,
      carbs: 57.5,
      fat: 30.9,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/api/v3.4/product/${NUTELLA}?fields=`),
      expect.objectContaining({
        headers: { 'User-Agent': expect.any(String) as string },
      }),
    );
  });

  it('should use millilitres for a drink', async () => {
    fetchMock.mockResolvedValue(json(cocaBody));

    await expect(service.lookup(COCA)).resolves.toMatchObject({
      name: 'Coca-Cola Original',
      baseQuantity: 100,
      baseUnit: QuantityUnit.MILLILITER,
      kcal: 42.4,
      carbs: 10.6,
    });
  });

  it('should ask for quantity, without which the unit is not returned', async () => {
    fetchMock.mockResolvedValue(json(cocaBody));

    await service.lookup(COCA);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('quantity,product_quantity_unit'),
      expect.anything(),
    );
  });

  it('should leave empty what Open Food Facts does not have', async () => {
    fetchMock.mockResolvedValue(json(waterBody));

    await expect(service.lookup(WATER)).resolves.toMatchObject({
      name: 'Eau naturelle',
      brand: 'M Budget',
      kcal: null,
      protein: null,
      carbs: null,
      fat: null,
    });
  });

  it('should compute kcal from kJ when kcal is missing', async () => {
    fetchMock.mockResolvedValue(
      json({
        code: NUTELLA,
        product: { nutriments: { 'energy-kj_100g': 2252 } },
      }),
    );

    await expect(service.lookup(NUTELLA)).resolves.toMatchObject({
      name: null,
      kcal: 538.2,
    });
  });

  it('should prefer the French name', async () => {
    fetchMock.mockResolvedValue(
      json({
        code: WATER,
        product: {
          product_name: 'Wasser ohne',
          product_name_fr: 'Eau naturelle',
        },
      }),
    );

    await expect(service.lookup(WATER)).resolves.toMatchObject({
      name: 'Eau naturelle',
    });
  });

  it('should answer from the cache on a second lookup', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json(nutellaBody)));

    await service.lookup(NUTELLA);
    await service.lookup(NUTELLA);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should call Open Food Facts again once the cached product is a day old', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json(nutellaBody)));
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

    await service.lookup(NUTELLA);
    now.mockReturnValue(1_000_000 + 24 * 60 * 60 * 1000 + 1);
    await service.lookup(NUTELLA);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should treat a 12-digit code and its 13-digit form as one product', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(json({ ...nutellaBody, code: '0034000470693' })),
    );

    await service.lookup('034000470693');
    await service.lookup('0034000470693');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/product/0034000470693?'),
      expect.anything(),
    );
  });

  it('should reject a barcode that is not 8 to 14 digits', async () => {
    await expect(service.lookup('abc')).rejects.toThrow(BadRequestException);
    await expect(service.lookup('1234567')).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.lookup(`${NUTELLA}/../x`)).rejects.toThrow(
      BadRequestException,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should reject a barcode with a wrong check digit', async () => {
    await expect(service.lookup('3017620422004')).rejects.toThrow(
      BadRequestException,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should report a product Open Food Facts does not know, and remember it', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(json(notFoundBody, 404)),
    );

    await expect(service.lookup('4000000000006')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.lookup('4000000000006')).rejects.toThrow(
      NotFoundException,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should report Open Food Facts answering an error page, without caching it', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        new Response('<html>Page temporarily unavailable</html>', {
          status: 503,
        }),
      ),
    );

    await expect(service.lookup(NUTELLA)).rejects.toThrow(
      ServiceUnavailableException,
    );
    await expect(service.lookup(NUTELLA)).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should report a body that is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html></html>'));

    await expect(service.lookup(NUTELLA)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('should report a timeout or a network failure', async () => {
    fetchMock.mockRejectedValue(new Error('The operation timed out'));

    await expect(service.lookup(NUTELLA)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('should stop calling Open Food Facts past 12 lookups in a minute', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json(nutellaBody)));
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

    for (let i = 0; i < 12; i++) await service.lookup(ean13(i));
    const refused = service.lookup(ean13(12));

    await expect(refused).rejects.toThrow(HttpException);
    await expect(refused).rejects.toMatchObject({ status: 429 });
    expect(fetchMock).toHaveBeenCalledTimes(12);

    now.mockReturnValue(1_000_000 + 60_001);
    await service.lookup(ean13(12));

    expect(fetchMock).toHaveBeenCalledTimes(13);
  });
});
