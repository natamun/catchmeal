import { UnauthorizedException } from '@nestjs/common';

import { OptionalJwtAuthGuard } from './optional-jwt.guard';

describe('OptionalJwtAuthGuard', () => {
  const guard = new OptionalJwtAuthGuard();

  it('passes the authenticated user through', () => {
    const user = { userId: 1, username: 'alice' };

    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it('returns null instead of rejecting a request without a session', () => {
    expect(guard.handleRequest(null, false)).toBeNull();
  });

  it('returns null when the session is no longer valid', () => {
    expect(guard.handleRequest(new UnauthorizedException(), false)).toBeNull();
  });
});
