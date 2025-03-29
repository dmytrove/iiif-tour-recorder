// filepath: c:\tools\KB\ken-burns-effect\js\interactions.js
// Handling viewer interactions with points (mouse/keyboard events)

// Track point interaction state
let pointDragging = false;
let editingPointIndex = -1;

// Setup viewer interactions
function setupViewerInteractions(viewer) {
  const viewerElement = document.getElementById('viewer');
  
  // Add ctrl+click to add points
  viewerElement.addEventListener('click', (e) => {
    if (e.ctrlKey) {
      const rect = viewerElement.getBoundingClientRect();
      const viewerPoint = new OpenSeadragon.Point(e.clientX - rect.left, e.clientY - rect.top);
      const viewportPoint = viewer.viewport.viewerElementToViewportCoordinates(viewerPoint);
      
      window.KenBurns.sequence.addPoint(
        viewer.viewport.getZoom(), 
        { x: viewportPoint.x, y: viewportPoint.y }
      );
      
      window.KenBurns.table.updateTable();
      window.KenBurns.table.updateJsonFromSequence();
      window.KenBurns.visualization.updateVisualizations(viewer);
    }
  });
  
  // Mouse down handler for points
  document.addEventListener('mousedown', (e) => {
    // Shift + click on point marker for editing properties
    if (e.target.classList.contains('point-marker') && e.shiftKey) {
      e.preventDefault();
      const pointIndex = parseInt(e.target.dataset.index);
      
      // Open edit modal
      console.log('Shift+click detected on point:', pointIndex);
      showPointEditModal(viewer, pointIndex);
      return;
    }
    
    // Regular click on point marker for dragging
    if (e.target.classList.contains('point-marker')) {
      e.preventDefault();
      const pointIndex = parseInt(e.target.dataset.index);
      
      // Initial drag setup
      pointDragging = false;
      window.KenBurns.visualization.setDragging(true, pointIndex);
    }
  });
  
  // Mouse up handler to end point interactions
  document.addEventListener('mouseup', () => {
    if (window.KenBurns.visualization.isDragging()) {
      window.KenBurns.visualization.setDragging(false, -1);
      
      // Update table and JSON after drag ends
      if (pointDragging) {
        window.KenBurns.table.updateTable();
        window.KenBurns.table.updateJsonFromSequence();
        window.KenBurns.visualization.updateVisualizations(viewer);
      }
    }
  });
  
  // Mouse move handler for dragging points
  document.addEventListener('mousemove', (e) => {
    if (window.KenBurns.visualization.isDragging()) {
      e.preventDefault();
      
      // Mark as dragging
      pointDragging = true;
      
      const dragPointIndex = window.KenBurns.visualization.getDragPointIndex();
      
      if (dragPointIndex < 0) return;
      
      const rect = viewerElement.getBoundingClientRect();
      const viewerPoint = new OpenSeadragon.Point(e.clientX - rect.left, e.clientY - rect.top);
      const viewportPoint = viewer.viewport.viewerElementToViewportCoordinates(viewerPoint);
      
      const sequence = window.KenBurns.sequence.getSequence();
      
      // Store the original zoom before updating position
      const originalZoom = sequence[dragPointIndex].zoom;
      
      // Update the point's position
      window.KenBurns.sequence.updatePoint(dragPointIndex, 'centerX', viewportPoint.x);
      window.KenBurns.sequence.updatePoint(dragPointIndex, 'centerY', viewportPoint.y);
      
      // Update visualization for drag operation
      window.KenBurns.visualization.updateVisualizationsForCurrentView(viewer);
    }
  });
  
  // Set up the point edit modal handlers
  setupPointEditModal(viewer);
}

// Function to show the point edit modal
function showPointEditModal(viewerOrIndex, pointIndexMaybe) {
  // Handle different parameter patterns flexibly
  let viewer, pointIndex;
  
  // Case 1: First argument is a number (index), second might be undefined
  if (typeof viewerOrIndex === 'number') {
    console.log('First arg is a number, using as pointIndex');
    pointIndex = viewerOrIndex;
    viewer = window.KenBurns.viewer.getViewer();
  } 
  // Case 2: First argument is the viewer, second is the index
  else if (typeof viewerOrIndex === 'object' && typeof pointIndexMaybe === 'number') {
    console.log('Regular pattern: viewer and pointIndex');
    viewer = viewerOrIndex;
    pointIndex = pointIndexMaybe;
  }
  // Case 3: Something else is wrong
  else {
    console.error('Invalid arguments to showPointEditModal');
    return;
  }
  
  console.log('Using pointIndex:', pointIndex, 'viewer exists:', !!viewer);
  
  if (pointIndex === undefined || pointIndex === null) {
    console.error('Point index is undefined or null');
    return;
  }
  
  const modal = document.getElementById('point-edit-modal');
  const titleInput = document.getElementById('point-title');
  const descriptionInput = document.getElementById('point-description');
  const zoomInput = document.getElementById('point-zoom');
  const zoomValue = document.getElementById('zoom-value');
  const pointIndexInput = document.getElementById('point-index');
  
  // Get the sequence data
  const sequence = window.KenBurns.sequence.getSequence();
  const point = sequence[pointIndex];
  
  if (!point) {
    console.error('Point not found:', pointIndex);
    return;
  }
  
  console.log('Point data:', point);
  
  // Populate the form with point data
  titleInput.value = point.title || '';
  descriptionInput.value = point.description || '';
  zoomInput.value = point.zoom;
  zoomValue.textContent = point.zoom.toFixed(1);
  document.getElementById('point-duration-transition').value = point.duration?.transition || 1500;
  document.getElementById('point-duration-still').value = point.duration?.still || 1500;
  pointIndexInput.value = pointIndex;
  
  // Store the current editing point index
  editingPointIndex = pointIndex;
  
  // Check if we can use the UI modal module, otherwise fallback to direct DOM manipulation
  console.log('Activating modal');
  if (window.KenBurns.ui && window.KenBurns.ui.modal && typeof window.KenBurns.ui.modal.showModal === 'function') {
    window.KenBurns.ui.modal.showModal('point-edit-modal');
  } else {
    // Fallback to direct DOM manipulation
    console.log('Falling back to direct DOM manipulation for modal');
    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // Initialize Bootstrap modal if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      try {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
      } catch (e) {
        console.warn('Failed to initialize Bootstrap modal:', e);
      }
    }
  }
  
  // Set focus on the title input
  setTimeout(() => {
    titleInput.focus();
    console.log('Modal display:', window.getComputedStyle(modal).display);
  }, 100);
}

