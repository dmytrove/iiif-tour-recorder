// Video recording functionality
import * as captureState from './state.js';
import { dispatchCustomEvent } from '../utils/events.js';

// CCapture instance
let capturer = null;

/**
 * Start recording process
 */
export function startRecording(options = {}) {
  const quality = options.quality || 100;
  const framerate = options.framerate || 60;
  const aspectRatio = options.aspectRatio || '0';
  
  // Reset frame counter
  captureState.resetFrameCount();
  
  // Allow setting a custom frames directory
  if (options.framesDirectory) {
    captureState.setFramesDirectory(options.framesDirectory);
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
      name: captureState.getFramesDirectory(),
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
  
  captureState.setCapturing(true);
  captureState.setPreviewMode(false);
  
  try {
    capturer.start();
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return false;
  }
}

/**
 * Stop recording and save video
 */
export function stopRecording() {
  if (captureState.isCapturing()) {
    captureState.setCapturing(false);
    capturer.stop();
    
    // Use the callback version of save to get direct access to the blob
    capturer.save(function(blob) {
      // Generate filename 
      const filename = `ken-burns-${Date.now()}.webm`;
      
      // For PNG sequence, we need to handle differently
      const isPngSequence = blob instanceof Array;
      
      if (isPngSequence) {
        console.log(`Processing complete, saved ${blob.length} frames to ${captureState.getFramesDirectory()}/`);
        
        // Dispatch event that frames are ready
        dispatchCustomEvent('frames-complete', { 
          frameCount: blob.length,
          directory: captureState.getFramesDirectory()
        });
        
        // Signal workflow completion
        dispatchCustomEvent('workflow-complete');
        
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
        dispatchCustomEvent('download-complete', { filename });
        
        // Clear capturer resources
        capturer = null;
        
        // Signal workflow completion
        dispatchCustomEvent('workflow-complete');
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
        dispatchCustomEvent('video-processing-complete', { filename });
        
        // Set a backup timer in case other methods fail
        setTimeout(signalDownloadComplete, 5000);
      } catch (error) {
        console.error('Error saving video:', error);
        signalDownloadComplete(); // Ensure workflow completes even on error
      }
    });
  }
  
  captureState.setPreviewMode(false);
  return true;
}

/**
 * Capture current frame
 */
export function captureFrame(canvas) {
  if (captureState.isCapturing() && capturer) {
    capturer.capture(canvas);
    captureState.incrementFrameCount();
  }
}

/**
 * Get current CCapture instance
 */
export function getCapturer() {
  return capturer;
}
