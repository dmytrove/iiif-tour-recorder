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

  setupRecordingControls(viewer);
  setupQualityControls(viewer);
  setupAnimationControls();

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

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.ui = {
  setupEventListeners,
  updateTourInfo
};