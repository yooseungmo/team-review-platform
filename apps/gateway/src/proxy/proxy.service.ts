import { UserPayloadDto } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
  'host',
]);

function sanitizeOutgoingHeaders(req: Request) {
  const headers: Record<string, any> = { ...req.headers };

  // eslint-disable-next-line no-restricted-syntax
  for (const h of HOP_BY_HOP) delete headers[h];

  Object.keys(headers).forEach((k) => {
    if (k.toLowerCase().startsWith('x-user-')) delete headers[k];
  });

  // 요청 ID 붙이기
  if (!headers['x-request-id']) headers['x-request-id'] = randomUUID();

  return headers;
}

@Injectable()
export class ProxyService {
  constructor(private readonly http: HttpService) {}

  async forward(req: Request, baseUrl: string, overridePath?: string): Promise<any> {
    const url = baseUrl + (overridePath ?? req.url);
    const method = req.method as AxiosRequestConfig['method'];

    const headers = sanitizeOutgoingHeaders(req);

    const user = req.user as UserPayloadDto | undefined;

    headers['x-user-id'] = user?.sub ?? '';
    headers['x-user-role'] = user?.role ?? '';
    headers['x-user-team'] = user?.team ?? '';

    const cfg: AxiosRequestConfig = {
      url,
      method,
      headers,
      params: req.query,
      data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
      // validateStatus: () => true,
    };

    const r = await lastValueFrom(this.http.request(cfg));
    return { status: r.status, headers: r.headers, data: r.data };
  }
}
