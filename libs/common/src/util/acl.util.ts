import { Role } from '@app/common';

export function canReadReviewHistory(user: any, ev: any): boolean {
  if (user.role === Role.ADMIN) return true;
  const isOwner = user.role === Role.PLANNER && String(ev.ownerId) === String(user.sub);
  const isReviewer =
    user.role === Role.REVIEWER &&
    [ev.plannerReviewerId, ev.devReviewerId, ev.qaReviewerId, ev.csReviewerId]
      .map(String)
      .includes(String(user.sub));
  return isOwner || isReviewer;
}
