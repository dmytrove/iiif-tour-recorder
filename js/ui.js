// filepath: c:\github\iiif-tour-recorder\js\ui.js
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
  
  // Initialize Bootstrap tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
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
      showNotification('Please enter a valid IIIF URL', 'danger');
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
  
  // Handle tab changes to ensure proper UI updates
  const tabEls = document.querySelectorAll('[data-bs-toggle="tab"]');
  tabEls.forEach(tabEl => {
    tabEl.addEventListener('shown.bs.tab', event => {
      const tabId = event.target.getAttribute('data-tab');
      if (tabId === 'tours') {
        updateTourInfo();
      }
    });
  });
  
  setupRecordingControls(viewer);
  setupQualityControls(viewer);
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
      statusDisplay.classList.remove('d-none');
      statusText.textContent = 'Running dry run (press ESC to stop)';
      
      // Create a stop button inside the status display if it doesn't exist
      if (!statusDisplay.querySelector('.stop-dry-run')) {
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop';
        stopButton.className = 'btn btn-sm btn-danger ms-2 stop-dry-run';
        stopButton.addEventListener('click', () => stopDryRun(viewer));
        statusDisplay.appendChild(stopButton);
      }
      
      // Listen for animation complete event to re-enable button
      const onAnimationComplete = () => {
        document.getElementById('dry-run').disabled = false;
        statusDisplay.classList.add('d-none');
        // Remove stop button if it exists
        const stopBtn = statusDisplay.querySelector('.stop-dry-run');
        if (stopBtn) stopBtn.remove();
        document.removeEventListener('animation-complete', onAnimationComplete);
        console.log('Dry run complete');
      };
      
      document.addEventListener('animation-complete', onAnimationComplete);
    }
    
    // Show notification
    showNotification('Dry run started - press ESC to stop', 'info');
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
      let escIndicator = document.getElementById('esc-key-indicator');
      if (!escIndicator) {
        escIndicator = document.createElement('div');
        escIndicator.id = 'esc-key-indicator';
        escIndicator.className = 'badge bg-dark position-absolute bottom-0 start-0 m-3 p-2';
        escIndicator.innerHTML = 'Press <kbd>ESC</kbd> to restore UI';
        document.body.appendChild(escIndicator);
      } else {
        escIndicator.style.display = 'block';
      }
      
      // Show a notification
      showNotification('UI hidden - press ESC to restore', 'info');
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
    tourInfo.innerHTML = '<p class="text-muted">No tour loaded.</p>';
    return;
  }
  
  let thumbnailHTML = '';
  if (tour.thumbnail) {
    thumbnailHTML = `<img src="${tour.thumbnail}" alt="${tour.title}" class="img-fluid rounded mb-3">`;
  }
  
  let infoHTML = `
    <div class="text-center mb-3">
      ${thumbnailHTML}
    </div>
    <h5 class="mb-2">${tour.title}</h5>
    <p class="mb-3">${tour.description}</p>
    <div class="list-group list-group-flush bg-transparent">
      <div class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
        <span class="fw-bold">ID:</span>
        <span>${tour.id}</span>
      </div>
      <div class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
        <span class="fw-bold">Points of interest:</span>
        <span class="badge bg-primary rounded-pill">${tour.pointsOfInterest.length}</span>
      </div>
      <div class="list-group-item bg-dark text-light">
        <span class="fw-bold">Image URL:</span>
        <div class="text-break mt-1 small">${tour.tiles}</div>
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
    statusDisplay.classList.add('d-none');
  }
  
  // Reset visualization
  window.KenBurns.visualization.setCurrentPoint(-1);
  window.KenBurns.visualization.updateVisualizations(viewer);
  
  // Show notification that dry run was stopped
  showNotification('Dry run stopped', 'info');
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
    escIndicator.style.display = 'none';
  }
  
  showNotification('UI restored', 'info');
}

// Show a notification message using Bootstrap toast
function showNotification(message, type = 'info', duration = 3000) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create new toast
  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header bg-${type} text-white">
        <strong class="me-auto">IIIF Tour Recorder</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body bg-dark text-light">
        ${message}
      </div>
    </div>
  `;
  
  // Add toast to container
  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  
  // Initialize and show the toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    delay: duration
  });
  toast.show();
  
  // Remove toast from DOM after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.ui = {
  setupEventListeners,
  updateTourInfo,
  // Import and expose the modal functions
  modal: {
    showModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      
      // Bootstrap 5 modal implementation
      try {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
      } catch (e) {
        console.warn('Failed to initialize Bootstrap modal:', e);
        // Fallback to direct DOM manipulation
        modal.style.display = 'flex';
        modal.classList.add('active');
      }
      
      // Fix accessibility issue by updating aria attributes
      modal.setAttribute('aria-hidden', 'false');
      
      // Set focus on the first input element
      setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea, select, button');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    },
    hideModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      
      // Bootstrap 5 modal implementation
      try {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }
      } catch (e) {
        console.warn('Failed to hide Bootstrap modal:', e);
        // Fallback to direct DOM manipulation
        modal.classList.remove('active');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }
      
      // Restore aria-hidden when closing
      modal.setAttribute('aria-hidden', 'true');
    }
  }
};