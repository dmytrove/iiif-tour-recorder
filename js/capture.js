// Recording and animation capture functionality
let capturer = null;
let isCapturing = false;
let isPreview = false;
let currentFrame = 0;
let totalFrames = 0;
let animationStartTime = 0;
let animationRequest = null;
let totalDurationSeconds = 0; // Added to store total time

// Start recording process
function startRecording(options = {}) {
  const quality = options.quality || 100;
  const framerate = options.framerate || 60;
  const aspectRatio = options.aspectRatio || '0';

  // Reset frame counter
  currentFrame = 0;

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

  isCapturing = true;
  isPreview = false;

  try {
    capturer.start();
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return false;
  }
}

// Start preview mode
function startPreview() {
  isCapturing = false;
  isPreview = true;
  return true;
}

// Stop recording/preview and save if recording
function stopRecording() {
  if (isCapturing) {
    stopAnimation();
    isCapturing = false;
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

  isPreview = false;
  return true;
}

// Function to stop the animation loop and TWEEN updates
function stopAnimation() {
  console.log("Stopping animation loop.");
  if (animationRequest) {
    cancelAnimationFrame(animationRequest);
    animationRequest = null;
  }
  TWEEN.removeAll(); // Stop all tweens
  // Reset visualization state if needed
  if (window.KenBurns && window.KenBurns.visualization && window.KenBurns.visualization.setCurrentPoint) {
    window.KenBurns.visualization.setCurrentPoint(-1);
  }
  // Reset progress bar UI to idle/complete state
  if (window.KenBurns.ui && window.KenBurns.ui.updateAnimationProgress) {
    // Show 100% if it was running, 0% otherwise. Use 'complete' state if it was running.
    const finalTime = (isCapturing || isPreview) ? totalDurationSeconds : 0;
    const finalFrame = (isCapturing) ? totalFrames : 0;
    const finalState = (isCapturing || isPreview) ? 'complete' : 'idle';
    window.KenBurns.ui.updateAnimationProgress(finalTime, totalDurationSeconds, finalFrame, finalFrame, finalState);
    // After a short delay, reset to idle visually
    setTimeout(() => {
         if (!isCapturing && !isPreview && window.KenBurns.ui?.updateAnimationProgress) { // Check if still stopped
             window.KenBurns.ui.updateAnimationProgress(0, 0, 0, 0, 'idle');
         }
    }, 2000); // Reset after 2 seconds
  }
}

// Function to stop the preview process
function stopPreview() {
  if (!isPreview) {
    console.log("Not previewing.");
    return;
  }
  console.log("Stopping preview...");
  stopAnimation(); // Stops TWEEN and resets progress bar

  isPreview = false;
  isCapturing = false;
  console.log("Preview stopped.");
  if (window.KenBurns?.ui?.showToast) window.KenBurns.ui.showToast("Preview stopped.", "info");
  // Ensure UI state is reset via ui.js listener
}

// Function to start the animation process (either recording or preview)
function startAnimation(viewer) {
  const sequence = window.KenBurns.sequence.getSequence();
  if (!sequence || sequence.length < 2) {
    console.error("Sequence must have at least two points to animate.");
    if (window.KenBurns?.ui?.showToast) window.KenBurns.ui.showToast("Error: Add at least two points to the sequence.", "error");
    return false;
  }

  // Reset counters and state
  currentFrame = 0;
  totalFrames = 0;
  totalDurationSeconds = 0;
  animationStartTime = 0;

  // Get settings
  const framerate = parseInt(document.getElementById('framerate')?.value || 30);
  const defaultTransitionDuration = parseInt(document.getElementById('default-transition-duration')?.value || 1500);
  const defaultStillDuration = parseInt(document.getElementById('default-still-duration')?.value || 1500);
  const frameDelay = parseInt(document.getElementById('frame-delay')?.value || 100);

  // Calculate total duration and total frames (only needed for recording progress)
  for (let i = 0; i < sequence.length; i++) {
    const point = sequence[i];
    const transitionDuration = (i > 0 ? point.duration.transition : 0) || (i > 0 ? defaultTransitionDuration : 0);
    const stillDuration = point.duration.still || defaultStillDuration;

    // Add transition time (after the first point)
    if (i > 0) {
        totalDurationSeconds += (transitionDuration / 1000);
    }
    // Add still time
    totalDurationSeconds += (stillDuration / 1000);

    // Add frame delay time (between points)
    if (i < sequence.length - 1) {
        totalDurationSeconds += (frameDelay / 1000);
    }
  }

  if (isCapturing) {
      totalFrames = Math.ceil(totalDurationSeconds * framerate);
      console.log(`Calculated total duration: ${totalDurationSeconds.toFixed(2)}s, total frames: ${totalFrames}`);
  }

  // Reset UI progress display
  if (window.KenBurns.ui && window.KenBurns.ui.updateAnimationProgress) {
     window.KenBurns.ui.updateAnimationProgress(0, totalDurationSeconds, 0, totalFrames, isCapturing ? 'recording' : isPreview ? 'previewing' : 'idle');
  }

  // Set current point to start
  window.KenBurns.visualization.setCurrentPoint(0);

  // Reset to first point
  const firstPoint = sequence[0];
  viewer.viewport.zoomTo(firstPoint.zoom);
  viewer.viewport.panTo(new OpenSeadragon.Point(firstPoint.center.x, firstPoint.center.y));

  // Trigger the animation sequence starting from the first point
  setTimeout(() => {
    // Ensure TWEEN is available
    if (typeof TWEEN === 'undefined') {
      console.error("TWEEN is not loaded!");
      if (window.KenBurns?.ui?.showToast) window.KenBurns.ui.showToast("Error: Animation library not loaded.", "error");
      // Potentially reset UI state here
      return;
    }
    console.log("Starting animation sequence...");
    animateNextPoint(viewer, 0); // Start with the first point (index 0)
    if (window.KenBurns?.ui?.showToast) {
        if (isPreview) window.KenBurns.ui.showToast("Preview started.", "info");
        else if (isCapturing) window.KenBurns.ui.showToast("Recording started...", "info");
    }
  }, 50); // Short delay to allow UI to update before intensive work

  // Start the core animation/capture loop (TWEEN updates and frame capture)
  animationStartTime = performance.now();
  animate(viewer); // Start the TWEEN update/capture loop

  return true; // Indicate animation started
}

// Animate to next point
function animateNextPoint(viewer, index) {
  const sequence = window.KenBurns.sequence.getSequence();

  if (index >= sequence.length - 1) {
    if (isCapturing || isPreview) {
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
  animationRequest = requestAnimationFrame(() => animate(viewer)); // Store the request ID

  // Update tweens
  TWEEN.update();

  // Update progress and capture frame if recording
  let elapsedSeconds = (performance.now() - animationStartTime) / 1000;
  let state = isCapturing ? 'recording' : isPreview ? 'previewing' : 'idle';

  if (isCapturing && capturer) {
    viewer.forceRedraw();
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
      currentFrame++; // Increment frame counter *after* capturing
    }
    // Ensure elapsed time doesn't exceed total duration for display
    elapsedSeconds = Math.min(elapsedSeconds, totalDurationSeconds);
  } else if (isPreview) {
     // Ensure elapsed time doesn't exceed total duration for display
     elapsedSeconds = Math.min(elapsedSeconds, totalDurationSeconds);
  } else {
     elapsedSeconds = 0; // Reset time if not running
  }

  // Update UI progress display
  if (window.KenBurns.ui && window.KenBurns.ui.updateAnimationProgress) {
     // Pass totalFrames only when capturing
     window.KenBurns.ui.updateAnimationProgress(elapsedSeconds, totalDurationSeconds, currentFrame, isCapturing ? totalFrames : 0, state);
  }

  // Update capture frame if needed
  if (document.getElementById('show-capture-frame').checked) {
    const aspectRatio = document.getElementById('aspect-ratio').value;
    window.KenBurns.visualization.updateCaptureFrame(viewer, aspectRatio);
  }
}

// Helper function to update the progress bar UI
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('animation-progress-bar');
    if (progressBar) {
        const clampedPercentage = Math.min(100, Math.max(0, percentage));
        progressBar.style.width = `${clampedPercentage}%`;
        progressBar.setAttribute('aria-valuenow', clampedPercentage.toFixed(0));
        // Change color based on state?
        if (isCapturing) {
            progressBar.classList.remove('bg-info');
            progressBar.classList.add('bg-danger');
        } else if (isPreview) {
            progressBar.classList.remove('bg-danger');
            progressBar.classList.add('bg-info');
        } else {
            progressBar.classList.remove('bg-danger', 'bg-info'); // Reset if neither
        }
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
  isCapturing: () => isCapturing,
  isPreviewMode: () => isPreview,
  stopPreview
};