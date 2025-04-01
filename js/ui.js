// filepath: c:\tools\KB\ken-burns-effect\js\ui.js
// UI controls and event handlers

// Setup event listeners for the UI controls
function setupEventListeners(viewer) {
  // Setup collapse button (Removed - Now using Bootstrap Offcanvas)
  /* document.getElementById('collapse-controls').addEventListener('click', function() {
    document.getElementById('controls').classList.toggle('collapsed');

    // Update the button text/icon based on state
    if (document.getElementById('controls').classList.contains('collapsed')) {
      this.innerHTML = '&#9654;'; // Right arrow
      this.title = 'Expand panel';
    } else {
      this.innerHTML = '&#9664;'; // Left arrow
      this.title = 'Collapse panel';
    }
  }); */

  // Tab navigation (Handled by Bootstrap via data-bs-* attributes)
  /*  document.querySelectorAll('.tab-button').forEach(button => {
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
  }); */

  // "Add Point" button
  document.getElementById('add-point').addEventListener('click', () => {
    const viewport = viewer.viewport;
    const center = viewport.getCenter();
    const zoom = viewport.getZoom();

    window.KenBurns.sequence.addPoint(zoom, { x: center.x, y: center.y });
    window.KenBurns.table.updateTable();
    window.KenBurns.table.updateJsonFromSequence();
    window.KenBurns.visualization.updateVisualizations(viewer);
    window.KenBurns.ui.showToast('Point added at current view.', 'success');
  });

  // "Apply JSON" button
  document.getElementById('apply-json').addEventListener('click', () => {
    const jsonText = document.getElementById('sequence-json').value;
    if (window.KenBurns.sequence.updateSequenceFromJson(jsonText)) {
      window.KenBurns.table.updateTable();
      window.KenBurns.visualization.updateVisualizations(viewer);
      window.KenBurns.ui.showToast('JSON sequence applied successfully.', 'success');
    } else {
      window.KenBurns.ui.showToast('Failed to apply JSON. Check format.', 'error');
    }
  });

  // "Update from Table" button
  document.getElementById('update-json').addEventListener('click', () => {
    window.KenBurns.table.updateJsonFromSequence();
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

  setupRecordingControls(viewer);
  setupQualityControls(viewer);
  setupAnimationControls();

  // Update tour info when the tours tab is shown
  const toursTab = document.getElementById('tours-tab-btn');
  if (toursTab) { // Check if the element exists
    toursTab.addEventListener('shown.bs.tab', updateTourInfo);
  }
  // document.querySelector('.tab-button[data-tab="tours"]').addEventListener('click', updateTourInfo); // Old listener removed

  // Setup Tour Info Editing
  setupTourInfoEditing();
  
  // Setup SRT Button Listeners (Added call)
  if (window.KenBurns.tours && window.KenBurns.tours.setupSrtButtonListeners) {
    window.KenBurns.tours.setupSrtButtonListeners();
  } else {
    console.error("setupSrtButtonListeners function not found in tours module.");
  }
}

// Setup recording controls
function setupRecordingControls(viewer) {
  const startBtn = document.getElementById('start');
  const stopBtn = document.getElementById('stop');
  const previewBtn = document.getElementById('preview');
  const stopPreviewBtn = document.getElementById('stop-preview');

  // Function to set button states
  function setButtonStates(isRecording, isPreviewing) {
    startBtn.disabled = isRecording || isPreviewing;
    stopBtn.disabled = !isRecording;
    previewBtn.disabled = isRecording || isPreviewing;
    stopPreviewBtn.disabled = !isPreviewing;
  }

  // Initial state
  setButtonStates(false, false);

  // Start recording button
  startBtn.addEventListener('click', () => {
    const quality = parseInt(document.getElementById('quality').value);
    const framerate = parseInt(document.getElementById('framerate').value);
    const aspectRatio = document.getElementById('aspect-ratio').value;

    if (window.KenBurns.capture.startRecording({
      quality,
      framerate,
      aspectRatio
    })) {
      setButtonStates(true, false);
      window.KenBurns.capture.startAnimation(viewer);
    }
  });

  // Preview button
  previewBtn.addEventListener('click', () => {
    if (window.KenBurns.capture.startPreview()) {
      setButtonStates(false, true);
      window.KenBurns.capture.startAnimation(viewer);
    }
  });

  // Stop recording button
  stopBtn.addEventListener('click', () => {
    window.KenBurns.capture.stopRecording();
    setButtonStates(false, false);
    window.KenBurns.visualization.setCurrentPoint(-1);
    window.KenBurns.visualization.updateVisualizations(viewer);
  });

  // Stop preview button
  stopPreviewBtn.addEventListener('click', () => {
    // We need a function in capture.js to handle only stopping the preview
    if (window.KenBurns.capture.stopPreview) {
        window.KenBurns.capture.stopPreview();
        setButtonStates(false, false);
        window.KenBurns.visualization.setCurrentPoint(-1);
        window.KenBurns.visualization.updateVisualizations(viewer);
    } else {
        console.error("stopPreview function not found in capture module.");
        // Fallback to stopRecording if stopPreview doesn't exist yet
        stopBtn.click(); 
    }
  });
}

// Setup animation settings controls
function setupAnimationControls() {
  // Default duration settings
  document.getElementById('default-transition-duration').addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 100) {
      e.target.value = 100;
    }
  });

  document.getElementById('default-still-duration').addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 100) {
      e.target.value = 100;
    }
  });

  document.getElementById('frame-delay').addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) {
      e.target.value = 0;
    }
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

