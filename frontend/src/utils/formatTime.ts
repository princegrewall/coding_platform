/**
 * Formats time in seconds to HH:MM:SS format
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  if (!seconds && seconds !== 0) return '--:--:--';
  
  // Handle negative time (shouldn't happen, but just in case)
  const totalSeconds = Math.abs(Math.floor(seconds));
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  
  // Add leading zeros
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Formats time to a human-readable format (e.g., "2 hours 30 minutes")
 * @param seconds Time in seconds
 * @returns Human-readable time string
 */
export const formatTimeHuman = (seconds: number): string => {
  if (!seconds && seconds !== 0) return 'unknown';
  
  const totalSeconds = Math.abs(Math.floor(seconds));
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }
  
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`);
  }
  
  return parts.join(' ');
}; 