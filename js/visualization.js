// Markers and visualization management
let markers = [];
let currentPointIndex = -1;
let isDragging = false;
let dragPointIndex = -1;
let zoomingPoint = false;
let zoomPointIndex = -1;
let currentAspectRatio = '0'; // Store the current aspect ratio
let imageAspectRatio = 1; // Store the actual image aspect ratio
let baseRectSize = 0.2; // Base size of rectangle in viewport coordinates (0.2 = 20% of image when zoom is 1.0)
let sequenceLines = [];
let captureRectDiv = null;
let pointOverlays = {}; // Stores { marker: {element, location}, label: {element, location} }
let currentlyDisplayedTitle = '';
let currentlyDisplayedDescription = '';
let svgOverlayElement = null; // Reference to the SVG overlay

// Function to create visualizations for all points
function updateVisualizations(viewer) {
  // Remove existing markers
  clearMarkers();
  
  // Get image aspect ratio if available
  updateImageAspectRatio(viewer);
  
  const sequence = window.KenBurns.sequence.getSequence();
  
  updatePointOverlays(viewer, sequence);
  drawSequenceLines(viewer, sequence);
}

// Update the stored image aspect ratio
function updateImageAspectRatio(viewer) {
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
}

// Create rectangle that reflects the actual frame size at each zoom level
function createRectangleWithConsistentSize(viewer, point, containerPoint) {
  // Get the current selected aspect ratio for capture frame
  const selectedAspectRatio = currentAspectRatio;
  
  // Get container information
  const container = document.getElementById('viewer');
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  
  // Get the image bounds (these stay constant regardless of zoom)
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
  // The frame size in viewport coordinates is inversely proportional to zoom level
  const viewportWidthAtZoom = 1.0 / zoomLevel; // Width at this zoom level
  const viewportHeightAtZoom = viewportWidthAtZoom / captureFrameRatio;
  
  // Convert viewport coordinates to screen pixels
  const rectWidth = viewportWidthAtZoom * scaleX;
  const rectHeight = viewportHeightAtZoom * scaleY;
  
  // Create rectangle
  const rect = document.createElement('div');
  rect.className = 'capture-rect';
  rect.style.left = `${containerPoint.x - rectWidth / 2}px`;
  rect.style.top = `${containerPoint.y - rectHeight / 2}px`;
  rect.style.width = `${rectWidth}px`;
  rect.style.height = `${rectHeight}px`;
  
  // Add zoom level indicator to the rectangle
  const zoomLabel = document.createElement('div');
  zoomLabel.className = 'zoom-indicator';
  zoomLabel.textContent = Number.isInteger(zoomLevel) ? zoomLevel.toString() : zoomLevel.toFixed(1);
  rect.appendChild(zoomLabel);
  
  return rect;
}

// Calculate the image bounds in the viewport
function calculateImageBounds(viewer) {
  if (!viewer || !viewer.world || !viewer.world.getItemCount()) {
    return {
      x: 0,
      y: 0,
      width: 1,
      height: 1
    };
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
    return {
      x: 0,
      y: 0,
      width: 1,
      height: 1
    };
  }
}

// Function to clear all markers
function clearMarkers() {
  markers.forEach(marker => {
    if (marker.point) marker.point.remove();
    if (marker.rect) marker.rect.remove();
    if (marker.number) marker.number.remove();
    if (marker.line) marker.line.remove();
  });
  markers = [];
}

