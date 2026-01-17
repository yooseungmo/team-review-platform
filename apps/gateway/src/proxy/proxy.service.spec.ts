import { of, throwError } from 'rxjs';
import { ProxyService } from './proxy.service';

const createConfig = (threshold = 2, cooldownMs = 1000) =>
  ({
    get: (key: string) => {
      if (key === 'GATEWAY_CB_FAILURE_THRESHOLD') return threshold;
      if (key === 'GATEWAY_CB_COOLDOWN_MS') return cooldownMs;
      return undefined;
    },
  }) as any;

const createRequest = (overrides: Partial<any> = {}) =>
  ({
    method: 'GET',
    url: '/foo',
    headers: {},
    query: {},
    body: undefined,
    user: undefined,
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' },
    ...overrides,
  }) as any;

describe('ProxyService - Circuit Breaker', () => {
  const baseUrl = 'http://auth:3000';

  it('정상 응답 시 회로를 닫은 상태로 통과한다', async () => {
    const responder = jest
      .fn()
      .mockReturnValue(of({ status: 200, headers: { foo: 'bar' }, data: 'ok' }));
    const service = new ProxyService({ request: responder } as any, createConfig());

    const res = await service.forward(createRequest(), baseUrl);

    expect(res.status).toBe(200);
    expect(res.data).toBe('ok');
    expect(res.headers.foo).toBe('bar');
    expect(res.headers['x-gateway-circuit']).toBe('CLOSED');
    expect(res.headers['retry-after']).toBeUndefined();
    expect(responder).toHaveBeenCalledTimes(1);
  });

  it('연속 5xx 이후 회로가 OPEN되고, OPEN 상태에서는 즉시 503을 반환한다', async () => {
    const responder = jest
      .fn()
      .mockReturnValueOnce(of({ status: 500, headers: {}, data: 'err1' }))
      .mockReturnValueOnce(of({ status: 500, headers: {}, data: 'err2' }));

    const service = new ProxyService({ request: responder } as any, createConfig(2, 1000));
    const req = createRequest();

    const first = await service.forward(req, baseUrl);
    expect(first.status).toBe(500);

    const second = await service.forward(req, baseUrl);
    expect(second.status).toBe(500);

    const third = await service.forward(req, baseUrl);
    expect(third.status).toBe(503);
    expect(third.data.error).toBe('CircuitOpen');
    expect(third.data.statusCode).toBe(503);
    expect(third.headers['x-gateway-circuit']).toBe('OPEN');
    expect(third.headers['retry-after']).toBeGreaterThanOrEqual(1);
    expect(responder).toHaveBeenCalledTimes(2); // OPEN 상태에서는 다운스트림 호출 안 함
  });

  it('전송 오류 시 503 fallback과 회로 상태를 반환한다', async () => {
    const responder = jest.fn().mockReturnValue(throwError(() => new Error('boom')));
    const service = new ProxyService({ request: responder } as any, createConfig(1, 1000));

    const res = await service.forward(createRequest(), baseUrl);

    expect(res.status).toBe(503);
    expect(res.data.error).toBe('GatewayDownstreamError');
    expect(res.data.statusCode).toBe(503);
    expect(['OPEN', 'HALF_OPEN', 'CLOSED']).toContain(res.headers['x-gateway-circuit']);
    expect(responder).toHaveBeenCalledTimes(1);
  });

  it('헤더를 정리하고 사용자 컨텍스트를 다운스트림 요청에 포함한다', async () => {
    const responder = jest.fn().mockReturnValue(
      of({
        status: 200,
        headers: {},
        data: 'ok',
      }),
    );
    const service = new ProxyService({ request: responder } as any, createConfig());

    const req = createRequest({
      url: '/events',
      method: 'POST',
      body: { foo: 'bar' },
      headers: {
        host: 'example.com',
        connection: 'keep-alive',
        'x-user-should-strip': '1',
        'x-forwarded-for': '1.1.1.1',
        'x-request-id': 'keep-me',
      },
      user: { sub: 'user-1', role: 'ADMIN', team: null },
    });

    await service.forward(req, baseUrl);

    const sent = responder.mock.calls[0][0] as any;
    expect(sent.url).toBe(`${baseUrl}/events`);
    expect(sent.method).toBe('POST');
    expect(sent.data).toEqual({ foo: 'bar' });
    expect(sent.headers.host).toBeUndefined();
    expect(sent.headers.connection).toBeUndefined();
    expect(sent.headers['x-user-should-strip']).toBeUndefined();
    expect(sent.headers['x-forwarded-for']).toBe('1.1.1.1');
    expect(sent.headers['x-user-id']).toBe('user-1');
    expect(sent.headers['x-user-role']).toBe('ADMIN');
    expect(sent.headers['x-user-team']).toBe('');
    expect(sent.headers['x-request-id']).toBe('keep-me');
  });
});
