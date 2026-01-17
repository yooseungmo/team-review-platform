export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownMs: number;
}

export interface CircuitAvailability {
  allowed: boolean;
  retryAfterMs: number;
  state: CircuitState;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';

  private failureCount = 0;

  private nextAttemptAt = 0;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.options.failureThreshold = Math.max(1, Math.floor(this.options.failureThreshold));
  }

  canRequest(now = Date.now()): CircuitAvailability {
    if (this.state === 'OPEN') {
      if (now >= this.nextAttemptAt) {
        this.state = 'HALF_OPEN';
        return { allowed: true, retryAfterMs: 0, state: this.state };
      }
      return {
        allowed: false,
        retryAfterMs: Math.max(0, this.nextAttemptAt - now),
        state: this.state,
      };
    }

    return { allowed: true, retryAfterMs: 0, state: this.state };
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.nextAttemptAt = 0;
  }

  recordFailure(now = Date.now()): { opened: boolean; retryAfterMs: number } {
    this.failureCount += 1;
    const shouldOpen =
      this.state === 'HALF_OPEN' || this.failureCount >= this.options.failureThreshold;

    if (!shouldOpen) return { opened: false, retryAfterMs: 0 };

    this.state = 'OPEN';
    this.nextAttemptAt = now + this.options.cooldownMs;
    return { opened: true, retryAfterMs: this.options.cooldownMs };
  }

  getRetryAfterMs(now = Date.now()): number {
    if (this.state !== 'OPEN') return 0;
    return Math.max(0, this.nextAttemptAt - now);
  }

  snapshot(now = Date.now()) {
    return {
      state: this.state,
      failureCount: this.failureCount,
      retryAfterMs: this.getRetryAfterMs(now),
    };
  }
}
