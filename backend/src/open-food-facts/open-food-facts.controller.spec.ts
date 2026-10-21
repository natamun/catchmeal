import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { OpenFoodFactsController } from './open-food-facts.controller';
import { OpenFoodFactsService } from './open-food-facts.service';

describe('OpenFoodFactsController', () => {
  let controller: OpenFoodFactsController;

  const openFoodFactsServiceMock = {
    lookup: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenFoodFactsController],
      providers: [
        { provide: OpenFoodFactsService, useValue: openFoodFactsServiceMock },
      ],
    }).compile();

    controller = module.get<OpenFoodFactsController>(OpenFoodFactsController);
  });

  const req = { user: { userId: 7 } };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should look up a product by its barcode', async () => {
    openFoodFactsServiceMock.lookup.mockResolvedValue({ name: 'Nutella' });

    await expect(controller.lookup(7, '3017620422003', req)).resolves.toEqual({
      product: { name: 'Nutella' },
    });
    expect(openFoodFactsServiceMock.lookup).toHaveBeenCalledWith(
      '3017620422003',
    );
  });

  it('should answer no product, without an error, for an unknown barcode', async () => {
    openFoodFactsServiceMock.lookup.mockResolvedValue(null);

    await expect(controller.lookup(7, '4000000000006', req)).resolves.toEqual({
      product: null,
    });
  });

  it('should refuse to look up a product for another user', () => {
    expect(() => controller.lookup(8, '3017620422003', req)).toThrow(
      ForbiddenException,
    );
    expect(openFoodFactsServiceMock.lookup).not.toHaveBeenCalled();
  });
});
