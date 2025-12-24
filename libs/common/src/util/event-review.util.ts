import { FinalStatus, ReviewStatus } from '../review.enum';

export type TeamKey = 'pm' | 'dev' | 'qa' | 'cs';

export function initStatusesByReviewers(reviewers: Partial<Record<TeamKey, string | null>>) {
  const toStatus = (id?: string | null) => (id ? ReviewStatus.PENDING : ReviewStatus.NOT_REQUIRED);

  return {
    pmStatus: toStatus(reviewers.pm),
    devStatus: toStatus(reviewers.dev),
    qaStatus: toStatus(reviewers.qa),
    csStatus: toStatus(reviewers.cs),
  };
}

export function recalcStatusesOnReviewerChange(
  prev: {
    pmStatus: ReviewStatus;
    devStatus: ReviewStatus;
    qaStatus: ReviewStatus;
    csStatus: ReviewStatus;
  },
  prevReviewers: Partial<Record<TeamKey, string | null>>,
  nextReviewers: Partial<Record<TeamKey, string | null>>,
) {
  const next: {
    pmStatus: ReviewStatus;
    devStatus: ReviewStatus;
    qaStatus: ReviewStatus;
    csStatus: ReviewStatus;
  } = { ...prev };

  const apply = (key: TeamKey, field: keyof typeof prev) => {
    const previousReviewer = prevReviewers[key] ?? null;
    const nextReviewer = nextReviewers[key] ?? null;

    if (!nextReviewer) {
      next[field] = ReviewStatus.NOT_REQUIRED;
      return;
    }

    const reviewerChanged = !previousReviewer || previousReviewer !== nextReviewer;
    if (reviewerChanged) {
      next[field] = ReviewStatus.PENDING;
      return;
    }

    if (prev[field] === ReviewStatus.NOT_REQUIRED) {
      next[field] = ReviewStatus.PENDING;
    }
  };

  apply('pm', 'pmStatus');
  apply('dev', 'devStatus');
  apply('qa', 'qaStatus');
  apply('cs', 'csStatus');

  return next;
}

export function calcFinalStatus(s: {
  pmStatus: ReviewStatus;
  devStatus: ReviewStatus;
  qaStatus: ReviewStatus;
  csStatus: ReviewStatus;
}): FinalStatus {
  const considered = [s.pmStatus, s.devStatus, s.qaStatus, s.csStatus].filter(
    (x) => x !== ReviewStatus.NOT_REQUIRED,
  );

  if (considered.some((x) => x === ReviewStatus.REJECTED)) return FinalStatus.REJECTED;
  if (considered.some((x) => x === ReviewStatus.PENDING)) return FinalStatus.IN_PROGRESS;
  if (considered.length === 0) return FinalStatus.APPROVED;
  if (considered.length > 0 && considered.every((x) => x === ReviewStatus.APPROVED))
    return FinalStatus.APPROVED;

  return FinalStatus.IN_PROGRESS;
}
