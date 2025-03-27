// Frame processing for video capture
import { getCapturer, captureFrame } from './recorder.js';
import * as captureState from './state.js';

/**
 * Process and enhance a frame for capturing
 */
export function processFrame(viewer) {
  if (!captureState.isCapturing()) return;
  
  viewer.forceRedraw();
  
  // Get the canvas from the viewer
  const canvas = viewer.drawer.canvas;
  if (!canvas) return;
  
  // If the subpixel rendering option is enabled, apply additional smoothing
  const subpixelRendering = document.getElementById('subpixel-rendering').checked;
  
  if (subpixelRendering) {
    const enhancedCanvas = enhanceFrame(canvas);
    captureFrame(enhancedCanvas);
  } else {
    // Capture the standard frame
    captureFrame(canvas);
  }
}

/**
 * Enhance a frame with subpixel rendering
 */
export function enhanceFrame(canvas) {
  // Create a temporary canvas with the same dimensions
  const tempCanvas = document.createElement('canvas');
  const captureFrame = document.getElementById('capture-frame');
  const frameRect = captureFrame.getBoundingClientRect();
  
  // Use exact capture frame dimensions for best quality
  tempCanvas.width = Math.floor(frameRect.width);
  tempCanvas.height = Math.floor(frameRect.height);
  
  const ctx = tempCanvas.getContext('2d');
  
  // Apply high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Calculate the source region to match the capture frame
  const viewerRect = document.getElementById('viewer').getBoundingClientRect();
  const sourceX = (frameRect.left - viewerRect.left);
  const sourceY = (frameRect.top - viewerRect.top);
  
  // Draw only the capture frame area with subpixel rendering
  ctx.drawImage(
    canvas, 
    sourceX, sourceY, frameRect.width, frameRect.height,
    0, 0, tempCanvas.width, tempCanvas.height
  );
  
  return tempCanvas;
}
