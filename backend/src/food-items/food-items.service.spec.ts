import { Test, TestingModule } from '@nestjs/testing';

import { QuantityUnit } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodItemDto } from './dto/create-food-item.dto';
import { FoodItemsService } from './food-items.service';

describe('FoodItemsService', () => {
  let service: FoodItemsService;

  const prismaMock = {
    foodItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodItemsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<FoodItemsService>(FoodItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a food item with the userId merged in', async () => {
    const dto: CreateFoodItemDto = {
      name: 'Riz blanc',
      baseQuantity: 100,
      baseUnit: QuantityUnit.GRAM,
      kcal: 130,
      protein: 2.4,
      carbs: 28,
      fat: 0.3,
    };
    prismaMock.foodItem.create.mockResolvedValue({ id: 1, userId: 2, ...dto });

    await service.create(2, dto);

    expect(prismaMock.foodItem.create).toHaveBeenCalledWith({
      data: { ...dto, userId: 2 },
    });
  });

  it('should list non-archived food items for a user', async () => {
    prismaMock.foodItem.findMany.mockResolvedValue([]);

    await service.findAll(2);

    expect(prismaMock.foodItem.findMany).toHaveBeenCalledWith({
      where: { userId: 2, archived: false },
    });
  });

  it('should find one food item scoped to its owner', async () => {
    prismaMock.foodItem.findFirstOrThrow.mockResolvedValue({ id: 1 });

    await service.findOne(2, 1);

    expect(prismaMock.foodItem.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: 1, userId: 2 },
    });
  });

  it('should update a food item using the composite unique key', async () => {
    prismaMock.foodItem.update.mockResolvedValue({ id: 1 });

    await service.update(2, 1, { name: 'Riz complet' });

    expect(prismaMock.foodItem.update).toHaveBeenCalledWith({
      where: { id_userId: { id: 1, userId: 2 } },
      data: { name: 'Riz complet' },
    });
  });

  it('should archive a food item instead of deleting it', async () => {
    prismaMock.foodItem.update.mockResolvedValue({ id: 1, archived: true });

    await service.archive(2, 1);

    expect(prismaMock.foodItem.update).toHaveBeenCalledWith({
      where: { id_userId: { id: 1, userId: 2 } },
      data: { archived: true },
    });
  });
});
