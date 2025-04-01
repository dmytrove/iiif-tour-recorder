// UI controls and basic event handlers
import * as capture from '../capture/index.js';
import * as visualization from '../visualization/index.js';
import * as viewer from '../viewer/index.js';
import { showNotification } from './notifications.js';

/**
 * Setup collapse button functionality
 */
export function setupCollapseButton() {
  document.getElementById('collapse-controls').addEventListener('click', function() {
    document.getElementById('controls').classList.toggle('collapsed');
    
    // Update the button text/icon based on state
    if (document.getElementById('controls').classList.contains('collapsed')) {
      this.innerHTML = '&#9654;'; // Right arrow
      this.title = 'Expand panel';
    } else {
      this.innerHTML = '&#9664;'; // Left arrow
      this.title = 'Collapse panel';
    }
  });
}

/**
 * Setup recording controls
 */
export function setupRecordingControls(viewerInstance) {
  // Start recording button
  document.getElementById('start').addEventListener('click', () => {
    const quality = parseInt(document.getElementById('quality').value);
    const framerate = parseInt(document.getElementById('framerate').value);
    const aspectRatio = document.getElementById('aspect-ratio').value;
    
    if (capture.startRecording({
      quality, 
      framerate, 
      aspectRatio
    })) {
      document.getElementById('start').disabled = true;
      document.getElementById('stop').disabled = false;
      document.getElementById('preview').disabled = true;
      
      capture.startAnimation(viewerInstance);
    }
  });
  
  // Preview button
  document.getElementById('preview').addEventListener('click', () => {
    if (capture.startPreview()) {
      document.getElementById('start').disabled = true;
      document.getElementById('stop').disabled = false;
      document.getElementById('preview').disabled = true;
      
      capture.startAnimation(viewerInstance);
    }
  });
  
  // Stop button
  document.getElementById('stop').addEventListener('click', () => {
    capture.stopRecording();
    
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
    document.getElementById('preview').disabled = false;
    
    visualization.state.setCurrentPoint(-1);
    visualization.updateVisualizations(viewerInstance);
  });
  
  // Dry Run button
  document.getElementById('dry-run').addEventListener('click', () => {
    console.log('Starting dry run...');
    // Disable button during dry run
    document.getElementById('dry-run').disabled = true;
    
    // Run through the sequence without capturing
    const dryRunMode = true;
    capture.startPreview(dryRunMode);
    
    // Start the animation sequence
    capture.startAnimation(viewerInstance, true); // true indicates dry run
    
    // Create status notification
    const statusDisplay = document.getElementById('status-display');
    const statusText = document.getElementById('status-text');
    if (statusDisplay && statusText) {
      statusDisplay.style.display = 'flex';
      statusText.textContent = 'Running dry run (pre-caching tiles)...';
      
      // Listen for animation complete event to re-enable button
      const onAnimationComplete = () => {
        document.getElementById('dry-run').disabled = false;
        statusDisplay.style.display = 'none';
        document.removeEventListener('animation-complete', onAnimationComplete);
        console.log('Dry run complete');
      };
      
      document.addEventListener('animation-complete', onAnimationComplete);
    }
  });
  
  // Clean UI button
  document.getElementById('clean-viewer').addEventListener('click', () => {
    console.log('Cleaning UI...');
    // Toggle visibility of UI elements
    const elementsToToggle = [
      '.hide-during-recording',
      '#capture-frame',
      '#title-callout',
      '#subtitle-display'
    ];
    
    // Get current state (assume if controls are visible, everything is visible)
    const controlsVisible = document.getElementById('controls').style.display !== 'none';
    
    // Toggle all UI elements
    elementsToToggle.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.style.display = controlsVisible ? 'none' : '';
      });
    });
    
    // Update button text based on new state
    document.getElementById('clean-viewer').textContent = controlsVisible ? 
      'Show UI' : 'Clean UI';
      
    // Return focus to the viewer for a cleaner look
    viewer.canvas.focus();
  });
}

