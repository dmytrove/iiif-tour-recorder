// Recording and animation capture functionality
let capturer = null;
let capturing = false;
let previewMode = false;
let frameCount = 0;
let framesDirectory = 'frames';
let frameBufferTime = 100; // Default buffer time between animation frames
let defaultTransitionDuration = 1500; // Default transition duration in ms
let defaultStillDuration = 1500; // Default still duration in ms

// Start recording process
function startRecording(options = {}) {
  const quality = options.quality || 100;
  const framerate = options.framerate || 60;
  const aspectRatio = options.aspectRatio || '0';
  
  // Reset frame counter
  frameCount = 0;
  
  // Allow setting a custom frames directory
  if (options.framesDirectory) {
    framesDirectory = options.framesDirectory;
  }
  
  const container = document.getElementById('viewer');
  const containerRect = container.getBoundingClientRect();
  
  let width, height;
  
  // Set dimensions based on aspect ratio
  if (aspectRatio === '0') {
    // Use full viewport
    width = containerRect.width;
    height = containerRect.height;
  } else if (aspectRatio === 'custom') {
    // Custom ratio
    width = parseInt(document.getElementById('custom-width').value);
    height = parseInt(document.getElementById('custom-height').value);
  } else {
    // Predefined ratio
    const [w, h] = aspectRatio.split(':').map(Number);
    const ratio = w / h;
    
    // Base the size on the larger dimension to maintain quality
    if (containerRect.width >= containerRect.height) {
      width = Math.min(containerRect.width, 1920); // Cap at 1920 for performance
      height = width / ratio;
    } else {
      height = Math.min(containerRect.height, 1080); // Cap at 1080 for performance
      width = height * ratio;
    }
  }
  
  // Round to even numbers for video encoding compatibility
  width = Math.floor(width / 2) * 2;
  height = Math.floor(height / 2) * 2;
  
  // Initialize CCapture with options
  if (options.saveFrames) {
    // Use PNG sequence for individual frames
    capturer = new CCapture({
      format: 'png',
      framerate,
      name: framesDirectory,
      quality,
      workersPath: './',
      width,
      height,
      verbose: false,
    });
  } else {
    // Use webm for standard video capture
    capturer = new CCapture({
      format: 'webm',
      framerate,
      quality,
      name: 'ken-burns-animation',
      workersPath: './',
      width,
      height,
      verbose: false,
    });
  }
  
  capturing = true;
  previewMode = false;
  
  try {
    capturer.start();
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return false;
  }
}

// Start preview mode
function startPreview(isDryRun = false) {
  capturing = false;
  previewMode = true;
  
  // Store the dry run state for animation completion handling
  window.KenBurns.dryRunMode = isDryRun || false;
  
  return true;
}

// Stop recording/preview and save if recording
function stopRecording() {
  if (capturing) {
    capturing = false;
    capturer.stop();
    
    // Use the callback version of save to get direct access to the blob
    capturer.save(function(blob) {
      // Generate filename 
      const filename = `ken-burns-${Date.now()}.webm`;
      
      // For PNG sequence, we need to handle differently
      const isPngSequence = blob instanceof Array;
      
      if (isPngSequence) {
        console.log(`Processing complete, saved ${blob.length} frames to ${framesDirectory}/`);
        
        // Dispatch event that frames are ready
        document.dispatchEvent(new CustomEvent('frames-complete', {
          detail: { 
            frameCount: blob.length,
            directory: framesDirectory
          }
        }));
        
        // Signal workflow completion
        document.dispatchEvent(new CustomEvent('workflow-complete'));
        
        // Clear capturer resources
        capturer = null;
        return;
      }
      
      console.log(`Processing complete, saving video as ${filename}...`);
      
      // Create a separate variable to track download completion
      let downloadComplete = false;
      
      // Create a function to signal download completion
      const signalDownloadComplete = () => {
        if (downloadComplete) return; // Prevent multiple calls
        
        downloadComplete = true;
        console.log(`Video download complete: ${filename}`);
        
        // Dispatch event for download completion
        document.dispatchEvent(new CustomEvent('download-complete', {
          detail: { filename }
        }));
        
        // Clear capturer resources
        capturer = null;
        
        // Signal workflow completion
        document.dispatchEvent(new CustomEvent('workflow-complete'));
      };
      
      try {
        // Check if saveAs is available (from FileSaver.js)
        if (typeof saveAs !== 'undefined') {
          // Use saveAs to save the blob with tracking
          const originalSaveAs = saveAs;
          window.saveAs = function(blob, filename) {
            const result = originalSaveAs(blob, filename);
            
            // Signal completion after a short delay for the download to start
            setTimeout(signalDownloadComplete, 500);
            
            // Restore original function
            window.saveAs = originalSaveAs;
            
            return result;
          };
          
          saveAs(blob, filename);
        } else {
          // Fallback method if FileSaver.js is not available
          console.warn('FileSaver.js not available, using fallback download method');
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          
          // Add listener to detect when download starts
          a.addEventListener('click', () => {
            // Signal completion after a short delay
            setTimeout(signalDownloadComplete, 500);
          });
          
          document.body.appendChild(a);
          a.click();
          
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }
        
        // Signal that video processing is complete and download is starting
        document.dispatchEvent(new CustomEvent('video-processing-complete', {
          detail: { filename }
        }));
        
        // Set a backup timer in case other methods fail
        setTimeout(signalDownloadComplete, 5000);
      } catch (error) {
        console.error('Error saving video:', error);
        signalDownloadComplete(); // Ensure workflow completes even on error
      }
    });
  }
  
  previewMode = false;
  return true;
}