// Function to toggle editing state for tour info
function setTourInfoEditingState(isEditing) {
    const tourInfoDiv = document.getElementById('tour-info');
    const editables = tourInfoDiv.querySelectorAll('[data-editable-field]');
    const editBtn = document.getElementById('edit-tour-info');
    const saveBtn = document.getElementById('save-tour-info');
    const cancelBtn = document.getElementById('cancel-tour-info');

    editables.forEach(el => {
        el.contentEditable = isEditing;
        el.style.outline = isEditing ? '1px dashed #ccc' : 'none';
        el.style.cursor = isEditing ? 'text' : 'default';
    });

    editBtn.classList.toggle('d-none', isEditing);
    saveBtn.classList.toggle('d-none', !isEditing);
    cancelBtn.classList.toggle('d-none', !isEditing);

    // Focus the title field when editing starts
    if (isEditing) {
        const titleEl = tourInfoDiv.querySelector('[data-editable-field="title"]');
        if(titleEl) titleEl.focus();
    }
}

// Setup listeners for tour info editing buttons
let originalTourInfo = { title: '', description: '' };
function setupTourInfoEditing() {
    const tourInfoDiv = document.getElementById('tour-info');

    document.getElementById('edit-tour-info')?.addEventListener('click', () => {
        const titleEl = tourInfoDiv.querySelector('[data-editable-field="title"]');
        const descEl = tourInfoDiv.querySelector('[data-editable-field="description"]');
        originalTourInfo.title = titleEl ? titleEl.textContent : '';
        originalTourInfo.description = descEl ? descEl.textContent : '';
        setTourInfoEditingState(true);
    });

    document.getElementById('cancel-tour-info')?.addEventListener('click', () => {
        const titleEl = tourInfoDiv.querySelector('[data-editable-field="title"]');
        const descEl = tourInfoDiv.querySelector('[data-editable-field="description"]');
        if(titleEl) titleEl.textContent = originalTourInfo.title;
        if(descEl) descEl.textContent = originalTourInfo.description;
        setTourInfoEditingState(false);
    });

    document.getElementById('save-tour-info')?.addEventListener('click', () => {
        const titleEl = tourInfoDiv.querySelector('[data-editable-field="title"]');
        const descEl = tourInfoDiv.querySelector('[data-editable-field="description"]');
        const newTitle = titleEl ? titleEl.textContent.trim() : '';
        const newDescription = descEl ? descEl.textContent.trim() : '';

        // Call function to update data (needs to be created in tours.js/sequence.js)
        if (window.KenBurns.tours && window.KenBurns.tours.updateTourMetadata) {
             if (window.KenBurns.tours.updateTourMetadata(newTitle, newDescription)) {
                 setTourInfoEditingState(false);
                 // Update JSON view
                 if (window.KenBurns.table && window.KenBurns.table.updateJsonFromSequence) {
                    window.KenBurns.table.updateJsonFromSequence();
                 }
                 window.KenBurns.ui.showToast("Tour info updated.", "success");
             } else {
                 window.KenBurns.ui.showToast("Failed to update tour info.", "error");
                 // Optionally revert changes or keep editing enabled
             }
        } else {
            console.error("updateTourMetadata function not found.");
            window.KenBurns.ui.showToast("Error: Cannot save tour info.", "error");
            setTourInfoEditingState(false); // Disable editing on error
        }
    });
}

