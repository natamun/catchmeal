import { Test, TestingModule } from '@nestjs/testing';

import { QuantityUnit } from '../generated/prisma/enums';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { UpdateFoodItemDto } from './dto/update-food-item.dto';
import { FoodItemsController } from './food-items.controller';
import { FoodItemsService } from './food-items.service';

describe('FoodItemsController', () => {
  let controller: FoodItemsController;

  const foodItemsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodItemsController],
      providers: [
        { provide: FoodItemsService, useValue: foodItemsServiceMock },
      ],
    }).compile();

    controller = module.get<FoodItemsController>(FoodItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a food item', async () => {
    const dto: CreateFoodItemDto = {
      name: 'Riz blanc',
      brand: 'Danone',
      baseQuantity: 100,
      baseUnit: QuantityUnit.GRAM,
      kcal: 130,
      protein: 2.4,
      carbs: 28,
      fat: 0.3,
    };
    foodItemsServiceMock.create.mockResolvedValue({ id: 1, userId: 2, ...dto });

    await controller.create(2, dto);

    expect(foodItemsServiceMock.create).toHaveBeenCalledWith(2, dto);
  });

  it('should list food items for a user', async () => {
    foodItemsServiceMock.findAll.mockResolvedValue([]);

    await controller.findAll(2);

    expect(foodItemsServiceMock.findAll).toHaveBeenCalledWith(2);
  });

  it('should find one food item', async () => {
    foodItemsServiceMock.findOne.mockResolvedValue({ id: 1 });

    await controller.findOne(2, 1);

    expect(foodItemsServiceMock.findOne).toHaveBeenCalledWith(2, 1);
  });

  it('should update a food item', async () => {
    const dto: UpdateFoodItemDto = { name: 'Riz complet' };
    foodItemsServiceMock.update.mockResolvedValue({
      id: 1,
      name: 'Riz complet',
    });

    await controller.update(2, 1, dto);

    expect(foodItemsServiceMock.update).toHaveBeenCalledWith(2, 1, dto);
  });

  it('should archive a food item', async () => {
    foodItemsServiceMock.archive.mockResolvedValue({ id: 1, archived: true });

    await controller.archive(2, 1);

    expect(foodItemsServiceMock.archive).toHaveBeenCalledWith(2, 1);
  });
});
