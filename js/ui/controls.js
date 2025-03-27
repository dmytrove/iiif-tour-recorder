// UI controls and basic event handlers

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
export function setupRecordingControls(viewer) {
  // Start recording button
  document.getElementById('start').addEventListener('click', () => {
    const quality = parseInt(document.getElementById('quality').value);
    const framerate = parseInt(document.getElementById('framerate').value);
    const aspectRatio = document.getElementById('aspect-ratio').value;
    
    if (window.KenBurns.capture.startRecording({
      quality, 
      framerate, 
      aspectRatio
    })) {
      document.getElementById('start').disabled = true;
      document.getElementById('stop').disabled = false;
      document.getElementById('preview').disabled = true;
      
      window.KenBurns.capture.startAnimation(viewer);
    }
  });
  
  // Preview button
  document.getElementById('preview').addEventListener('click', () => {
    if (window.KenBurns.capture.startPreview()) {
      document.getElementById('start').disabled = true;
      document.getElementById('stop').disabled = false;
      document.getElementById('preview').disabled = true;
      
      window.KenBurns.capture.startAnimation(viewer);
    }
  });
  
  // Stop button
  document.getElementById('stop').addEventListener('click', () => {
    window.KenBurns.capture.stopRecording();
    
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
    document.getElementById('preview').disabled = false;
    
    window.KenBurns.visualization.setCurrentPoint(-1);
    window.KenBurns.visualization.updateVisualizations(viewer);
  });
}

/**
 * Setup quality control UI
 */
export function setupQualityControls(viewer) {
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
export function setupUrlControl(viewer) {
  // "Apply URL" button
  document.getElementById('apply-url').addEventListener('click', () => {
    const newUrl = document.getElementById('iiif-url').value.trim();
    if (newUrl) {
      // Stop any ongoing recording or preview
      if (window.KenBurns.capture.isCapturing() || window.KenBurns.capture.isPreviewMode()) {
        document.getElementById('stop').click();
      }
      
      window.KenBurns.viewer.loadNewImage(newUrl).then(() => {
        window.KenBurns.visualization.updateVisualizations(viewer);
      });
    } else {
      alert('Please enter a valid IIIF URL');
    }
  });
}
