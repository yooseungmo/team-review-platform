import { randomUUID } from 'crypto';
import { Request } from 'express';
import { UserPayloadDto } from '@app/common';

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

export function sanitizeOutgoingHeaders(req: Request): Record<string, any> {
  const headers: Record<string, any> = { ...req.headers };

  for (const h of HOP_BY_HOP) delete headers[h];

  Object.keys(headers).forEach((k) => {
    if (k.toLowerCase().startsWith('x-user-')) delete headers[k];
  });

  if (!headers['x-request-id']) headers['x-request-id'] = randomUUID();

  return headers;
}

export function attachUserContext(
  headers: Record<string, any>,
  user: UserPayloadDto | undefined,
): Record<string, any> {
  return {
    ...headers,
    'x-user-id': user?.sub ?? '',
    'x-user-role': user?.role ?? '',
    'x-user-team': user?.team ?? '',
  };
}
