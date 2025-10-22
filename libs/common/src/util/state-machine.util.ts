/* eslint-disable no-nested-ternary */
import { ReviewStatus, Role } from '@app/common';

export function canTransition(prev: ReviewStatus, next: ReviewStatus, actor: Role): boolean {
  if (prev === ReviewStatus.NOT_REQUIRED) return false;

  if (prev === ReviewStatus.PENDING) {
    return next === ReviewStatus.APPROVED || next === ReviewStatus.REJECTED;
  }

  // 이미 확정된 상태 -> 기본 불가, ADMIN만 변경 허용
  if (prev === ReviewStatus.APPROVED || prev === ReviewStatus.REJECTED) {
    if (actor !== Role.ADMIN) return false;
    // ADMIN은 상호 전환만 허용 (PENDING 복귀는 금지)
    return next === ReviewStatus.APPROVED || next === ReviewStatus.REJECTED;
  }

  return false;
}

export function assertTransition(prev: ReviewStatus, next: ReviewStatus, actor: Role) {
  if (!canTransition(prev, next, actor)) {
    const msg =
      prev === ReviewStatus.NOT_REQUIRED
        ? 'NOT_REQUIRED 상태는 변경할 수 없습니다.'
        : prev === ReviewStatus.PENDING
          ? 'PENDING에서는 APPROVED/REJECTED만 가능합니다.'
          : '확정 상태 변경은 ADMIN만 가능합니다.';
    throw new Error(msg);
  }
}
