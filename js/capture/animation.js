// Animation sequence playback
import * as captureState from './state.js';
import { stopRecording } from './recorder.js';
import { dispatchCustomEvent } from '../utils/events.js';

/**
 * Start animation sequence
 */
export function startAnimation(viewer) {
  const sequence = window.KenBurns.sequence.getSequence();
  
  if (sequence.length === 0) {
    alert('No animation sequence defined');
    return false;
  }
  
  // Set current point to start
  window.KenBurns.visualization.setCurrentPoint(0);
  
  // Reset to first point
  const firstPoint = sequence[0];
  viewer.viewport.zoomTo(firstPoint.zoom);
  viewer.viewport.panTo(new OpenSeadragon.Point(firstPoint.center.x, firstPoint.center.y));
  
  // Allow time to settle at the first point
  setTimeout(() => {
    animateNextPoint(viewer, 0);
  }, 500);
  
  return true;
}

/**
 * Animate to next point in sequence
 */
export function animateNextPoint(viewer, index) {
  const sequence = window.KenBurns.sequence.getSequence();
  
  if (index >= sequence.length - 1) {
    if (captureState.isCapturing() || captureState.isPreviewMode()) {
      // At the last point, wait for the still duration and then stop
      const currentPoint = sequence[index];
      const stillDuration = currentPoint.duration.still || 1000;
      
      setTimeout(() => { 
        stopRecording(); 
        window.KenBurns.visualization.setCurrentPoint(-1);
        
        // Signal animation completion
        dispatchCustomEvent('animation-complete');
      }, stillDuration + 500);
    }
    return;
  }
  
  // Set current point to next point
  window.KenBurns.visualization.setCurrentPoint(index + 1);
  
  const next = sequence[index + 1];
  const transitionDuration = next.duration.transition || 1500;
  
  // Animate to the next point with the transition duration
  window.KenBurns.viewer.smoothPanZoom(
    viewer, 
    next.zoom, 
    new OpenSeadragon.Point(next.center.x, next.center.y), 
    transitionDuration
  ).start();
  
  // After transition is done, wait for the still duration
  const stillDuration = next.duration.still || 1500;
  
  // Schedule the next animation after transition + still time
  setTimeout(() => {
    animateNextPoint(viewer, index + 1);
  }, transitionDuration + stillDuration + 100);
}
