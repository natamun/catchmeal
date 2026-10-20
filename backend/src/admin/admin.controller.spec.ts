import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminController } from './admin.controller';

describe('AdminController', () => {
  const guard = new RolesGuard(new Reflector());
  const updateUser = Reflect.get(
    AdminController.prototype,
    'updateUser',
  ) as () => unknown;
  const contextFor = (role: string) =>
    ({
      getHandler: () => updateUser,
      getClass: () => AdminController,
      switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
    }) as unknown as ExecutionContext;

  it('should refuse to let a regular user edit a user', () => {
    expect(() => guard.canActivate(contextFor('USER'))).toThrow(
      ForbiddenException,
    );
  });

  it('should let an admin edit a user', () => {
    expect(guard.canActivate(contextFor('ADMIN'))).toBe(true);
  });
});
