// Visualization module - main entry point
import * as markers from './markers.js';
import * as frames from './frames.js';
import * as connections from './connections.js';
import * as captions from './captions.js';
import * as state from './state.js';
import { getState } from '../state/app-state.js';

// Store all markers
let markersArray = [];

/**
 * Create visualizations for all points
 */
export function updateVisualizations(viewer) {
  // Remove existing markers
  markersArray = markers.clearMarkers(markersArray);
  
  // Get image aspect ratio if available
  frames.updateImageAspectRatio(viewer);
  
  const sequence = getState('sequence') || window.KenBurns.sequence.getSequence();
  
  sequence.forEach((point, index) => {
    const viewportPoint = new OpenSeadragon.Point(point.center.x, point.center.y);
    const containerPoint = viewer.viewport.viewportToViewerElementCoordinates(viewportPoint);
    
    // Create point marker
    const pointMarker = markers.createMarker(point, index, containerPoint);
    
    // Add sequential number and title
    const pointLabel = markers.createPointLabel(point, index, containerPoint);
    
    // Create rectangle based on actual image dimensions and aspect ratio
    const rect = frames.createRectangleWithConsistentSize(viewer, point, containerPoint);
    
    // Create connecting line to next point (if not last point)
    let line = null;
    if (index < sequence.length - 1) {
      line = connections.createConnectionLine(point, sequence[index + 1], viewer);
    }
    
    markersArray.push({ 
      point: pointMarker, 
      rect: rect, 
      number: pointLabel,
      line: line
    });
  });
  
  updateHighlightForCurrentPoint();
}

/**
 * Update visualizations for current view (during animation)
 */
export function updateVisualizationsForCurrentView(viewer) {
  const viewport = viewer.viewport;
  const sequence = getState('sequence') || window.KenBurns.sequence.getSequence();
  
  // Update each marker to show its current position
  markersArray.forEach((marker, index) => {
    if (index >= sequence.length) return; // Skip if out of bounds
    
    const viewportPoint = new OpenSeadragon.Point(sequence[index].center.x, sequence[index].center.y);
    const currentContainerPoint = viewport.viewportToViewerElementCoordinates(viewportPoint);
    
    // Update marker position
    markers.updateMarkerPosition({
      point: marker.point,
      number: marker.number
    }, sequence[index], currentContainerPoint);
    
    // Update rectangle based on aspect ratio
    if (marker.rect) {
      // Remove existing rectangle
      marker.rect.remove();
      
      // Create new rectangle with consistent size
      const newRect = frames.createRectangleWithConsistentSize(viewer, sequence[index], currentContainerPoint);
      document.body.appendChild(newRect);
      
      // Replace the reference
      marker.rect = newRect;
    }
    
    // Update connecting line if it exists
    if (marker.line && index < sequence.length - 1) {
      connections.updateConnectionLine(marker.line, sequence[index], sequence[index + 1], viewer);
    }
  });
  
  updateHighlightForCurrentPoint();
}

/**
 * Update highlight for current point
 */
function updateHighlightForCurrentPoint() {
  const currentPoint = state.getCurrentPoint();
  
  markersArray.forEach((marker, index) => {
    markers.updateMarkerHighlight(marker, index, currentPoint);
  });
  
  // Update title callout and subtitle if capturing
  if (window.KenBurns.capture && (window.KenBurns.capture.isCapturing() || window.KenBurns.capture.isPreviewMode())) {
    const sequence = getState('sequence') || window.KenBurns.sequence.getSequence();
    captions.updateTitleCalloutAndSubtitle(currentPoint, sequence);
  } else {
    captions.clearTitleCalloutAndSubtitle();
  }
}

// Export functions and sub-modules
export { 
  frames,
  markers,
  connections,
  captions,
  state
};
