import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';
import { CircuitBreaker, CircuitBreakerOptions } from './circuit-breaker';
import { attachUserContext, sanitizeOutgoingHeaders } from './http-headers.util';

type ForwardResult = {
  status: number;
  headers: Record<string, any>;
  data: any;
};

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  private readonly circuits = new Map<string, CircuitBreaker>();

  private readonly circuitOptions: CircuitBreakerOptions;

  constructor(
    private readonly http: HttpService,
    cs: ConfigService,
  ) {
    this.circuitOptions = {
      failureThreshold: cs.get<number>('GATEWAY_CB_FAILURE_THRESHOLD') ?? 5,
      cooldownMs: cs.get<number>('GATEWAY_CB_COOLDOWN_MS') ?? 10_000,
    };
  }

  async forward(req: Request, baseUrl: string, overridePath?: string): Promise<ForwardResult> {
    const url = baseUrl + (overridePath ?? req.url);
    const method = req.method as AxiosRequestConfig['method'];
    const circuit = this.getCircuit(baseUrl);

    const availability = circuit.canRequest();
    if (!availability.allowed) {
      return this.buildCircuitOpenResponse(baseUrl, availability.retryAfterMs);
    }

    const headers = attachUserContext(sanitizeOutgoingHeaders(req), req.user as any);

    const cfg: AxiosRequestConfig = {
      url,
      method,
      headers,
      params: req.query,
      data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      // validateStatus: () => true,
    };

    try {
      const r = await lastValueFrom(this.http.request(cfg));
      const headersFromDownstream: Record<string, any> = { ...r.headers };

      const isServerError = r.status >= 500;
      if (isServerError) {
        const { opened } = circuit.recordFailure();
        if (opened) this.logger.warn(`Circuit OPEN (${baseUrl}) due to repeated 5xx`);
      } else {
        circuit.recordSuccess();
      }

      const retryAfter = this.retryAfterSeconds(circuit);
      if (retryAfter) headersFromDownstream['retry-after'] = retryAfter;
      headersFromDownstream['x-gateway-circuit'] = circuit.snapshot().state;

      return { status: r.status, headers: headersFromDownstream, data: r.data };
    } catch (err) {
      const { opened } = circuit.recordFailure();
      if (opened) this.logger.warn(`Circuit OPEN (${baseUrl}) due to transport error: ${err}`);
      return this.buildDownstreamError(baseUrl, circuit);
    }
  }

  private getCircuit(baseUrl: string): CircuitBreaker {
    if (!this.circuits.has(baseUrl)) {
      this.circuits.set(baseUrl, new CircuitBreaker(this.circuitOptions));
    }
    return this.circuits.get(baseUrl)!;
  }

  private retryAfterSeconds(circuit: CircuitBreaker): number | undefined {
    const retryMs = circuit.getRetryAfterMs();
    if (!retryMs) return undefined;
    return Math.max(1, Math.ceil(retryMs / 1000));
  }

  private buildCircuitOpenResponse(baseUrl: string, retryAfterMs: number): ForwardResult {
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      headers: { 'retry-after': retryAfterSec, 'x-gateway-circuit': 'OPEN' },
      data: {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'CircuitOpen',
        message: `Downstream ${baseUrl} is temporarily blocked after repeated errors.`,
        retryAfterSec,
      },
    };
  }

  private buildDownstreamError(baseUrl: string, circuit: CircuitBreaker): ForwardResult {
    const retryAfter = this.retryAfterSeconds(circuit);
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      headers: {
        ...(retryAfter ? { 'retry-after': retryAfter } : {}),
        'x-gateway-circuit': circuit.snapshot().state,
      },
      data: {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'GatewayDownstreamError',
        message: `Failed to reach downstream service (${baseUrl}).`,
        ...(retryAfter ? { retryAfterSec: retryAfter } : {}),
      },
    };
  }
}
