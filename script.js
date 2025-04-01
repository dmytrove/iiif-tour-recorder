// Main script file that orchestrates the Ken Burns effect app

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the OpenSeadragon viewer
  const viewer = window.KenBurns.viewer.initialize();
  
  // Initialize tours (load default tour)
  try {
    await window.KenBurns.tours.initialize();
    window.KenBurns.ui.updateTourInfo();
  } catch (error) {
    console.error('Failed to initialize tours:', error);
    // Fall back to default sequence if tour loading fails
    window.KenBurns.table.updateTable();
  }
  
  // Setup event listeners for UI interaction
  window.KenBurns.ui.setupEventListeners(viewer);
  
  // Setup table properties toggle (Removed - Feature no longer exists)
  // window.KenBurns.table.setupTablePropertiesToggle();
  
  // Set up aspect ratio handling
  window.KenBurns.interactions.setupAspectRatioHandling(viewer);
  
  // Start animation loop
  window.KenBurns.capture.animate(viewer);
  
  // Initialize visualizations once the viewer is ready
  viewer.addHandler('open', () => {
    console.log("Viewer opened, initializing visualizations.");
    window.KenBurns.visualization.initVisualizations(viewer);
    window.KenBurns.visualization.updateVisualizations(viewer);
    window.KenBurns.interactions.setupViewerInteractions(viewer);
  });
  
  // Update visualizations when viewer moves
  viewer.addHandler('animation', () => {
    window.KenBurns.visualization.updateVisualizationsForCurrentView(viewer);
  });
  
  // Listen for animation completion
  document.addEventListener('animation-complete', () => {
    console.log('Animation complete, finishing processing...');
  });
  
  // Listen for video processing completion (before download starts)
  document.addEventListener('video-processing-complete', (e) => {
    console.log(`Video processing complete, starting download for: ${e.detail.filename}`);
  });
  
  // Listen for download completion
  document.addEventListener('download-complete', (e) => {
    console.log(`Download complete for: ${e.detail.filename}`);
    resetUIAfterDownload();
  });
  
  // Listen for workflow completion
  document.addEventListener('workflow-complete', () => {
    console.log('Workflow complete, resetting application');
    resetUIAfterDownload();
  });
  
  // Reset UI elements after download/workflow completion
  function resetUIAfterDownload() {
    console.log("Resetting UI after download/workflow.");
    // Use new button IDs and logic
    const startPreviewBtn = document.getElementById('start-preview');
    const startRecordingBtn = document.getElementById('start-recording');
    const stopBtn = document.getElementById('stop-recording');

    if (startPreviewBtn) startPreviewBtn.disabled = false;
    if (startRecordingBtn) startRecordingBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true; // Stop button should be disabled when idle

    // Reset progress bar visually (optional, stopAnimation might handle it)
    if (window.KenBurns?.ui?.updateAnimationProgress) {
       // window.KenBurns.ui.updateAnimationProgress(0, 0, 0, 0, 'idle');
    }
    
    // Clean up any remaining resources
    if (window.animationInterval) {
      clearInterval(window.animationInterval);
      window.animationInterval = null;
    }
    
    // Reset visualization if needed
    window.KenBurns.visualization.setCurrentPoint(-1);
    
    // Restore viewer to initial state if needed
    window.KenBurns.viewer.resetView(viewer);
  }
});