/**
 * Setup quality control UI
 */
export function setupQualityControls(viewerInstance) {
  // Quality setting handlers
  document.getElementById('subpixel-rendering').addEventListener('change', () => {
    // Adjust OpenSeadragon settings for subpixel rendering
    const useSubpixel = document.getElementById('subpixel-rendering').checked;
    viewer.imageLoaderLimit = useSubpixel ? 10 : 5;
    viewer.immediateRender = !useSubpixel;
  });
  
  document.getElementById('smooth-animation').addEventListener('change', () => {
    // Adjust animation smoothness
    const smoothAnimation = document.getElementById('smooth-animation').checked;
    viewer.animationTime = smoothAnimation ? 0.3 : 0.1;
    viewer.blendTime = smoothAnimation ? 0.1 : 0;
  });
  
  document.getElementById('optimize-memory').addEventListener('change', () => {
    // Memory optimization setting
    const optimizeMemory = document.getElementById('optimize-memory').checked;
    viewer.imageLoaderLimit = optimizeMemory ? 3 : 10;
    viewer.maxImageCacheCount = optimizeMemory ? 50 : 200;
  });
  
  document.getElementById('render-quality').addEventListener('change', () => {
    // Adjust rendering quality
    const quality = document.getElementById('render-quality').value;
    
    switch(quality) {
      case 'high':
        viewer.defaultZoomLevel = 1;
        viewer.minZoomImageRatio = 0.1;
        viewer.maxZoomPixelRatio = 10;
        break;
      case 'medium':
        viewer.defaultZoomLevel = 0.8;
        viewer.minZoomImageRatio = 0.2;
        viewer.maxZoomPixelRatio = 5;
        break;
      case 'low':
        viewer.defaultZoomLevel = 0.5;
        viewer.minZoomImageRatio = 0.5;
        viewer.maxZoomPixelRatio = 2;
        break;
    }
    
    // Redraw to apply changes
    viewer.forceRedraw();
  });
}

/**
 * Setup URL input control
 */
export function setupUrlControl(viewerInstance) {
  // "Apply URL" button
  document.getElementById('apply-url').addEventListener('click', () => {
    const newUrl = document.getElementById('iiif-url').value.trim();
    if (newUrl) {
      // Stop any ongoing recording or preview
      if (capture.isCapturing() || capture.isPreviewMode()) {
        document.getElementById('stop').click();
      }
      
      viewer.loadNewImage(newUrl).then(() => {
        visualization.updateVisualizations(viewerInstance);
      });
    } else {
      showNotification('Please enter a valid IIIF URL', 'danger');
    }
  });
}

/**
 * Setup timeout controls
 */
export function setupTimeoutControls() {
  // Frame buffer time control
  document.getElementById('frame-buffer-time').addEventListener('change', function() {
    const value = parseInt(this.value);
    if (!isNaN(value) && value >= 0) {
      capture.setFrameBufferTime(value);
      console.log(`Frame buffer time set to ${value}ms`);
    }
  });
  
  // Default transition duration control
  document.getElementById('default-transition-duration').addEventListener('change', function() {
    const value = parseInt(this.value);
    if (!isNaN(value) && value >= 100) {
      capture.setDefaultTransitionDuration(value);
      console.log(`Default transition duration set to ${value}ms`);
    }
  });
  
  // Default still duration control
  document.getElementById('default-still-duration').addEventListener('change', function() {
    const value = parseInt(this.value);
    if (!isNaN(value) && value >= 100) {
      capture.setDefaultStillDuration(value);
      console.log(`Default still duration set to ${value}ms`);
    }
  });
  
  // Initialize with current values
  document.getElementById('frame-buffer-time').value = capture.getFrameBufferTime();
  document.getElementById('default-transition-duration').value = capture.getDefaultTransitionDuration();
  document.getElementById('default-still-duration').value = capture.getDefaultStillDuration();
}
