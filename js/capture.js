// Recording and animation capture functionality
let whammyEncoder = null; // Whammy.js video encoder instance
let capturing = false;
let previewMode = false;
let frameCount = 0;
let totalFrames = 0; // Total frames expected for the animation
let animationStartTime = 0; // Reference time for TWEEN updates
let framerate = 60; // Store globally for use in loop
let animationTweens = []; // Store the sequence of tweens
let currentTweenIndex = -1; // Track which tween is active
let globalViewer = null; // Store viewer instance

// Start recording process
function startRecording(options = {}) {
  framerate = options.framerate || 60;
  console.log(`[Whammy Debug] Starting recording at ${framerate} FPS.`);

  // Reset state
  frameCount = 0;
  totalFrames = 0;
  animationStartTime = performance.now(); // Use performance.now for high-resolution time
  animationTweens = [];
  currentTweenIndex = -1;
  
  console.log("[Whammy Debug] Checking Whammy object before use:", typeof Whammy); // DEBUG CHECK
  whammyEncoder = new Whammy.Video(framerate, 1); // Initialize Whammy
  
  globalViewer = window.KenBurns.viewer.getViewer();
  if (!globalViewer || !globalViewer.drawer || !globalViewer.drawer.canvas) {
      console.error("Viewer or canvas not available for recording.");
      alert("Error: Viewer canvas not ready for recording.");
      return false;
  }

  // --- Prepare the animation sequence --- 
  if (!prepareAnimationSequence()) {
      return false; // Error occurred during preparation
  }

  capturing = true;
  previewMode = false;
  console.log(`[Whammy Debug] Recording setup complete. Total expected frames: ${totalFrames}. Starting frame generation...`);

  // --- Start the manual frame rendering loop --- 
  renderAndCaptureFrame(); 

  return true;
}

// Function to set up the TWEEN sequence and calculate total frames
function prepareAnimationSequence() {
  const sequence = window.KenBurns.sequence.getSequence();
  if (sequence.length === 0) {
    alert('No animation sequence defined');
    return false;
  }

  animationTweens = [];
  let cumulativeTime = 0; // Track time across tweens
  const defaultTransitionDuration = parseInt(document.getElementById('default-transition-duration')?.value || 1500);
  const defaultStillDuration = parseInt(document.getElementById('default-still-duration')?.value || 1500);

  // Initial state setup (go to first point immediately)
  const firstPoint = sequence[0];
  globalViewer.viewport.zoomTo(firstPoint.zoom, null, true);
  globalViewer.viewport.panTo(new OpenSeadragon.Point(firstPoint.center.x, firstPoint.center.y), true);
  globalViewer.forceRedraw(); // Ensure initial state is drawn
  
  // Add initial still duration if any
  const firstStill = firstPoint.duration.still || defaultStillDuration;
  if (firstStill > 0) {
      const firstStillFrames = Math.round((firstStill / 1000) * framerate);
      totalFrames += firstStillFrames;
      console.log(`[Whammy Debug] Added ${firstStillFrames} frames for initial still time (${firstStill}ms)`);
      cumulativeTime += firstStill;
  }

  // Create tweens for transitions between points
  for (let i = 0; i < sequence.length - 1; i++) {
    const current = sequence[i];
    const next = sequence[i + 1];
    
    const transitionDuration = next.duration.transition || defaultTransitionDuration;
    const stillDuration = next.duration.still || defaultStillDuration;

    // Create the tween using the modified smoothPanZoom
    const tween = window.KenBurns.viewer.smoothPanZoom(
      globalViewer,
      next.zoom,
      new OpenSeadragon.Point(next.center.x, next.center.y),
      transitionDuration
    );
    
    // Chain the tweens using startTime and duration properties
    tween._startTime = cumulativeTime; 
    tween._duration = transitionDuration; // Store duration for frame calculation
    animationTweens.push(tween);
    
    // Add transition frames
    const transitionFrames = Math.round((transitionDuration / 1000) * framerate);
    totalFrames += transitionFrames;
    cumulativeTime += transitionDuration;
    console.log(`[Whammy Debug] Tween ${i}: Transition ${transitionDuration}ms (${transitionFrames} frames), starts at ${tween._startTime}ms`);

    // Add still frames for the *next* point
    if (stillDuration > 0) {
      const stillFrames = Math.round((stillDuration / 1000) * framerate);
      totalFrames += stillFrames;
       console.log(`[Whammy Debug] Tween ${i}: Still time ${stillDuration}ms (${stillFrames} frames) after transition`);
      // We don't add still time to cumulativeTime here, it represents the pause *after* the tween finishes
      // The total frame count accounts for it.
    }
  }
  
  console.log(`[Whammy Debug] Total animation duration (approx): ${cumulativeTime}ms`);
  return true;
}

