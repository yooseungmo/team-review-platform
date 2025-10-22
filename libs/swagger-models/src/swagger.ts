import { ApiAuthPostLoginResponseDto } from '../../../apps/auth/src/auth/dto/api-auth-post-login-response.dto';
import { ApiAuthPostLogoutResponseDto } from '../../../apps/auth/src/auth/dto/api-auth-post-logout-response.dto';
import { ApiAuthPostRefreshResponseDto } from '../../../apps/auth/src/auth/dto/api-auth-post-refresh-response.dto';
import { ApiAuthPostRegisterResponseDto } from '../../../apps/auth/src/auth/dto/api-auth-post-register-response.dto';
import { ApiUserGetQueryRequestDto } from '../../../apps/auth/src/user/dto/api-user-get-query-request.dto';
import { ApiUserGetQueryResponseDto } from '../../../apps/auth/src/user/dto/api-user-get-query-response.dto';
import { ApiUserPatchRoleTeamResponseDto } from '../../../apps/auth/src/user/dto/api-user-patch-role-team-response.dto';
import { ApiUserPatchStatusResponseDto } from '../../../apps/auth/src/user/dto/api-user-patch-status-response.dto';
import { ApiUserSummaryDto } from '../../../apps/auth/src/user/dto/user-summary.dto';
import { ApiEventCommonResponseDto } from '../../../apps/game-event/src/event/dto/api-event-common-response.dto';
import { ApiEventGetQueryResponseDto } from '../../../apps/game-event/src/event/dto/api-event-get-query-response.dto';
import { ApiEventGetReviewStatusResponseDto } from '../../../apps/game-event/src/event/dto/api-event-get-review-status-response.dto';
import { ReviewHistoryItemDto } from '../../../apps/game-event/src/event/dto/review-history-item.dto';

export const SwaggerModels = [
  ApiAuthPostRegisterResponseDto,
  ApiAuthPostLoginResponseDto,
  ApiAuthPostRefreshResponseDto,
  ApiAuthPostLogoutResponseDto,
  ApiAuthPostRegisterResponseDto,
  ApiUserSummaryDto,
  ApiUserGetQueryRequestDto,
  ApiUserGetQueryResponseDto,
  ApiUserPatchRoleTeamResponseDto,
  ApiUserPatchStatusResponseDto,
  ApiEventCommonResponseDto,
  ApiEventGetQueryResponseDto,
  ApiEventGetReviewStatusResponseDto,
  ReviewHistoryItemDto,
];
