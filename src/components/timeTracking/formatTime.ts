/**
 * Format total seconds to HH:MM:SS string
 */
export function formatSecondsToDigital(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format total seconds to readable "2h 45m" or "15m" string
 */
export function formatSecondsToHuman(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Format decimal hours (e.g. 2.5) to "2h 30m"
 */
export function formatHoursToHuman(hours: number): string {
  if (!hours || hours <= 0) return '0h';
  const totalSeconds = Math.round(hours * 3600);
  return formatSecondsToHuman(totalSeconds);
}