// Function to update visualizations during animation
function updateVisualizationsForCurrentView(viewer) {
  const viewport = viewer.viewport;
  const sequence = window.KenBurns.sequence.getSequence();
  
  // Update each marker to show its current position in viewport
  markers.forEach((marker, index) => {
    if (index >= sequence.length) return; // Skip if index out of bounds
    
    const viewportPoint = new OpenSeadragon.Point(sequence[index].center.x, sequence[index].center.y);
    const currentContainerPoint = viewport.viewportToViewerElementCoordinates(viewportPoint);
    
    // Update marker position
    marker.point.style.left = `${currentContainerPoint.x}px`;
    marker.point.style.top = `${currentContainerPoint.y}px`;
    
    // Update number position
    marker.number.style.left = currentContainerPoint.x + 'px';
    marker.number.style.top = currentContainerPoint.y + 'px';
    
    // Update rectangle based on aspect ratio
    if (marker.rect) {
      // Remove existing rectangle
      marker.rect.remove();
      
      // Create new rectangle with consistent size
      const newRect = createRectangleWithConsistentSize(viewer, sequence[index], currentContainerPoint);
      document.body.appendChild(newRect);
      
      // Replace the reference
      marker.rect = newRect;
    }
    
    // Update connecting line if it exists
    if (marker.line && index < sequence.length - 1) {
      const nextPoint = sequence[index + 1];
      const nextViewportPoint = new OpenSeadragon.Point(nextPoint.center.x, nextPoint.center.y);
      const nextContainerPoint = viewport.viewportToViewerElementCoordinates(nextViewportPoint);
      
      // Calculate distance and angle
      const dx = nextContainerPoint.x - currentContainerPoint.x;
      const dy = nextContainerPoint.y - currentContainerPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      marker.line.style.left = currentContainerPoint.x + 'px';
      marker.line.style.top = currentContainerPoint.y + 'px';
      marker.line.style.width = length + 'px';
      marker.line.style.transform = `rotate(${angle}rad)`;
    }
  });
  
  updateHighlightForCurrentPoint();
}

// Function to highlight current point
function updateHighlightForCurrentPoint() {
  markers.forEach((marker, index) => {
    if (index === currentPointIndex) {
      marker.point.style.background = 'lime';
      marker.point.style.width = '12px';
      marker.point.style.height = '12px';
      marker.rect.style.borderColor = 'lime';
      marker.number.style.color = 'lime';
      if (marker.line) marker.line.style.background = 'rgba(0, 255, 0, 0.7)';
      
      // Update title callout and subtitle if capturing
      if (window.KenBurns.capture && (window.KenBurns.capture.isCapturing() || window.KenBurns.capture.isPreviewMode())) {
        updateTitleCalloutAndSubtitle(index);
      } else {
        clearTitleCalloutAndSubtitle();
      }
    } else {
      marker.point.style.background = 'red';
      marker.point.style.width = '8px';
      marker.point.style.height = '8px';
      marker.rect.style.borderColor = 'yellow';
      marker.number.style.color = 'white';
      if (marker.line) marker.line.style.background = 'rgba(255, 100, 100, 0.7)';
    }
  });
}

// Function to update title callout and subtitle 
function updateTitleCalloutAndSubtitle(index) {
  const sequence = window.KenBurns.sequence.getSequence();
  
  if (index < 0 || index >= sequence.length) {
    clearTitleCalloutAndSubtitle();
    return;
  }
  
  const point = sequence[index];
  const showCallouts = document.getElementById('show-callouts').checked;
  const showSubtitles = document.getElementById('show-subtitles').checked;
  
  // Update title callout if it has a title
  if (point.title && showCallouts) {
    const titleCallout = document.getElementById('title-callout');
    titleCallout.textContent = point.title;
    titleCallout.style.display = 'block';
  } else {
    document.getElementById('title-callout').style.display = 'none';
  }
  
  // Update subtitle if it has a description
  if (point.description && showSubtitles) {
    const subtitleDisplay = document.getElementById('subtitle-display');
    subtitleDisplay.textContent = point.description;
    subtitleDisplay.style.display = 'block';
  } else {
    document.getElementById('subtitle-display').style.display = 'none';
  }
}

// Clear title callout and subtitle
function clearTitleCalloutAndSubtitle() {
  document.getElementById('title-callout').style.display = 'none';
  document.getElementById('subtitle-display').style.display = 'none';
}

// Set current point index
function setCurrentPoint(index) {
  currentPointIndex = index;
  updateHighlightForCurrentPoint();
}

// Update the capture frame based on selected aspect ratio
function updateCaptureFrame(viewer, aspectRatio) {
  const container = document.getElementById('viewer');
  const captureFrame = document.getElementById('capture-frame');
  const showCaptureFrame = document.getElementById('show-capture-frame').checked;
  
  // Store the current aspect ratio for rectangle calculations
  currentAspectRatio = aspectRatio;
  
  // Update the image aspect ratio
  updateImageAspectRatio(viewer);
  
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
  
  // Update all existing visualizations to match the new aspect ratio
  if (viewer) {
    updateVisualizations(viewer);
  }
}

// Function called by updateCallout and updateSubtitleDisplay
function setCurrentText(title, description) {
    currentlyDisplayedTitle = title || '';
    currentlyDisplayedDescription = description || '';
}

