import { ForbiddenException } from '@nestjs/common';
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

  const req = { user: { userId: 7 } };

  it('should create a meal', async () => {
    const dto: CreateMealDto = {
      typeMeal: MealType.LUNCH,
      items: [{ foodItemId: 2, quantity: 150 }],
    };
    mealsServiceMock.create.mockResolvedValue({ id: 5, ...dto });

    await controller.create(7, dto, req);

    expect(mealsServiceMock.create).toHaveBeenCalledWith(7, dto);
  });

  it('should list meals for a user', async () => {
    mealsServiceMock.findAll.mockResolvedValue([]);

    await controller.findAll(7, req);

    expect(mealsServiceMock.findAll).toHaveBeenCalledWith(
      7,
      undefined,
      undefined,
    );
  });

  it('should list only logged meals when logged=true', async () => {
    mealsServiceMock.findAll.mockResolvedValue([]);

    await controller.findAll(7, req, 'true');

    expect(mealsServiceMock.findAll).toHaveBeenCalledWith(7, true, undefined);
  });

  it('should list only template meals when logged=false', async () => {
    mealsServiceMock.findAll.mockResolvedValue([]);

    await controller.findAll(7, req, 'false');

    expect(mealsServiceMock.findAll).toHaveBeenCalledWith(7, false, undefined);
  });

  it('should list meals for a specific date', async () => {
    mealsServiceMock.findAll.mockResolvedValue([]);
    const date = new Date('2026-09-18');

    await controller.findAll(7, req, undefined, date);

    expect(mealsServiceMock.findAll).toHaveBeenCalledWith(7, undefined, date);
  });

  it('should find one meal', async () => {
    mealsServiceMock.findOne.mockResolvedValue({ id: 5 });

    await controller.findOne(7, 5, req);

    expect(mealsServiceMock.findOne).toHaveBeenCalledWith(7, 5);
  });

  it('should update a meal', async () => {
    const dto: UpdateMealDto = { name: 'Riz-steak' };
    mealsServiceMock.update.mockResolvedValue({ id: 5, name: 'Riz-steak' });

    await controller.update(7, 5, dto, req);

    expect(mealsServiceMock.update).toHaveBeenCalledWith(7, 5, dto);
  });

  it('should remove a meal', async () => {
    mealsServiceMock.remove.mockResolvedValue({ id: 5 });

    await controller.remove(7, 5, req);

    expect(mealsServiceMock.remove).toHaveBeenCalledWith(7, 5);
  });

  it('should find a range of meals with explicit from/to', async () => {
    mealsServiceMock.findRange.mockResolvedValue([{ id: 5 }]);
    const from = new Date('2026-09-01');
    const to = new Date('2026-09-18');

    await controller.findRange(7, req, from, to);

    expect(mealsServiceMock.findRange).toHaveBeenCalledWith(7, from, to);
  });

  it('should default "to" to now when only "from" is provided', async () => {
    mealsServiceMock.findRange.mockResolvedValue([]);
    const from = new Date('2026-09-01');

    await controller.findRange(7, req, from, undefined);

    expect(mealsServiceMock.findRange).toHaveBeenCalledWith(
      7,
      from,
      expect.any(Date),
    );
  });

  it('should default "from" to 7 days ago when no dates are provided', async () => {
    mealsServiceMock.findRange.mockResolvedValue([]);

    await controller.findRange(7, req, undefined, undefined);

    expect(mealsServiceMock.findRange).toHaveBeenCalledWith(
      7,
      expect.any(Date),
      expect.any(Date),
    );
  });

  it('should refuse to create a meal for another user', () => {
    const dto: CreateMealDto = {
      typeMeal: MealType.LUNCH,
      items: [{ foodItemId: 2, quantity: 150 }],
    };

    expect(() => controller.create(8, dto, req)).toThrow(ForbiddenException);
    expect(mealsServiceMock.create).not.toHaveBeenCalled();
  });

  it('should refuse to list the meals of another user', () => {
    expect(() => controller.findAll(8, req)).toThrow(ForbiddenException);
    expect(mealsServiceMock.findAll).not.toHaveBeenCalled();
  });

  it('should refuse to list a range of meals of another user', () => {
    expect(() => controller.findRange(8, req)).toThrow(ForbiddenException);
    expect(mealsServiceMock.findRange).not.toHaveBeenCalled();
  });

  it('should refuse to read a meal of another user', () => {
    expect(() => controller.findOne(8, 5, req)).toThrow(ForbiddenException);
    expect(mealsServiceMock.findOne).not.toHaveBeenCalled();
  });

  it('should refuse to update a meal of another user', () => {
    expect(() => controller.update(8, 5, { name: 'Riz-steak' }, req)).toThrow(
      ForbiddenException,
    );
    expect(mealsServiceMock.update).not.toHaveBeenCalled();
  });

  it('should refuse to remove a meal of another user', () => {
    expect(() => controller.remove(8, 5, req)).toThrow(ForbiddenException);
    expect(mealsServiceMock.remove).not.toHaveBeenCalled();
  });
});
