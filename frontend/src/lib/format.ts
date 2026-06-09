export function fmtDuration(seconds: number | null | undefined): string {
  if (!seconds) return '-';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function fmtDurationShort(seconds: number | null | undefined): string {
  if (!seconds) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  PENDING: 'info',
  RELEASED: 'muted',
};

export const CALL_STATUS_CLASS: Record<string, string> = {
  COMPLETED: 'success',
  NO_ANSWER: 'warning',
  VOICEMAIL: 'accent',
  FAILED: 'danger',
  INITIATED: 'info',
  IN_PROGRESS: 'info',
};

export const ACTION_COLOR: Record<string, string> = {
  FORWARD_PSTN: 'success',
  FORWARD_SIP: 'info',
  RING_GROUP: 'accent',
  VOICEMAIL: 'warning',
  REJECT: 'danger',
};