// Function to show title callout
function updateCallout(title) {
    const callout = document.getElementById('title-callout');
    const showCallouts = document.getElementById('show-callouts')?.checked ?? true;
    if (callout && showCallouts) {
        callout.textContent = title || '';
        callout.style.display = title ? 'block' : 'none';
    } else if (callout) {
        callout.style.display = 'none';
    }
    setCurrentText(title, currentlyDisplayedDescription); // Update shared state
}

// Function to show description as subtitle
function updateSubtitleDisplay(description) {
    const subtitle = document.getElementById('subtitle-display');
    const showSubtitles = document.getElementById('show-subtitles')?.checked ?? true;
    if (subtitle && showSubtitles) {
        subtitle.textContent = description || '';
        subtitle.style.display = description ? 'block' : 'none';
    } else if (subtitle) {
        subtitle.style.display = 'none';
    }
    setCurrentText(currentlyDisplayedTitle, description); // Update shared state
}

// Function for capture module to get current text
function getCurrentText() {
    return {
        currentTitle: currentlyDisplayedTitle,
        currentDescription: currentlyDisplayedDescription
    };
}

// --- Initialization ---
// Initialize necessary visualization components
function initVisualizations(viewer) {
    initSvgOverlay(viewer);
    initCaptureFrame(viewer);
    // Any other init needed
}

// Create and add the SVG overlay for lines
function initSvgOverlay(viewer) {
    if (svgOverlayElement) {
        viewer.removeOverlay(svgOverlayElement);
    }
    svgOverlayElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgOverlayElement.setAttribute('class', 'osd-svg-overlay');
    viewer.addOverlay(svgOverlayElement, new OpenSeadragon.Rect(0, 0, 1, 1)); // Cover entire viewport
    console.log("SVG overlay initialized.");
}

// Find and store the capture frame element
function initCaptureFrame(viewer) {
    captureRectDiv = document.getElementById('capture-frame');
    if (!captureRectDiv) {
        console.warn("Capture frame element (#capture-frame) not found.");
    }
    // We might need viewer reference later if calculations depend on it
}

// Create/Update OpenSeadragon overlays for sequence points
function updatePointOverlays(viewer, sequence) {
    const existingOverlayIds = Object.keys(pointOverlays);
    const currentPointIds = sequence.map((_, index) => index.toString());

    // Remove overlays (marker + label) for points that no longer exist
    existingOverlayIds.forEach(id => {
        if (!currentPointIds.includes(id)) {
            const overlayGroup = pointOverlays[id];
            if (overlayGroup) {
                if (overlayGroup.marker) viewer.removeOverlay(overlayGroup.marker.element);
                if (overlayGroup.label) viewer.removeOverlay(overlayGroup.label.element);
                delete pointOverlays[id];
                console.log(`Removed overlays for point index ${id}`);
            }
        }
    });

    // Add/Update overlays for current points
    sequence.forEach((point, index) => {
        const pointId = index.toString();
        const pointLocation = new OpenSeadragon.Point(point.center.x, point.center.y);
        const overlayGroup = pointOverlays[pointId] || {}; // Get existing or create new group

        // --- Marker Overlay --- //
        if (overlayGroup.marker) {
            // Update location if needed (simple remove/re-add)
            if (!overlayGroup.marker.location.equals(pointLocation)) {
                 console.log(`Updating marker location for overlay ${pointId}`);
                 viewer.removeOverlay(overlayGroup.marker.element);
                 overlayGroup.marker = null; // Force re-creation
            }
        }
        if (!overlayGroup.marker) {
            console.log(`Creating marker overlay for point index ${pointId}`);
            const markerElement = document.createElement('div');
            markerElement.className = 'point-marker-overlay';
            markerElement.innerHTML = `<div class="point-marker-dot"></div><div class="point-marker-rotator"></div>`;
            markerElement.dataset.pointIndex = pointId;
            markerElement.addEventListener('click', () => { console.log(`Clicked point ${pointId}:`, point); });

            viewer.addOverlay({
                element: markerElement,
                location: pointLocation,
                placement: OpenSeadragon.Placement.CENTER
            });
            overlayGroup.marker = { element: markerElement, location: pointLocation };
        }

        // --- Label Overlay --- //
        const labelText = `${index + 1}. ${point.title || 'Point'}`;
        const labelLocation = pointLocation; // Anchor label to the same point

        if (overlayGroup.label) {
            // Update text and location if needed
            const currentLabel = overlayGroup.label;
            let needsUpdate = false;
            if (currentLabel.element.textContent !== labelText) {
                currentLabel.element.textContent = labelText;
                needsUpdate = true;
            }
            if (!currentLabel.location.equals(labelLocation)) {
                needsUpdate = true; // Location change requires update
            }
            if (needsUpdate) {
                 console.log(`Updating label overlay ${pointId}`);
                 // OSD provides update method for overlays
                 viewer.updateOverlay(currentLabel.element, labelLocation);
                 currentLabel.location = labelLocation; // Update stored location
            }
        }
        if (!overlayGroup.label) {
             console.log(`Creating label overlay for point index ${pointId}`);
             const labelElement = document.createElement('div');
             labelElement.className = 'point-label-overlay';
             labelElement.textContent = labelText;

             viewer.addOverlay({
                 element: labelElement,
                 location: labelLocation,
                 // Place label slightly above the marker
                 placement: OpenSeadragon.Placement.TOP_LEFT, // Experiment with placement
                 checkResize: false // Optimization if label size is fixed
             });
             overlayGroup.label = { element: labelElement, location: labelLocation };
        }

        // Store the updated group
        pointOverlays[pointId] = overlayGroup;
    });
}