// Update tour information in the tour tab
function updateTourInfo() {
  const tourInfoDiv = document.getElementById('tour-info');
  const tour = window.KenBurns.tours.getCurrentTour();
  const editBtn = document.getElementById('edit-tour-info');

  if (!tourInfoDiv) return; // Exit if element doesn't exist

  if (!tour) {
    tourInfoDiv.innerHTML = '<p class="text-muted">No tour loaded.</p>';
    if (editBtn) editBtn.disabled = true; // Disable edit if no tour
    return;
  }

  if (editBtn) editBtn.disabled = false; // Enable edit if tour loaded

  let thumbnailHTML = '';
  if (tour.thumbnail) {
    thumbnailHTML = `<img src="${tour.thumbnail}" alt="${tour.title}" class="tour-preview img-fluid rounded mb-2">`; // Added BS classes
  }

  // Use data attributes for editable fields
  let infoHTML = `
    <div class="tour-preview-container">
      ${thumbnailHTML}
    </div>
    <h4 data-editable-field="title" style="min-height: 1.5em;">${tour.title || 'Untitled Tour'}</h4> 
    <p data-editable-field="description" class="small" style="min-height: 3em;">${tour.description || 'No description provided.'}</p>
    <div class="tour-details mt-3 pt-2 border-top border-secondary"> <!-- Added BS classes -->
      <div class="detail-item">
        <strong class="detail-label me-2">ID:</strong>
        <span class="detail-value text-break">${tour.id}</span>
      </div>
      <div class="detail-item">
        <strong class="detail-label me-2">Points:</strong>
        <span class="detail-value">${tour.pointsOfInterest?.length || 0}</span>
      </div>
      <div class="detail-item">
        <strong class="detail-label me-2">Image:</strong>
        <span class="detail-value text-break">${tour.tiles}</span>
      </div>
    </div>
  `;

  tourInfoDiv.innerHTML = infoHTML;
  setTourInfoEditingState(false); // Ensure editing is off when info updates
}

// Helper function to format time in seconds to MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');
  return `${minutes}:${paddedSeconds}`;
}

// Update the animation progress display (bar, time, frames)
function updateAnimationProgress(currentTime, totalTime, currentFrame, totalFrames, state) {
  const progressBar = document.getElementById('animation-progress-bar');
  const timeInfo = document.getElementById('progress-time-info');
  const frameInfo = document.getElementById('progress-frame-info');

  if (progressBar) {
    const percentage = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;
    const clampedPercentage = Math.min(100, Math.max(0, percentage));
    progressBar.style.width = `${clampedPercentage}%`;
    progressBar.setAttribute('aria-valuenow', clampedPercentage.toFixed(0));

    progressBar.classList.remove('bg-info', 'bg-danger', 'bg-success', 'bg-secondary'); // Clear existing states
    if (state === 'recording') {
      progressBar.classList.add('bg-danger');
    } else if (state === 'previewing') {
      progressBar.classList.add('bg-info');
    } else if (state === 'complete') {
       progressBar.classList.add('bg-success');
    } else { // Idle or stopped
       progressBar.classList.add('bg-secondary');
    }
  }

  if (timeInfo) {
    timeInfo.textContent = `Time: ${formatTime(currentTime)} / ${formatTime(totalTime)}`;
  }

  if (frameInfo) {
    // Only show frame info if totalFrames is calculated (i.e., during recording)
    if (totalFrames > 0 && state === 'recording') {
      frameInfo.textContent = `Frame: ${currentFrame} / ${totalFrames}`;
      frameInfo.style.display = ''; // Make sure it's visible
    } else {
      frameInfo.textContent = 'Frame: - / -'; // Placeholder when not recording
      // Optionally hide frame info during preview: frameInfo.style.display = 'none';
    }
  }
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.ui = {
  setupEventListeners,
  updateTourInfo,
  updateAnimationProgress
};

// Helper function to show Bootstrap Toasts
function showToast(message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) return;

  const toastId = `toast-${Date.now()}`;
  const toastBgClass = type === 'success' ? 'bg-success' : (type === 'error' ? 'bg-danger' : 'bg-primary');

  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-white ${toastBgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHTML);

  const toastElement = document.getElementById(toastId);
  const toastInstance = new bootstrap.Toast(toastElement, {
    delay: 3000 // Auto-hide after 3 seconds
  });

  toastInstance.show();

  // Remove the toast element from DOM after it's hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

// Add showToast to the KenBurns.ui namespace
window.KenBurns.ui.showToast = showToast;