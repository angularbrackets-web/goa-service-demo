import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AppConfig } from '../config.js';
import { StaffTokenGuard } from './staff-token.guard.js';

const TOKEN = 'a-very-secret-staff-token';

function contextWith(authorization?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  } as unknown as ExecutionContext;
}

describe('StaffTokenGuard', () => {
  const guard = new StaffTokenGuard(
    new AppConfig({ DATABASE_URL: 'postgres://x', STAFF_API_TOKEN: TOKEN }),
  );

  it('allows a request with the correct bearer token', () => {
    expect(guard.canActivate(contextWith(`Bearer ${TOKEN}`))).toBe(true);
  });

  it.each([undefined, 'Bearer', `Basic ${TOKEN}`, 'Bearer wrong-token'])(
    'rejects %s',
    (header) => {
      expect(() => guard.canActivate(contextWith(header))).toThrow(
        UnauthorizedException,
      );
    },
  );
});
