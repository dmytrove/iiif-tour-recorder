// filepath: c:\tools\KB\ken-burns-effect\js\ui.js
// UI controls and event handlers

// Setup event listeners for the UI controls
function setupEventListeners(viewer) {
  // Setup collapse button
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
  
  // Tab navigation
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      // Deactivate all tabs and buttons
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Activate the selected tab and button
      document.getElementById(`${tabId}-tab`).classList.add('active');
      button.classList.add('active');
    });
  });
  
  // "Add Point" button
  document.getElementById('add-point').addEventListener('click', () => {
    const viewport = viewer.viewport;
    const center = viewport.getCenter();
    const zoom = viewport.getZoom();
    
    window.KenBurns.sequence.addPoint(zoom, { x: center.x, y: center.y });
    window.KenBurns.table.updateTable();
    window.KenBurns.table.updateJsonFromSequence();
    window.KenBurns.visualization.updateVisualizations(viewer);
  });
  
  // "Apply JSON" button
  document.getElementById('apply-json').addEventListener('click', () => {
    const jsonText = document.getElementById('sequence-json').value;
    if (window.KenBurns.sequence.updateSequenceFromJson(jsonText)) {
      window.KenBurns.table.updateTable();
      window.KenBurns.visualization.updateVisualizations(viewer);
    }
  });
  
  // "Update from Table" button
  document.getElementById('update-json').addEventListener('click', () => {
    window.KenBurns.table.updateJsonFromSequence();
  });
  
  // "Update Visualization" button
  document.getElementById('update-table').addEventListener('click', () => {
    window.KenBurns.visualization.updateVisualizations(viewer);
  });
  
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
  
  // Tour tab buttons
  document.getElementById('generate-srt').addEventListener('click', () => {
    window.KenBurns.tours.downloadSRT();
  });
  
  // Toggle callouts and subtitles
  document.getElementById('show-callouts').addEventListener('change', () => {
    if (!window.KenBurns.capture.isCapturing() && !window.KenBurns.capture.isPreviewMode()) {
      window.KenBurns.visualization.clearTitleCalloutAndSubtitle();
    }
  });
  
  document.getElementById('show-subtitles').addEventListener('change', () => {
    if (!window.KenBurns.capture.isCapturing() && !window.KenBurns.capture.isPreviewMode()) {
      window.KenBurns.visualization.clearTitleCalloutAndSubtitle();
    }
  });
  
  // Global keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Escape key for canceling operations
    if (event.key === 'Escape') {
      // Check if in dry run mode
      if (window.KenBurns.dryRunMode) {
        stopDryRun(viewer);
      }
      
      // Check if UI is hidden
      const controlsVisible = document.getElementById('controls').style.display !== 'none';
      if (!controlsVisible) {
        restoreUI(viewer);
      }
    }
  });
  
  setupRecordingControls(viewer);
  setupQualityControls(viewer);
  
  // Update tour info when the tours tab is activated
  document.querySelector('.tab-button[data-tab="tours"]').addEventListener('click', updateTourInfo);
}

// Setup recording controls
function setupRecordingControls(viewer) {
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
  
  // Dry Run button
  document.getElementById('dry-run').addEventListener('click', () => {
    console.log('Starting dry run...');
    // Disable button during dry run
    document.getElementById('dry-run').disabled = true;
    
    // Run through the sequence without capturing
    const dryRunMode = true;
    window.KenBurns.capture.startPreview(dryRunMode);
    
    // Start the animation sequence
    window.KenBurns.capture.startAnimation(viewer, true); // true indicates dry run
    
    // Create status notification
    const statusDisplay = document.getElementById('status-display');
    const statusText = document.getElementById('status-text');
    if (statusDisplay && statusText) {
      statusDisplay.style.display = 'flex';
      statusText.textContent = 'Running dry run (press ESC to stop)';
      
      // Create a stop button inside the status display
      const stopButton = document.createElement('button');
      stopButton.textContent = 'Stop';
      stopButton.className = 'btn-danger stop-dry-run';
      stopButton.style.marginLeft = '10px';
      stopButton.addEventListener('click', () => stopDryRun(viewer));
      statusDisplay.appendChild(stopButton);
      
      // Listen for animation complete event to re-enable button
      const onAnimationComplete = () => {
        document.getElementById('dry-run').disabled = false;
        statusDisplay.style.display = 'none';
        // Remove stop button if it exists
        const stopBtn = statusDisplay.querySelector('.stop-dry-run');
        if (stopBtn) stopBtn.remove();
        document.removeEventListener('animation-complete', onAnimationComplete);
        console.log('Dry run complete');
      };
      
      document.addEventListener('animation-complete', onAnimationComplete);
    }
    
    // Show notification
    showNotification('Dry run started - press ESC to stop', 'info', 3000);
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
    
    if (controlsVisible) {
      // Hide UI elements
      elementsToToggle.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          element.style.display = 'none';
        });
      });
      
      // Create floating ESC key indicator
      const escIndicator = document.createElement('div');
      escIndicator.id = 'esc-key-indicator';
      escIndicator.innerHTML = 'Press <kbd>ESC</kbd> to restore UI';
      escIndicator.style.position = 'absolute';
      escIndicator.style.bottom = '10px';
      escIndicator.style.left = '10px';
      escIndicator.style.padding = '8px 12px';
      escIndicator.style.background = 'rgba(0,0,0,0.7)';
      escIndicator.style.color = 'white';
      escIndicator.style.borderRadius = '4px';
      escIndicator.style.zIndex = '1000';
      escIndicator.style.fontSize = '14px';
      escIndicator.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      document.body.appendChild(escIndicator);
      
      // Show a notification
      showNotification('UI hidden - press ESC to restore', 'info', 3000);
    } else {
      // Restore UI elements
      restoreUI(viewer);
    }
    
    // Update button text based on new state
    document.getElementById('clean-viewer').textContent = controlsVisible ? 
      'Show UI' : 'Clean UI';
      
    // Return focus to the viewer for a cleaner look
    viewer.canvas.focus();
  });
}



