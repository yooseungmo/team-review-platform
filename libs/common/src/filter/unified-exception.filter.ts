import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

function toMessage(m: any): string {
  if (Array.isArray(m)) return m.join(', ');
  if (typeof m === 'object') return JSON.stringify(m);
  return String(m ?? 'Internal server error');
}

@Catch()
export class UnifiedExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let raw = isHttp ? (exception as HttpException).getResponse() : undefined;
    if (typeof raw === 'string') raw = { message: raw };

    const errorName =
      (raw as any)?.error ?? (isHttp ? (exception as any)?.name : 'InternalServerError');
    const code = (raw as any)?.code ?? (exception as any)?.code; // 필요시 커스텀 에러코드 주입용

    const message = toMessage(
      (raw as any)?.message ?? (isHttp ? (exception as any)?.message : undefined),
    );

    const payload = {
      error: errorName, // ex) BadRequestException
      message, // ex) "Invalid payload, field xxx required"
      statusCode: status, // ex) 400
      path: req.originalUrl, // ex) /events/123
      timestamp: new Date().toISOString(),
      ...(code ? { code } : {}), // ex) E_INVALID_PAYLOAD
    };

    res.status(status).json(payload);
  }
}
