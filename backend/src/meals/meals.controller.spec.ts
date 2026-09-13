import { Test, TestingModule } from '@nestjs/testing';

import { MealType } from '../generated/prisma/enums';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';

describe('MealsController', () => {
  let controller: MealsController;

  const mealsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealsController],
      providers: [{ provide: MealsService, useValue: mealsServiceMock }],
    }).compile();

    controller = module.get<MealsController>(MealsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a meal', async () => {
    const dto: CreateMealDto = {
      typeMeal: MealType.LUNCH,
      items: [{ foodItemId: 2, quantity: 150 }],
    };
    mealsServiceMock.create.mockResolvedValue({ id: 5, ...dto });

    await controller.create(7, dto);

    expect(mealsServiceMock.create).toHaveBeenCalledWith(7, dto);
  });

  it('should list meals for a user', async () => {
    mealsServiceMock.findAll.mockResolvedValue([]);

    await controller.findAll(7);

    expect(mealsServiceMock.findAll).toHaveBeenCalledWith(7);
  });

  it('should find one meal', async () => {
    mealsServiceMock.findOne.mockResolvedValue({ id: 5 });

    await controller.findOne(7, 5);

    expect(mealsServiceMock.findOne).toHaveBeenCalledWith(7, 5);
  });

  it('should update a meal', async () => {
    const dto: UpdateMealDto = { name: 'Riz-steak' };
    mealsServiceMock.update.mockResolvedValue({ id: 5, name: 'Riz-steak' });

    await controller.update(7, 5, dto);

    expect(mealsServiceMock.update).toHaveBeenCalledWith(7, 5, dto);
  });

  it('should remove a meal', async () => {
    mealsServiceMock.remove.mockResolvedValue({ id: 5 });

    await controller.remove(7, 5);

    expect(mealsServiceMock.remove).toHaveBeenCalledWith(7, 5);
  });
});
