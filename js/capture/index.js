// Capture module - main entry point
import * as recorder from './recorder.js';
import * as animation from './animation.js';
import * as frameProcessor from './frame-processor.js';
import * as state from './state.js';
import { updateCaptureFrame } from '../visualization/frames.js';

/**
 * Animation loop
 */
function animate(viewer) {
  requestAnimationFrame(() => animate(viewer));
  
  // Update tweens
  TWEEN.update();
  
  // Capture frame if recording
  if (state.isCapturing()) {
    frameProcessor.processFrame(viewer);
  }
  
  // Update capture frame if needed
  if (document.getElementById('show-capture-frame').checked) {
    const aspectRatio = document.getElementById('aspect-ratio').value;
    updateCaptureFrame(viewer, aspectRatio);
  }
}

// Export modules and functions
export default {
  startRecording: recorder.startRecording,
  stopRecording: recorder.stopRecording,
  startPreview: () => {
    state.setPreviewMode(true);
    return true;
  },
  startAnimation: animation.startAnimation,
  animate,
  isCapturing: state.isCapturing,
  isPreviewMode: state.isPreviewMode
};
