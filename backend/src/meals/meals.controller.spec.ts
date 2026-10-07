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
    findRange: jest.fn(),
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

    expect(mealsServiceMock.findAll).toHaveBeenCalledWith(
      7,
      undefined,
      undefined,
    );
  });

  it('should list only logged meals when logged=true', async () => {
    mealsServiceMock.findAll.mockResolvedValue([]);

    await controller.findAll(7, true);

    expect(mealsServiceMock.findAll).toHaveBeenCalledWith(7, true, undefined);
  });

  it('should list only template meals when logged=false', async () => {
    mealsServiceMock.findAll.mockResolvedValue([]);

    await controller.findAll(7, false);

    expect(mealsServiceMock.findAll).toHaveBeenCalledWith(7, false, undefined);
  });

  it('should list meals for a specific date', async () => {
    mealsServiceMock.findAll.mockResolvedValue([]);
    const date = new Date('2026-09-18');

    await controller.findAll(7, undefined, date);

    expect(mealsServiceMock.findAll).toHaveBeenCalledWith(7, undefined, date);
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

  it('should find a range of meals with explicit from/to', async () => {
    mealsServiceMock.findRange.mockResolvedValue([{ id: 5 }]);
    const from = new Date('2026-09-01');
    const to = new Date('2026-09-18');

    await controller.findRange(7, from, to);

    expect(mealsServiceMock.findRange).toHaveBeenCalledWith(7, from, to);
  });

  it('should default "to" to now when only "from" is provided', async () => {
    mealsServiceMock.findRange.mockResolvedValue([]);
    const from = new Date('2026-09-01');

    await controller.findRange(7, from, undefined);

    expect(mealsServiceMock.findRange).toHaveBeenCalledWith(
      7,
      from,
      expect.any(Date),
    );
  });

  it('should default "from" to 7 days ago when no dates are provided', async () => {
    mealsServiceMock.findRange.mockResolvedValue([]);

    await controller.findRange(7, undefined, undefined);

    expect(mealsServiceMock.findRange).toHaveBeenCalledWith(
      7,
      expect.any(Date),
      expect.any(Date),
    );
  });
});
