import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

type Counter = { count: number; expiresAt: number };

@Injectable()
export class GatewayRateLimitGuard implements CanActivate {
  private readonly windowMs: number;

  private readonly limit: number;

  private readonly store = new Map<string, Counter>();

  private lastCleanup = Date.now();

  constructor(private readonly configService: ConfigService) {
    this.windowMs =
      (this.configService.get<number>('GATEWAY_RATE_LIMIT_TTL_SEC') ?? 60) * 1000;
    this.limit = this.configService.get<number>('GATEWAY_RATE_LIMIT_LIMIT') ?? 120;
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req) return true;
    if (this.shouldBypass(req)) return true;

    const now = Date.now();
    this.cleanup(now);

    const key = this.getKey(req);
    const counter = this.store.get(key);

    if (!counter || counter.expiresAt <= now) {
      this.store.set(key, { count: 1, expiresAt: now + this.windowMs });
      return true;
    }

    if (counter.count >= this.limit) {
      const retryAfter = Math.max(1, Math.ceil((counter.expiresAt - now) / 1000));
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'TooManyRequests',
          message: `Rate limit exceeded. Try again in ${retryAfter}s.`,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    counter.count += 1;
    return true;
  }

  private shouldBypass(req: Request): boolean {
    if (req.method === 'OPTIONS') return true; // allow CORS preflight
    const path = req.path || req.originalUrl || '';
    return path === '/health' || path === '/healthz';
  }

  private getKey(req: Request): string {
    const forwarded = (req.headers['x-forwarded-for'] as string | undefined)
      ?.split(',')[0]
      ?.trim();
    return forwarded || req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup(now: number) {
    if (now - this.lastCleanup < this.windowMs) return;
    this.lastCleanup = now;
    this.store.forEach((value, key) => {
      if (value.expiresAt <= now) this.store.delete(key);
    });
  }
}
