// Viewer-specific interactions
import * as sequence from '../sequence/index.js';
import * as table from '../table/index.js';
import * as visualization from '../visualization/index.js';
import * as capture from '../capture/index.js';

/**
 * Setup viewer interactions
 */
export function setupViewerInteractions(viewer) {
  const viewerElement = document.getElementById('viewer');

  // Add ctrl+click to add points
  viewerElement.addEventListener('click', (e) => {
    if (e.ctrlKey) {
      const rect = viewerElement.getBoundingClientRect();
      const viewerPoint = new OpenSeadragon.Point(e.clientX - rect.left, e.clientY - rect.top);
      const viewportPoint = viewer.viewport.viewerElementToViewportCoordinates(viewerPoint);

      sequence.addPoint(
        viewer.viewport.getZoom(),
        { x: viewportPoint.x, y: viewportPoint.y }
      );

      table.updateTable();
      table.updateJsonFromSequence();
      visualization.updateVisualizations(viewer);
    }
  });

  // Setup keyboard shortcuts
  setupKeyboardShortcuts(viewer);
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts(viewer) {
  document.addEventListener('keydown', (e) => {
    // Skip if inside text input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Space bar - toggle preview
    if (e.key === ' ' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();

      if (capture.isPreviewMode()) {
        document.getElementById('stop').click();
      } else {
        document.getElementById('preview').click();
      }
    }

    // Escape - stop recording/preview
    if (e.key === 'Escape') {
      if (capture.isCapturing() || capture.isPreviewMode()) {
        document.getElementById('stop').click();
      }
    }

    // Ctrl+A - add point at current position
    if (e.key === 'a' && e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();

      document.getElementById('add-point').click();
    }
  });
}

/**
 * Get the current viewer state
 */
export function getViewerState(viewer) {
  if (!viewer || !viewer.viewport) return null;

  return {
    zoom: viewer.viewport.getZoom(),
    center: viewer.viewport.getCenter(),
    bounds: viewer.viewport.getBounds(),
    rotation: viewer.viewport.getRotation()
  };
}