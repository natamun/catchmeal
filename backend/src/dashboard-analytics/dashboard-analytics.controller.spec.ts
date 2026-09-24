import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';
import { Test, TestingModule } from '@nestjs/testing';

import { PassportJwtAuthGuard } from '../auth/guards/passport-jwt.guard';
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
    })
      .overrideGuard(PassportJwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<DashboardAnalyticsController>(
      DashboardAnalyticsController,
    );
  });

  const mockReq = { user: { userId: 1 } };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', async () => {
    analysticsMock.getDashboard.mockResolvedValue([]);
    const req = {
      user: { userId: 42, username: 'testuser' },
    } as unknown as Express.Request & {
      user: { userId: number; username: string };
    };
    const dashboard = await controller.getDashboard(
      42,
      req,
      new Date('2026-08-11'),
      new Date('2026-08-12'),
    );
    expect(dashboard).toEqual([]);
  });

  it('should throw ForbiddenException if userId does not match', () => {
    const req = {
      user: { userId: 42, username: 'testuser' },
    } as unknown as Express.Request & {
      user: { userId: number; username: string };
    };
    expect(() =>
      controller.getDashboard(
        43,
        req,
        new Date('2026-01-10'),
        new Date('2026-01-12'),
      ),
    ).toThrow(ForbiddenException);
    expect(analysticsMock.getDashboard).not.toHaveBeenCalled();
  });
});