// The core loop: Calculate time, update TWEEN, render, capture frame
function renderAndCaptureFrame() {
  if (!capturing) return; // Stop if capturing flag is false

  if (frameCount >= totalFrames) {
    console.log(`[Whammy Debug] Reached target frame count (${frameCount}/${totalFrames}). Finalizing video.`);
    stopRecording(); // Finished capturing all frames
    return;
  }

  // Calculate the exact time for this frame relative to the animation start
  const currentTimeMs = frameCount * (1000 / framerate);
  const elapsedTWEENTime = animationStartTime + currentTimeMs;

  // Find the currently active tween or the time between tweens (for still periods)
  let activeTween = null;
  for(let i = 0; i < animationTweens.length; i++) {
      const t = animationTweens[i];
      const tweenEndTime = t._startTime + t._duration;
      if (currentTimeMs >= t._startTime && currentTimeMs < tweenEndTime) {
          activeTween = t;
          if (currentTweenIndex !== i) {
              console.log(`[Whammy Debug] Frame ${frameCount}: Entering Tween ${i} (Time ${currentTimeMs}ms)`);
              currentTweenIndex = i;
          }
          break;
      } 
  }
  
  if (activeTween && !activeTween.isPlaying() && !activeTween._isPaused) {
      // If we found the correct tween, manually start it if not already playing 
      // (TWEEN.update will handle subsequent updates based on elapsedTWEENTime) 
      // This might not be strictly necessary if TWEEN.update(time) works correctly 
      // activeTween.start(elapsedTWEENTime); // Use time parameter for start
  }
  
  // Manually update TWEEN to the calculated time
  TWEEN.update(elapsedTWEENTime);

  // Force redraw and capture after a short delay or event
  // Using a small timeout is often necessary for the canvas to update visually after TWEEN sets the state
  globalViewer.forceRedraw();
  setTimeout(() => {
    if (!capturing) return; // Check again in case stop was called

    const canvas = globalViewer.drawer.canvas;
    if (!canvas) {
        console.error(`[Whammy Debug] Frame ${frameCount}: Canvas not found! Stopping.`);
        stopRecording(); // Critical error
        return;
    }
    
    // Capture frame as WebP Data URL
    // Note: quality factor (0.0 - 1.0). 0.8 is a good balance.
    const dataUrl = canvas.toDataURL('image/webp', 0.8);
    
    // Add frame to Whammy encoder
    whammyEncoder.add(dataUrl);
    // console.log(`[Whammy Debug] Added frame ${frameCount} at time ${currentTimeMs.toFixed(2)}ms`); // Verbose log

    // Progress update (optional, log every N frames)
    if (frameCount % 10 === 0 || frameCount === totalFrames - 1) {
        console.log(`[Whammy Debug] Progress: Frame ${frameCount} / ${totalFrames}`);
    }

    // Increment frame count and schedule next frame
    frameCount++;
    if (capturing) {
        // Use setTimeout 0 for async break, allowing UI updates & preventing script lockup
        setTimeout(renderAndCaptureFrame, 0); 
    }
  }, 30); // Small delay (e.g., 30ms) - ADJUST IF FRAMES AREN'T UPDATING CORRECTLY

}


