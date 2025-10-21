import { Role } from '@app/common';

export function canReadEvent(user: any, ev: any): boolean {
  if (!ev.isConfidential) return true;
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.PLANNER && String(ev.ownerId) === String(user.sub)) return true;
  const isReviewer =
    user.role === Role.REVIEWER &&
    (String(ev.plannerReviewerId) === user.sub ||
      String(ev.devReviewerId) === user.sub ||
      String(ev.qaReviewerId) === user.sub ||
      String(ev.csReviewerId) === user.sub);
  return isReviewer;
}

export function canModifyEvent(user: any, ev: any): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.PLANNER && String(ev.ownerId) === String(user.sub)) return true;
  return false;
}
