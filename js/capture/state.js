// Capture state management

// State variables
let capturing = false;
let previewMode = false;
let frameCount = 0;
let framesDirectory = 'frames';

/**
 * Check if currently capturing
 */
export function isCapturing() {
  return capturing;
}

/**
 * Set capturing state
 */
export function setCapturing(state) {
  capturing = state;
}

/**
 * Check if in preview mode
 */
export function isPreviewMode() {
  return previewMode;
}

/**
 * Set preview mode state
 */
export function setPreviewMode(state) {
  previewMode = state;
}

/**
 * Increment frame count
 */
export function incrementFrameCount() {
  frameCount++;
  return frameCount;
}

/**
 * Reset frame count
 */
export function resetFrameCount() {
  frameCount = 0;
}

/**
 * Get current frame count
 */
export function getFrameCount() {
  return frameCount;
}

/**
 * Set frames directory
 */
export function setFramesDirectory(directory) {
  framesDirectory = directory;
}

/**
 * Get frames directory
 */
export function getFramesDirectory() {
  return framesDirectory;
}