// Start preview mode (Plays animation normally using TWEEN.start)
function startPreview() {
  console.log('[Whammy Debug] Starting preview mode.');
  capturing = false;
  previewMode = true;
  
  globalViewer = window.KenBurns.viewer.getViewer();
  const sequence = window.KenBurns.sequence.getSequence();
  if (sequence.length === 0) return false;

  // Reset visualization and go to start
  window.KenBurns.visualization.setCurrentPoint(0);
  const firstPoint = sequence[0];
  globalViewer.viewport.zoomTo(firstPoint.zoom);
  globalViewer.viewport.panTo(new OpenSeadragon.Point(firstPoint.center.x, firstPoint.center.y));
  
  // Start standard animation using animateNextPoint (which uses TWEEN.start)
  animateNextPoint(globalViewer, 0); 
  return true;
}

// Stop recording and compile video
function stopRecording() {
  console.log('[Whammy Debug] stopRecording called.');
  if (!capturing && !previewMode) {
      console.warn("[Whammy Debug] stopRecording called but not capturing or in preview mode.");
      return true; // No action needed
  }

  capturing = false; // Ensure loop stops
  previewMode = false;

  if (whammyEncoder) {
    console.log("[Whammy Debug] Compiling video...");
    try {
        // Log encoder state before compiling
        console.log("[Whammy Debug] Frames added before compile:", whammyEncoder.frames ? whammyEncoder.frames.length : 'Encoder missing or no frames array?');
        
        // --- Restore ASYNCHRONOUS compile call with callback --- 
        whammyEncoder.compile(false, function(outputBlob) { 
          if (!outputBlob) {
              // Handle potential null/undefined blob from callback
              console.error("[Whammy Debug] Whammy compilation callback received invalid blob.");
              alert("Error creating video: Compilation failed to produce data.");
              // Trigger cleanup and UI reset via finally block
              throw new Error("Whammy compilation failed internally."); // Throw to reach finally
          }

          console.log("[Whammy Debug] Compilation complete. Blob size:", outputBlob.size);
          
          const filename = `ken-burns-whammy-${Date.now()}.webm`;
          console.log(`[Whammy Debug] Saving video as ${filename}...`);

          if (typeof saveAs !== 'undefined') {
              saveAs(outputBlob, filename);
              console.log("[Whammy Debug] File saving initiated via saveAs.");
               // Signal video processing complete (saving initiated)
              document.dispatchEvent(new CustomEvent('video-processing-complete', {
                detail: { 
                  parts: 1, // Only one part with Whammy
                  message: `Saved frame-by-frame video as ${filename}.`
                }
              }));

          } else {
              console.error("FileSaver.js (saveAs) is not available.");
              alert("Error: Cannot save the file. FileSaver library not found.");
          }
          
          // Note: Cleanup and workflow completion now happens in the finally block below
          // to ensure it runs even if saving fails.

        }); // End of compile callback
        // --- End Restore ---
          
    } catch (error) {
        // Log the full error during compile *initiation* 
        console.error("[Whammy Debug] Error during Whammy compilation initiation. Raw error:", error);
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
        alert(`Error creating video: ${error.name} - ${error.message}`);
        // Ensure finally block runs for cleanup
        throw error; // Re-throw to ensure finally block executes after this catch
    } finally {
        // Clean up and signal completion - runs after try or catch
        whammyEncoder = null; 
        animationTweens = [];
        console.log("[Whammy Debug] Cleaned up Whammy resources (finally block).");
         // Signal workflow completion
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('workflow-complete'));
          console.log("[Whammy Debug] Workflow complete event dispatched (finally block).");
        }, 500);
    }
  } else if (!previewMode) { // Don't warn if just stopping preview
      console.warn("[Whammy Debug] stopRecording called, but Whammy encoder wasn't active.");
      // Still dispatch workflow complete to reset UI
      document.dispatchEvent(new CustomEvent('workflow-complete'));
  }
  
  // If stopping preview, reset TWEEN
  if(previewMode) {
      TWEEN.removeAll();
      window.KenBurns.visualization.setCurrentPoint(-1);
      document.dispatchEvent(new CustomEvent('workflow-complete'));
  }
  
  return true;
}