// Setup quality and rendering controls
function setupQualityControls(viewer) {
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

// Update tour information in the tour tab
function updateTourInfo() {
  const tourInfo = document.getElementById('tour-info');
  const tour = window.KenBurns.tours.getCurrentTour();
  
  if (!tour) {
    tourInfo.innerHTML = '<p>No tour loaded.</p>';
    return;
  }
  
  let thumbnailHTML = '';
  if (tour.thumbnail) {
    thumbnailHTML = `<img src="${tour.thumbnail}" alt="${tour.title}" class="tour-preview">`;
  }
  
  let infoHTML = `
    <div class="tour-preview-container">
      ${thumbnailHTML}
    </div>
    <h4>${tour.title}</h4>
    <p>${tour.description}</p>
    <div class="tour-details">
      <div class="detail-item">
        <span class="detail-label">ID:</span>
        <span class="detail-value">${tour.id}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Points of interest:</span>
        <span class="detail-value">${tour.pointsOfInterest.length}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Image URL:</span>
        <span class="detail-value">${tour.tiles}</span>
      </div>
    </div>
  `;
  
  tourInfo.innerHTML = infoHTML;
}

// Stop a dry run in progress
function stopDryRun(viewer) {
  if (!window.KenBurns.dryRunMode) return;
  
  console.log('Stopping dry run...');
  
  // Reset the dry run flag
  window.KenBurns.dryRunMode = false;
  
  // Stop the animation
  window.KenBurns.capture.stopRecording();
  
  // Reset UI elements
  document.getElementById('dry-run').disabled = false;
  const statusDisplay = document.getElementById('status-display');
  if (statusDisplay) {
    statusDisplay.style.display = 'none';
  }
  
  // Reset visualization
  window.KenBurns.visualization.setCurrentPoint(-1);
  window.KenBurns.visualization.updateVisualizations(viewer);
  
  // Show notification that dry run was stopped
  showNotification('Dry run stopped', 'info', 2000);
}

// Restore hidden UI elements
function restoreUI(viewer) {
  console.log('Restoring UI...');
  const elementsToRestore = [
    '.hide-during-recording',
    '#capture-frame',
    '#title-callout',
    '#subtitle-display'
  ];
  
  // Restore all hidden UI elements
  elementsToRestore.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      element.style.display = '';
    });
  });
  
  // Update button text
  const cleanButton = document.getElementById('clean-viewer');
  if (cleanButton) {
    cleanButton.textContent = 'Clean UI';
  }
  
  // Hide ESC key indicator if it exists
  const escIndicator = document.getElementById('esc-key-indicator');
  if (escIndicator) {
    escIndicator.remove();
  }
  
  showNotification('UI restored', 'info', 2000);
}

// Show a notification message
function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification-popup');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification-popup';
    notification.classList.add('notification');
    document.body.appendChild(notification);
  }
  
  // Set notification content and style
  notification.textContent = message;
  notification.className = 'notification';
  notification.classList.add(type);
  
  // Show the notification
  notification.style.display = 'block';
  
  // Clear any existing timeout
  if (window.notificationTimeout) {
    clearTimeout(window.notificationTimeout);
  }
  
  // Auto-hide after duration
  window.notificationTimeout = setTimeout(() => {
    notification.style.display = 'none';
  }, duration);
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.ui = {
  setupEventListeners,
  updateTourInfo
};