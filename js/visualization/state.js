// Visualization state management

// Interaction state variables
let isDragging = false;
let dragPointIndex = -1;
let zoomingPoint = false;
let zoomPointIndex = -1;
let currentPointIndex = -1;
let currentAspectRatio = '0';

/**
 * Check if a point is being dragged
 */
export function isDraggingPoint() {
  return isDragging;
}

/**
 * Set dragging state
 */
export function setDragging(state, index) {
  isDragging = state;
  dragPointIndex = index;
}

/**
 * Get index of point being dragged
 */
export function getDragPointIndex() {
  return dragPointIndex;
}

/**
 * Check if point is being zoomed
 */
export function isZoomingPoint() {
  return zoomingPoint;
}

/**
 * Set zooming state
 */
export function setZoomingPoint(state, index) {
  zoomingPoint = state;
  zoomPointIndex = index;
}

/**
 * Get index of point being zoomed
 */
export function getZoomPointIndex() {
  return zoomPointIndex;
}

/**
 * Set current point index
 */
export function setCurrentPoint(index) {
  currentPointIndex = index;
  return currentPointIndex;
}

/**
 * Get current point index
 */
export function getCurrentPoint() {
  return currentPointIndex;
}

/**
 * Set current aspect ratio
 */
export function setCurrentAspectRatio(ratio) {
  currentAspectRatio = ratio;
}

/**
 * Get current aspect ratio
 */
export function getCurrentAspectRatio() {
  return currentAspectRatio;
}
