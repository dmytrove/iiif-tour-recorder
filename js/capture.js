// Recording and animation capture functionality
let capturers = [];
let capturedFrames = []; // Track which instances have captured frames
let activeCapturerIndex = 0;
let capturing = false;
let previewMode = false;
let frameCount = 0;
let framesDirectory = 'frames';

// Start recording process
function startRecording(options = {}) {
  const quality = options.quality || 100;
  const framerate = options.framerate || 60;
  const aspectRatio = options.aspectRatio || '0';
  const numInstances = parseInt(document.getElementById('parallel-instances')?.value || 4);

  // Reset frame counter and capturers
  frameCount = 0;
  capturers = [];
  capturedFrames = [];
  activeCapturerIndex = 0;

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

  // Initialize multiple CCapture instances
  for (let i = 0; i < numInstances; i++) {
    let capturer;
    
    if (options.saveFrames) {
      // Use PNG sequence for individual frames
      capturer = new CCapture({
        format: 'png',
        framerate,
        name: `${framesDirectory}-part${i + 1}`,
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
        name: `ken-burns-animation-part${i + 1}`,
        workersPath: './',
        width,
        height,
        verbose: false,
      });
    }
    
    capturers.push(capturer);
    capturer.start();
  }

  capturing = true;
  previewMode = false;

  try {
    console.log(`Started recording with ${numInstances} parallel CCapture instances`);
    
    // Initialize the capturedFrames array with false values
    capturedFrames = new Array(numInstances).fill(false);
    
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return false;
  }
}

// Start preview mode
function startPreview() {
  capturing = false;
  previewMode = true;
  return true;
}

// Stop recording/preview and save if recording
function stopRecording() {
  if (capturing) {
    capturing = false;
    
    // Stop all capturers
    capturers.forEach(capturer => capturer.stop());
    
    console.log("Captured frames by instance:", capturedFrames);
    console.log("Total frames captured:", frameCount);
    
    // Check if any frames were captured
    const hasFrames = capturedFrames.some(captured => captured);
    
    if (!hasFrames) {
      console.warn("No frames were captured by any instance!");
      
      // If no frames were captured, try creating a dummy frame in the first instance
      if (capturers.length > 0) {
        try {
          const dummyCanvas = document.createElement('canvas');
          dummyCanvas.width = 320;
          dummyCanvas.height = 240;
          const ctx = dummyCanvas.getContext('2d');
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, dummyCanvas.width, dummyCanvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.fillText('No frames captured', 50, 120);
          
          capturers[0].capture(dummyCanvas);
          capturedFrames[0] = true;
          console.log("Created a dummy frame in the first instance");
        } catch (error) {
          console.error("Failed to create dummy frame:", error);
        }
      }
    }
    
    // Track completion for all parts
    const usedCapturers = capturers.filter((_, i) => capturedFrames[i]);
    const totalParts = usedCapturers.length;
    
    if (totalParts === 0) {
      console.error("No CCapture instances have frames to save!");
      // Dispatch workflow completion event to reset UI
      document.dispatchEvent(new CustomEvent('workflow-complete'));
      return true;
    }
    
    let completedParts = 0;
    const partBlobs = [];
    
    // Only save CCapture instances that have captured frames
    usedCapturers.forEach((capturer, index) => {
      console.log(`Saving CCapture instance ${index} (has frames: ${capturedFrames[index]})`);
      
      try {
        capturer.save(function(blob) {
          // Generate filename with part number
          const isPngSequence = blob instanceof Array;
          const partNumber = index + 1;
          
          if (isPngSequence) {
            console.log(`Processing complete, saved ${blob.length} frames to ${framesDirectory}-part${partNumber}/`);
            
            // Store the part data
            partBlobs[index] = {
              type: 'png-sequence',
              data: blob,
              partNumber
            };
          } else {
            const filename = `ken-burns-part${partNumber}-${Date.now()}.webm`;
            console.log(`Processing complete for part ${partNumber}, saving as ${filename}...`);
            
            // Store the part data
            partBlobs[index] = {
              type: 'webm',
              data: blob,
              filename,
              partNumber
            };
            
            // Save each part as a separate file
            try {
              if (typeof saveAs !== 'undefined') {
                saveAs(blob, filename);
              } else {
                // Fallback method
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }, 100);
              }
            } catch (error) {
              console.error(`Error saving part ${partNumber}:`, error);
            }
          }
          
          // Track completion
          completedParts++;
          
          // When all parts are complete, signal workflow completion
          if (completedParts === totalParts) {
            // Signal that video processing is complete
            document.dispatchEvent(new CustomEvent('video-processing-complete', {
              detail: { 
                parts: partBlobs.length,
                message: `Saved ${partBlobs.length} video part${partBlobs.length > 1 ? 's' : ''}. ${partBlobs.length > 1 ? 'You\'ll need to combine them using an external tool.' : ''}`
              }
            }));
            
            // Signal workflow completion
            setTimeout(() => {
              document.dispatchEvent(new CustomEvent('workflow-complete'));
            }, 1000);
            
            // Clear resources
            capturers = [];
          }
        });
      } catch (error) {
        console.error(`Error saving CCapture instance ${index}:`, error);
        completedParts++;
        
        // Check if this was the last part
        if (completedParts === totalParts) {
          // Signal workflow completion even if there was an error
          document.dispatchEvent(new CustomEvent('workflow-complete'));
        }
      }
    });
  }

  previewMode = false;
  return true;
}

