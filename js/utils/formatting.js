// String and value formatting utilities

/**
 * Format a time value in milliseconds to HH:MM:SS,mmm format (for SRT)
 */
export function formatSrtTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const milliseconds = ms % 1000;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

/**
 * Format a time value in milliseconds to MM:SS.mmm format
 */
export function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  const milliseconds = Math.floor((ms % 1000) / 10); // Only show 2 decimal places for milliseconds
  
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
}

/**
 * Format decimal value to fixed precision
 */
export function formatDecimal(value, decimals = 2) {
  return Number(value).toFixed(decimals);
}

/**
 * Format a filename with timestamp
 */
export function formatFilename(prefix, extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Sanitize a string for use as a filename
 */
export function sanitizeFilename(input) {
  return input.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/_{2,}/g, '_');
}
