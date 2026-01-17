import { HttpException } from '@nestjs/common';
import { GatewayRateLimitGuard } from './rate-limit.guard';

const createConfig = (limit = 2, ttlSec = 60) =>
  ({
    get: (key: string) => {
      if (key === 'GATEWAY_RATE_LIMIT_LIMIT') return limit;
      if (key === 'GATEWAY_RATE_LIMIT_TTL_SEC') return ttlSec;
      return undefined;
    },
  }) as any;

const createContext = (overrides: Partial<any> = {}) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        path: '/events',
        originalUrl: '/events',
        headers: {},
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        ...overrides,
      }),
    }),
  }) as any;

describe('GatewayRateLimitGuard', () => {
  it('허용 횟수 안에서는 통과하고, 초과 시 429를 반환한다', () => {
    const guard = new GatewayRateLimitGuard(createConfig(2, 60));
    const ctx = createContext();

    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);

    try {
      guard.canActivate(ctx);
      fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).getStatus()).toBe(429);
      expect((err as HttpException).getResponse()).toMatchObject({
        error: 'TooManyRequests',
      });
    }
  });

  it('헬스체크와 OPTIONS는 레이트리밋을 우회한다', () => {
    const guard = new GatewayRateLimitGuard(createConfig(1, 60));
    const healthCtx = createContext({ path: '/health', method: 'GET' });
    const optionsCtx = createContext({ method: 'OPTIONS' });

    expect(guard.canActivate(healthCtx)).toBe(true);
    expect(guard.canActivate(optionsCtx)).toBe(true);
  });
});