// Start the animation sequence
function startAnimation(viewer, isDryRun = false) {
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
  
  // Store the dry run state for reference
  window.KenBurns.dryRunMode = isDryRun || false;
  
  // Allow time to settle at the first point
  setTimeout(() => {
    animateNextPoint(viewer, 0);
  }, 500);
  
  return true;
}

// Animate to next point
function animateNextPoint(viewer, index) {
  const sequence = window.KenBurns.sequence.getSequence();
  
  if (index >= sequence.length - 1) {
    if (capturing || previewMode) {
      // At the last point, wait for the still duration and then stop
      const currentPoint = sequence[index];
      const stillDuration = currentPoint.duration.still || 1000;
      
      setTimeout(() => { 
        stopRecording(); 
        window.KenBurns.visualization.setCurrentPoint(-1);
        
        // Signal animation completion
        document.dispatchEvent(new CustomEvent('animation-complete'));
      }, stillDuration + 500);
    }
    return;
  }
  
  // Set current point to next point
  window.KenBurns.visualization.setCurrentPoint(index + 1);
  
  const next = sequence[index + 1];
  const transitionDuration = next.duration.transition || defaultTransitionDuration;
  
  // Animate to the next point with the transition duration
  window.KenBurns.viewer.smoothPanZoom(
    viewer, 
    next.zoom, 
    new OpenSeadragon.Point(next.center.x, next.center.y), 
    transitionDuration
  ).start();
  
  // After transition is done, wait for the still duration
  const stillDuration = next.duration.still || defaultStillDuration;
  
  // Schedule the next animation after transition + still time
  setTimeout(() => {
    animateNextPoint(viewer, index + 1);
  }, transitionDuration + stillDuration + frameBufferTime);
}

// Animation loop
function animate(viewer) {
  requestAnimationFrame(() => animate(viewer));
  
  // Update tweens
  TWEEN.update();
  
  // Capture frame if recording
  if (capturing && capturer) {
    viewer.forceRedraw();
    
    // Get the canvas from the viewer
    const canvas = viewer.drawer.canvas;
    if (canvas) {
      // If the subpixel rendering option is enabled, apply additional smoothing
      const subpixelRendering = document.getElementById('subpixel-rendering').checked;
      
      if (subpixelRendering) {
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
        
        // Capture the enhanced frame
        capturer.capture(tempCanvas);
      } else {
        // Capture the standard frame
        capturer.capture(canvas);
      }
    }
  }
  
  // Update capture frame if needed
  if (document.getElementById('show-capture-frame').checked) {
    const aspectRatio = document.getElementById('aspect-ratio').value;
    window.KenBurns.visualization.updateCaptureFrame(viewer, aspectRatio);
  }
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.capture = {
  startRecording,
  startPreview,
  stopRecording,
  startAnimation,
  animate,
  isCapturing: () => capturing,
  isPreviewMode: () => previewMode,
  getFrameBufferTime: () => frameBufferTime,
  setFrameBufferTime: (time) => { frameBufferTime = time; },
  getDefaultTransitionDuration: () => defaultTransitionDuration,
  setDefaultTransitionDuration: (time) => { defaultTransitionDuration = time; },
  getDefaultStillDuration: () => defaultStillDuration,
  setDefaultStillDuration: (time) => { defaultStillDuration = time; }
};