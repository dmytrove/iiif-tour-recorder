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
  
  // Function to reset UI after download is complete
  function resetUIAfterDownload() {
    // Reset UI elements
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
    document.getElementById('preview').disabled = false;
    
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