import { Test, TestingModule } from '@nestjs/testing';

import { DashboardAnalyticsController } from './dashboard-analytics.controller';
import { DashboardAnalyticsService } from './dashboard-analytics.service';

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
      new Date('2026-08-11'),
      new Date('2026-08-12'),
    );
    expect(dashboard).toEqual([]);
  });

  it('should be call with userId: 1, from: 2026-01-10, to: 2026-01-12', async () => {
    analysticsMock.getDashboard.mockResolvedValue([]);
    await controller.getDashboard(
      1,
      new Date('2026-01-10'),
      new Date('2026-01-12'),
    );
    expect(analysticsMock.getDashboard).toHaveBeenCalledWith(
      1,
      new Date('2026-01-10'),
      new Date('2026-01-12'),
    );
  });

  it('should be call with userId: 1 and last 7 days', async () => {
    const now = new Date('2026-01-15T12:00:00.000Z');
    const checkFrom = new Date('2026-01-08T00:00:00.000Z');
    const checkTo = new Date('2026-01-16T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    analysticsMock.getDashboard.mockResolvedValue([]);
    await controller.getDashboard(1);
    expect(analysticsMock.getDashboard).toHaveBeenCalledWith(
      1,
      checkFrom,
      checkTo,
    );
    jest.useRealTimers();
  });
});
