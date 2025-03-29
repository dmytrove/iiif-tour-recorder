// UI module - main entry point
import * as controls from './controls.js';
import * as tabs from './tabs.js';
import * as modal from './modal.js';
import * as notifications from './notifications.js';

/**
 * Setup all event listeners for UI
 */
export function setupEventListeners(viewer) {
  // Setup basic UI controls
  controls.setupCollapseButton();
  
  // Tab navigation
  tabs.setupTabs();
  
  // Set up recording controls
  controls.setupRecordingControls(viewer);
  
  // Setup quality controls
  controls.setupQualityControls(viewer);
  
  // Setup URL input
  controls.setupUrlControl(viewer);
  
  // Setup timeout controls
  controls.setupTimeoutControls();
  
  // Setup point edit modal
  modal.setupPointEditModal(viewer);
  
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
}

/**
 * Update tour information in the tour tab
 */
export function updateTourInfo() {
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

// Export modules and functions
export {
  controls,
  tabs,
  modal,
  notifications
};
