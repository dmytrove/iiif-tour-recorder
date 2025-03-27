// Capture frame visualization
import { getState } from '../state/app-state.js';
import { createElement } from '../utils/dom.js';

// Store the image aspect ratio
let imageAspectRatio = 1;

/**
 * Create rectangle that reflects frame size at zoom level
 */
export function createRectangleWithConsistentSize(viewer, point, containerPoint) {
  // Get the current selected aspect ratio for capture frame
  const selectedAspectRatio = getState('aspectRatio') || '0';
  
  // Get container information
  const container = document.getElementById('viewer');
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  
  // Get the image bounds
  const imageBounds = calculateImageBounds(viewer);
  
  // Calculate the capture frame ratio
  let captureFrameRatio;
  if (selectedAspectRatio === '0') {
    captureFrameRatio = containerWidth / containerHeight;
  } else if (selectedAspectRatio === 'custom') {
    const customWidth = parseInt(document.getElementById('custom-width').value);
    const customHeight = parseInt(document.getElementById('custom-height').value);
    captureFrameRatio = customWidth / customHeight;
  } else {
    const [width, height] = selectedAspectRatio.split(':').map(Number);
    captureFrameRatio = width / height;
  }
  
  // Get the zoom level from the point
  const zoomLevel = point.zoom || 1.0;
  
  // Get viewport information
  const viewportBounds = viewer.viewport.getBounds();
  
  // Calculate the scale factor between image coordinates and screen pixels
  const scaleX = containerWidth / viewportBounds.width;
  const scaleY = containerHeight / viewportBounds.height;
  
  // Calculate the actual frame size at this zoom level
  const viewportWidthAtZoom = 1.0 / zoomLevel;
  const viewportHeightAtZoom = viewportWidthAtZoom / captureFrameRatio;
  
  // Convert viewport coordinates to screen pixels
  const rectWidth = viewportWidthAtZoom * scaleX;
  const rectHeight = viewportHeightAtZoom * scaleY;
  
  // Create rectangle
  const rect = createElement('div', {
    className: 'capture-rect',
    style: `left: ${containerPoint.x - rectWidth / 2}px; top: ${containerPoint.y - rectHeight / 2}px; width: ${rectWidth}px; height: ${rectHeight}px;`
  });
  
  // Add zoom level indicator to the rectangle
  const zoomLabel = createElement('div', {
    className: 'zoom-indicator',
    textContent: Number.isInteger(zoomLevel) ? zoomLevel.toString() : zoomLevel.toFixed(1)
  });
  
  rect.appendChild(zoomLabel);
  document.body.appendChild(rect);
  
  return rect;
}

/**
 * Calculate the image bounds in the viewport
 */
export function calculateImageBounds(viewer) {
  if (!viewer || !viewer.world || !viewer.world.getItemCount()) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }
  
  try {
    // Try to get the image bounds from the viewer
    const item = viewer.world.getItemAt(0);
    const bounds = item.getBounds();
    
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    };
  } catch (e) {
    console.warn("Error getting image bounds", e);
    
    // Fallback to default bounds
    return { x: 0, y: 0, width: 1, height: 1 };
  }
}

/**
 * Update the capture frame based on selected aspect ratio
 */
export function updateCaptureFrame(viewer, aspectRatio) {
  const container = document.getElementById('viewer');
  const captureFrame = document.getElementById('capture-frame');
  const showCaptureFrame = document.getElementById('show-capture-frame').checked;
  
  // Hide the capture frame if disabled
  captureFrame.style.display = showCaptureFrame ? 'block' : 'none';
  
  if (!showCaptureFrame) return;
  
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  
  let frameWidth, frameHeight;
  
  // Calculate frame dimensions based on aspect ratio
  if (aspectRatio === '0') {
    // Use full viewport
    frameWidth = containerWidth;
    frameHeight = containerHeight;
  } else if (aspectRatio === 'custom') {
    // Use custom width and height
    const customWidth = parseInt(document.getElementById('custom-width').value);
    const customHeight = parseInt(document.getElementById('custom-height').value);
    const customRatio = customWidth / customHeight;
    
    if (containerWidth / containerHeight > customRatio) {
      // Container is wider than frame
      frameHeight = containerHeight;
      frameWidth = frameHeight * customRatio;
    } else {
      // Container is taller than frame
      frameWidth = containerWidth;
      frameHeight = frameWidth / customRatio;
    }
  } else {
    // Use predefined ratio
    const [width, height] = aspectRatio.split(':').map(Number);
    const ratio = width / height;
    
    if (containerWidth / containerHeight > ratio) {
      // Container is wider than frame
      frameHeight = containerHeight;
      frameWidth = frameHeight * ratio;
    } else {
      // Container is taller than frame
      frameWidth = containerWidth;
      frameHeight = frameWidth / ratio;
    }
  }
  
  // Apply dimensions to the capture frame
  captureFrame.style.width = `${frameWidth}px`;
  captureFrame.style.height = `${frameHeight}px`;
  
  return { width: frameWidth, height: frameHeight };
}

/**
 * Update the stored image aspect ratio
 */
export function updateImageAspectRatio(viewer) {
  if (!viewer || !viewer.world || !viewer.world.getItemCount()) {
    imageAspectRatio = 1;
    return;
  }
  
  // Get the primary item (the image)
  const item = viewer.world.getItemAt(0);
  
  if (item && item.source) {
    try {
      // Try to get dimensions from the source
      const imgWidth = item.source.dimensions ? item.source.dimensions.x : (item.source.width || 1);
      const imgHeight = item.source.dimensions ? item.source.dimensions.y : (item.source.height || 1);
      imageAspectRatio = imgWidth / imgHeight;
      
      // If we couldn't get valid dimensions, check if there's IIIF info
      if (!isFinite(imageAspectRatio) || imageAspectRatio <= 0) {
        if (item.source.width && item.source.height) {
          imageAspectRatio = item.source.width / item.source.height;
        } else if (viewer.tileSources && viewer.tileSources[0]) {
          const tileSource = viewer.tileSources[0];
          if (tileSource.width && tileSource.height) {
            imageAspectRatio = tileSource.width / tileSource.height;
          }
        }
      }
    } catch(e) {
      console.warn("Error getting image aspect ratio", e);
      imageAspectRatio = 1;
    }
  }
  
  // Fallback: if we still don't have a valid aspect ratio, use the container's
  if (!isFinite(imageAspectRatio) || imageAspectRatio <= 0) {
    const containerSize = viewer.viewport.getContainerSize();
    imageAspectRatio = containerSize.x / containerSize.y;
  }
  
  return imageAspectRatio;
}

/**
 * Get current image aspect ratio
 */
export function getImageAspectRatio() {
  return imageAspectRatio;
}
