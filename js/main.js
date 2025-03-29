// Main script file that orchestrates the Ken Burns effect app
import * as viewer from './viewer/index.js';
import * as sequence from './sequence/index.js';
import * as visualization from './visualization/index.js';
import * as capture from './capture/index.js';
import * as interactions from './interactions/index.js';
import * as ui from './ui/index.js';
import * as table from './table/index.js';
import * as tours from './tours/index.js';
import { setState } from './state/app-state.js';

// Initialize global KenBurns object
window.KenBurns = {
  viewer: null,
  sequence: sequence,  // Initialize sequence module
  currentTour: null,
  tours: tours,
  ui: ui,
  capture: capture,
  visualization: visualization,
  interactions: interactions
};

// Initialize the application state
const app = {
  viewer: null,
  sequence: sequence.getSequence(),  // Initialize with default sequence
  currentTour: null
};

// Initialize app state with default sequence
setState('sequence', app.sequence);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('App initializing...');
    
    // Initialize the OpenSeadragon viewer
    app.viewer = viewer.initializeViewer();
    
    // Initialize tours (load default tour)
    try {
      console.log('Initializing tours module...');
      await tours.initialize();
      console.log('Tours module initialized, updating tour info...');
      ui.updateTourInfo();
    } catch (error) {
      console.error('Failed to initialize tours:', error);
      // Fall back to default sequence if tour loading fails
      table.updateTable();
    }
    
    // Setup event listeners for UI interaction
    ui.setupEventListeners(app.viewer);
    
    // Setup table properties toggle
    table.setupTablePropertiesToggle();
    
    // Set up aspect ratio handling
    interactions.setupAspectRatioHandling(app.viewer);
    
    // Start animation loop
    capture.animate(app.viewer);
    
    // Initialize visualizations once the viewer is ready
    app.viewer.addHandler('open', () => {
      console.log('Viewer open, initializing visualizations...');
      // Update the global viewer reference
      window.KenBurns.viewer = app.viewer;
      setState('viewer', app.viewer);
      // Initialize visualizations
      visualization.updateVisualizations(app.viewer);
      interactions.setupViewerInteractions(app.viewer);
    });
    
    // Update visualizations when viewer moves
    app.viewer.addHandler('animation', () => {
      visualization.updateVisualizationsForCurrentView(app.viewer);
    });

    // Ensure visualizations are updated when window is resized
    window.addEventListener('resize', () => {
      requestAnimationFrame(() => {
        visualization.updateVisualizations(app.viewer);
      });
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
      visualization.state.setCurrentPoint(-1);
      
      // Restore viewer to initial state if needed
      viewer.resetView(app.viewer);
    }
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});