// Function to clear all point overlays (marker + label)
function clearPointOverlays(viewer) {
     Object.keys(pointOverlays).forEach(id => {
         const overlayGroup = pointOverlays[id];
         if (overlayGroup) {
             if (overlayGroup.marker) viewer.removeOverlay(overlayGroup.marker.element);
             if (overlayGroup.label) viewer.removeOverlay(overlayGroup.label.element);
         }
     });
     pointOverlays = {};
     console.log("Cleared all point overlays.");
}

// Draw sequence lines between points using SVG overlay
function drawSequenceLines(viewer, sequence) {
    if (!svgOverlayElement) {
        console.warn("SVG overlay not initialized for drawing lines.");
        return;
    }
    // Clear previous lines
    while (svgOverlayElement.firstChild) {
        svgOverlayElement.removeChild(svgOverlayElement.firstChild);
    }

    if (sequence.length < 2) return; // Need at least two points for a line

    const ns = "http://www.w3.org/2000/svg";

    for (let i = 0; i < sequence.length - 1; i++) {
        const p1 = sequence[i];
        const p2 = sequence[i + 1];

        // Convert viewport coordinates to SVG coordinate system (0,0 top-left)
        // Note: OSD overlays handle coordinate mapping, but for SVG we need viewer coords
        const point1Viewer = viewer.viewport.viewportToViewerElementCoordinates(new OpenSeadragon.Point(p1.center.x, p1.center.y));
        const point2Viewer = viewer.viewport.viewportToViewerElementCoordinates(new OpenSeadragon.Point(p2.center.x, p2.center.y));

        const line = document.createElementNS(ns, "line");
        line.setAttribute('x1', point1Viewer.x);
        line.setAttribute('y1', point1Viewer.y);
        line.setAttribute('x2', point2Viewer.x);
        line.setAttribute('y2', point2Viewer.y);
        line.setAttribute('class', 'sequence-line');

        svgOverlayElement.appendChild(line);
    }
}

// Export visualization functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.visualization = {
  updateVisualizations,
  updateVisualizationsForCurrentView,
  setCurrentPoint,
  updateCaptureFrame,
  clearMarkers,
  updateTitleCalloutAndSubtitle,
  clearTitleCalloutAndSubtitle,
  isDragging: () => isDragging,
  setDragging: (state, index) => {
    isDragging = state;
    dragPointIndex = index;
  },
  getDragPointIndex: () => dragPointIndex,
  isZoomingPoint: () => zoomingPoint,
  setZoomingPoint: (state, index) => {
    zoomingPoint = state;
    zoomPointIndex = index;
  },
  getZoomPointIndex: () => zoomPointIndex,
  updateCallout,
  updateSubtitleDisplay,
  getCurrentText,
  updatePointOverlays,
  clearPointOverlays,
  drawSequenceLines,
  initVisualizations,
  initSvgOverlay
};