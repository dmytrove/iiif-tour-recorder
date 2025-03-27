// Point marker management
import { createElement } from '../utils/dom.js';
import { getState } from '../state/app-state.js';

/**
 * Create a point marker element
 */
export function createMarker(point, index, containerPoint) {
  // Create point marker
  const pointMarker = createElement('div', {
    className: 'point-marker',
    style: `left: ${containerPoint.x}px; top: ${containerPoint.y}px;`,
    title: `Point ${index + 1}: ${point.title || ''} - Zoom ${point.zoom}, Duration ${point.duration}ms`,
    'data-index': index
  });
  
  document.body.appendChild(pointMarker);
  
  return pointMarker;
}

/**
 * Create a point number/label
 */
export function createPointLabel(point, index, containerPoint) {
  const pointLabel = createElement('div', {
    className: 'point-number',
    innerHTML: `${index + 1}${point.title ? '. ' + point.title : ''}`,
    style: `left: ${containerPoint.x}px; top: ${containerPoint.y}px;`
  });
  
  document.body.appendChild(pointLabel);
  
  return pointLabel;
}

/**
 * Update marker position
 */
export function updateMarkerPosition(marker, point, containerPoint) {
  if (!marker || !marker.point) return;
  
  marker.point.style.left = `${containerPoint.x}px`;
  marker.point.style.top = `${containerPoint.y}px`;
  
  if (marker.number) {
    marker.number.style.left = `${containerPoint.x}px`;
    marker.number.style.top = `${containerPoint.y}px`;
  }
}

/**
 * Update marker highlighting based on current point
 */
export function updateMarkerHighlight(marker, index, currentPointIndex) {
  if (!marker || !marker.point) return;
  
  if (index === currentPointIndex) {
    marker.point.style.background = 'lime';
    marker.point.style.width = '12px';
    marker.point.style.height = '12px';
    if (marker.rect) marker.rect.style.borderColor = 'lime';
    if (marker.number) marker.number.style.color = 'lime';
    if (marker.line) marker.line.style.background = 'rgba(0, 255, 0, 0.7)';
  } else {
    marker.point.style.background = 'red';
    marker.point.style.width = '8px';
    marker.point.style.height = '8px';
    if (marker.rect) marker.rect.style.borderColor = 'yellow';
    if (marker.number) marker.number.style.color = 'white';
    if (marker.line) marker.line.style.background = 'rgba(255, 100, 100, 0.7)';
  }
}

/**
 * Clear all markers
 */
export function clearMarkers(markers) {
  markers.forEach(marker => {
    if (marker.point) marker.point.remove();
    if (marker.rect) marker.rect.remove();
    if (marker.number) marker.number.remove();
    if (marker.line) marker.line.remove();
  });
  
  return [];
}