// Function to hide the point edit modal
function hidePointEditModal() {
  // Check if we can use the UI modal module, otherwise fallback to direct DOM manipulation
  if (window.KenBurns.ui && window.KenBurns.ui.modal && typeof window.KenBurns.ui.modal.hideModal === 'function') {
    window.KenBurns.ui.modal.hideModal('point-edit-modal');
  } else {
    // Fallback to direct DOM manipulation
    console.log('Falling back to direct DOM manipulation for hiding modal');
    const modal = document.getElementById('point-edit-modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    
    // Use Bootstrap to hide modal if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      try {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }
      } catch (e) {
        console.warn('Failed to hide Bootstrap modal:', e);
      }
    }
    
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
  
  editingPointIndex = -1;
}

// Function to set up the point edit modal handlers
function setupPointEditModal(viewer) {
  const modalElement = document.getElementById('point-edit-modal');
  
  if (!modalElement) {
    console.error('Modal element not found! Check if point-edit-modal exists in the HTML.');
    return;
  }
  
  console.log('Initial modal display style:', window.getComputedStyle(modalElement).display);
  
  const saveButton = document.getElementById('save-point');
  const cancelButton = document.getElementById('cancel-edit');
  const zoomInput = document.getElementById('point-zoom');
  const zoomValue = document.getElementById('zoom-value');
  
  // Update zoom value display when slider changes
  zoomInput.addEventListener('input', () => {
    zoomValue.textContent = parseFloat(zoomInput.value).toFixed(1);
  });
  
  // Save button handler
  saveButton.addEventListener('click', () => {
    const titleInput = document.getElementById('point-title');
    const descriptionInput = document.getElementById('point-description');
    const zoomInput = document.getElementById('point-zoom');
    const pointIndexInput = document.getElementById('point-index');
    
    const pointIndex = parseInt(pointIndexInput.value);
    if (pointIndex < 0) return;
    
    // Update point properties
    window.KenBurns.sequence.updatePoint(pointIndex, 'title', titleInput.value.trim());
    window.KenBurns.sequence.updatePoint(pointIndex, 'description', descriptionInput.value.trim());
    window.KenBurns.sequence.updatePoint(pointIndex, 'zoom', parseFloat(zoomInput.value));
    window.KenBurns.sequence.updatePoint(pointIndex, 'durationTransition', parseInt(document.getElementById('point-duration-transition').value));
    window.KenBurns.sequence.updatePoint(pointIndex, 'durationStill', parseInt(document.getElementById('point-duration-still').value));
    
    // Update app state
    window.KenBurns.table.updateTable();
    window.KenBurns.table.updateJsonFromSequence();
    window.KenBurns.visualization.updateVisualizations(viewer);
    
    // Hide the modal
    hidePointEditModal();
  });
  
  // Cancel button handler
  cancelButton.addEventListener('click', () => {
    hidePointEditModal();
  });
  
  // Close modal if clicking outside the content
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      hidePointEditModal();
    }
  });
  
  // Add keyboard handlers for the modal
  document.addEventListener('keydown', (e) => {
    if (!modalElement.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      // Close on Escape key
      hidePointEditModal();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      // Save on Ctrl+Enter
      saveButton.click();
    }
  });
}

// Setup aspect ratio handling
function setupAspectRatioHandling(viewer) {
  const aspectRatio = document.getElementById('aspect-ratio');
  const customAspectRatio = document.getElementById('custom-aspect-ratio');
  const showCaptureFrame = document.getElementById('show-capture-frame');
  
  // Handle aspect ratio selection change
  aspectRatio.addEventListener('change', () => {
    if (aspectRatio.value === 'custom') {
      customAspectRatio.style.display = 'block';
    } else {
      customAspectRatio.style.display = 'none';
    }
    
    // Update capture frame
    window.KenBurns.visualization.updateCaptureFrame(viewer, aspectRatio.value);
  });
  
  // Show/hide capture frame
  showCaptureFrame.addEventListener('change', () => {
    window.KenBurns.visualization.updateCaptureFrame(viewer, aspectRatio.value);
  });
  
  // Custom aspect ratio inputs
  document.getElementById('custom-width').addEventListener('change', () => {
    window.KenBurns.visualization.updateCaptureFrame(viewer, 'custom');
  });
  
  document.getElementById('custom-height').addEventListener('change', () => {
    window.KenBurns.visualization.updateCaptureFrame(viewer, 'custom');
  });
  
  // Initialize capture frame
  window.KenBurns.visualization.updateCaptureFrame(viewer, aspectRatio.value);
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.interactions = {
  setupViewerInteractions,
  setupAspectRatioHandling,
  showPointEditModal,
  hidePointEditModal
};