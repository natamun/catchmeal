import { Test, TestingModule } from '@nestjs/testing';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { DashboardAnalyticsController } from './dashboard-analytics.controller';
import { PrismaService } from '../prisma/prisma.service';
import { getDefaultAutoSelectFamily } from 'net';

describe('DashboardAnalyticsController', () => {
  let controller: DashboardAnalyticsController;

  const analysticsMock = {
    getDashboard: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardAnalyticsController],
      providers: [
        { provide: DashboardAnalyticsService, useValue: analysticsMock },
      ],
    }).compile();

    controller = module.get<DashboardAnalyticsController>(
      DashboardAnalyticsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', async () => {
    analysticsMock.getDashboard.mockResolvedValue([]);
    const dashboard = await controller.getDashboard(
      1,
      '2026-08-11',
      '2026-08-12',
    );
    expect(dashboard).toEqual([]);
  });

  it('should be call with userId: 1, from: 2026-01-10, to: 2026-01-12', async () => {
    analysticsMock.getDashboard.mockResolvedValue([]);
    const dashboard = await controller.getDashboard(
      1,
      '2026-01-10',
      '2026-01-12',
    );
    expect(analysticsMock.getDashboard).toHaveBeenCalledWith(
      1,
      new Date('2026-01-10'),
      new Date('2026-01-12'),
    );
  });

  it('should be call with userId: 1 and last 7 days', async () => {
    analysticsMock.getDashboard.mockResolvedValue([]);
    const dashboard = await controller.getDashboard(1);
    expect(analysticsMock.getDashboard).toHaveBeenCalledWith(
      1,
      new Date(new Date().setDate(new Date().getDate() - 7)),
      new Date(),
    );
  });
});
