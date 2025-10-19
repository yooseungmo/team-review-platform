// apps/gateway/src/proxy/proxy.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private getEnv(key: string): string {
    const value = this.config.get<string>(key);
    if (!value)
      throw new InternalServerErrorException(`${key} is not defined in config`);
    return value;
  }

  private _authBase?: string;
  private get authBase(): string {
    if (!this._authBase) this._authBase = this.getEnv('AUTH_SERVICE_URL');
    return this._authBase;
  }

  private _eventBase?: string;
  private get eventBase(): string {
    if (!this._eventBase)
      this._eventBase = this.getEnv('GAME_EVENT_SERVICE_URL');
    return this._eventBase;
  }

  async forwardToAuth(method: string, path: string, data?: any, params?: any) {
    const url = `${this.authBase}${path}`;
    const req$ = this.http.request({ method, url, data, params });
    const { data: res } = await firstValueFrom(req$);
    return res;
  }

  async forwardToEvent(method: string, path: string, data?: any, params?: any) {
    const url = `${this.eventBase}${path}`;
    const req$ = this.http.request({ method, url, data, params });
    const { data: res } = await firstValueFrom(req$);
    return res;
  }
}
