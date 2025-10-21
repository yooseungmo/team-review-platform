import { ApiAuthPostLoginResponseDto } from '../../../apps/auth/src/auth/dto/api-auth-post-login-response.dto';
import { ApiAuthPostLogoutResponseDto } from '../../../apps/auth/src/auth/dto/api-auth-post-logout-response.dto';
import { ApiAuthPostRefreshResponseDto } from '../../../apps/auth/src/auth/dto/api-auth-post-refresh-response.dto';
import { ApiAuthPostRegisterResponseDto } from '../../../apps/auth/src/auth/dto/api-auth-post-register-response.dto';

export const SwaggerModels = [
  ApiAuthPostRegisterResponseDto,
  ApiAuthPostLoginResponseDto,
  ApiAuthPostRefreshResponseDto,
  ApiAuthPostLogoutResponseDto,
];