// Start the animation sequence
function startAnimation(viewer) {
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

// Animate to next point
function animateNextPoint(viewer, index) {
  const sequence = window.KenBurns.sequence.getSequence();

  if (index >= sequence.length - 1) {
    if (capturing || previewMode) {
      // At the last point, wait for the still duration and then stop
      const currentPoint = sequence[index];
      
      // Get default still duration from settings
      const defaultStillDuration = parseInt(document.getElementById('default-still-duration')?.value || 1500);
      const stillDuration = currentPoint.duration.still || defaultStillDuration;
      
      // Get the frame delay from settings
      const frameDelay = parseInt(document.getElementById('frame-delay')?.value || 100);

      setTimeout(() => {
        stopRecording();
        window.KenBurns.visualization.setCurrentPoint(-1);

        // Signal animation completion
        document.dispatchEvent(new CustomEvent('animation-complete'));
      }, stillDuration + frameDelay);
    }
    return;
  }

  // Set current point to next point
  window.KenBurns.visualization.setCurrentPoint(index + 1);

  const next = sequence[index + 1];
  
  // Get default durations from settings
  const defaultTransitionDuration = parseInt(document.getElementById('default-transition-duration')?.value || 1500);
  const defaultStillDuration = parseInt(document.getElementById('default-still-duration')?.value || 1500);
  
  // Use point-specific durations if available, otherwise use defaults
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
  
  // Get the frame delay from settings
  const frameDelay = parseInt(document.getElementById('frame-delay')?.value || 100);

  // Schedule the next animation after transition + still time + frame delay
  setTimeout(() => {
    animateNextPoint(viewer, index + 1);
  }, transitionDuration + stillDuration + frameDelay);
}

// Animation loop
function animate(viewer) {
  requestAnimationFrame(() => animate(viewer));

  // Update tweens
  TWEEN.update();

  // Capture frame if recording
  if (capturing && capturers.length > 0) {
    viewer.forceRedraw();

    // Get the canvas from the viewer
    const canvas = viewer.drawer.canvas;
    if (canvas) {
      // If the subpixel rendering option is enabled, apply additional smoothing
      const subpixelRendering = document.getElementById('subpixel-rendering').checked;

      // Get the current capturer using round-robin
      const capturer = capturers[activeCapturerIndex];
      
      // Advance to the next capturer for the next frame
      activeCapturerIndex = (activeCapturerIndex + 1) % capturers.length;
      
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
      
      // Track frame count
      frameCount++;
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
  isPreviewMode: () => previewMode
};