// Original startAnimation function - NO LONGER USED FOR RECORDING
// We use prepareAnimationSequence and renderAndCaptureFrame instead.
/*
function startAnimation(viewer) { ... }
*/

// Animate to next point - USED ONLY FOR PREVIEW MODE
function animateNextPoint(viewer, index) {
  // Only run this logic if in preview mode
  if (!previewMode) return;
  
  console.log(`[Whammy Debug - Preview] animateNextPoint called with index: ${index}`); // DEBUG
  const sequence = window.KenBurns.sequence.getSequence();

  if (index >= sequence.length - 1) {
    console.log(`[Whammy Debug - Preview] Reached end of sequence or last point (index: ${index}).`);
    // Stop preview animation
    setTimeout(() => {
        if (previewMode) { // Check again in case stop was called
            previewMode = false;
            window.KenBurns.visualization.setCurrentPoint(-1);
            document.dispatchEvent(new CustomEvent('animation-complete'));
            document.dispatchEvent(new CustomEvent('workflow-complete'));
            console.log("[Whammy Debug - Preview] Preview finished and UI reset.");
        }
    }, (sequence[index].duration.still || parseInt(document.getElementById('default-still-duration')?.value || 1500)) + parseInt(document.getElementById('frame-delay')?.value || 100));
    return;
  }

  // Set current point visualization
  window.KenBurns.visualization.setCurrentPoint(index + 1);

  const next = sequence[index + 1];
  const defaultTransitionDuration = parseInt(document.getElementById('default-transition-duration')?.value || 1500);
  const defaultStillDuration = parseInt(document.getElementById('default-still-duration')?.value || 1500);
  const transitionDuration = next.duration.transition || defaultTransitionDuration;
  const stillDuration = next.duration.still || defaultStillDuration;
  const frameDelay = parseInt(document.getElementById('frame-delay')?.value || 100);

  // Get the configured tween and START it for preview
  console.log(`[Whammy Debug - Preview] Calling smoothPanZoom for index ${index + 1} and starting tween.`); // DEBUG
  const tween = window.KenBurns.viewer.smoothPanZoom(
    viewer,
    next.zoom,
    new OpenSeadragon.Point(next.center.x, next.center.y),
    transitionDuration
  );
  tween.start(); // Start the tween for live preview

  // Schedule the next step
  const totalDelay = transitionDuration + stillDuration + frameDelay;
  console.log(`[Whammy Debug - Preview] Scheduling next animateNextPoint(${index + 1}) call in ${totalDelay}ms.`); // DEBUG
  setTimeout(() => {
    if (previewMode) { // Only proceed if still in preview mode
       animateNextPoint(viewer, index + 1);
    }
  }, totalDelay);
}

// Animation loop - NOW ONLY USED FOR PREVIEW MODE's TWEEN updates
function animate(viewer) {
  requestAnimationFrame(() => animate(viewer)); // Keep requesting frames for preview

  // Only update TWEEN if in preview mode
  if (previewMode) {
    TWEEN.update();
  }
  
  // Update capture frame visualization if needed (keep this UI feature)
  if (document.getElementById('show-capture-frame').checked) {
    const aspectRatio = document.getElementById('aspect-ratio').value;
    // Ensure viewer is available (might not be if called before init)
    const currentViewer = window.KenBurns.viewer.getViewer(); 
    if (currentViewer) {
        window.KenBurns.visualization.updateCaptureFrame(currentViewer, aspectRatio);
    }
  }
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.capture = {
  startRecording,
  startPreview,
  stopRecording,
  // startAnimation, // No longer the primary entry point for recording
  animate, // Still needed for preview TWEEN updates and capture frame viz
  isCapturing: () => capturing,
  isPreviewMode: () => previewMode
};