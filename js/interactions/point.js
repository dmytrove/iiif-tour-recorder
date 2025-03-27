// Point manipulation interactions

/**
 * Setup point interactions (dragging, zooming)
 */
export function setupPointInteractions(viewer) {
  // Mouse down handler for points
  document.addEventListener('mousedown', (e) => {
    // Shift + click on point marker for editing properties
    if (e.target.classList.contains('point-marker') && e.shiftKey) {
      e.preventDefault();
      const pointIndex = parseInt(e.target.dataset.index);
      
      // Open edit modal
      console.log('Shift+click detected on point:', pointIndex);
      window.KenBurns.interactions.showPointEditModal(viewer, pointIndex);
      return;
    }
    
    // Regular click on point marker for dragging
    if (e.target.classList.contains('point-marker')) {
      e.preventDefault();
      const pointIndex = parseInt(e.target.dataset.index);
      
      // Initial drag setup
      window.KenBurns.visualization.state.setDragging(true, pointIndex);
    }
  });
  
  // Mouse up handler to end point interactions
  document.addEventListener('mouseup', () => {
    if (window.KenBurns.visualization.state.isDraggingPoint()) {
      window.KenBurns.visualization.state.setDragging(false, -1);
      
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
    if (window.KenBurns.visualization.state.isDraggingPoint()) {
      e.preventDefault();
      
      // Mark as dragging
      pointDragging = true;
      
      const dragPointIndex = window.KenBurns.visualization.state.getDragPointIndex();
      
      if (dragPointIndex < 0) return;
      
      const rect = document.getElementById('viewer').getBoundingClientRect();
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
}

// Track point interaction state
let pointDragging = false;
let editingPointIndex = -1;

/**
 * Show the point edit modal
 */
export function showPointEditModal(viewer, pointIndex) {
  if (typeof window.KenBurns.ui.modal.showPointEditModal === 'function') {
    window.KenBurns.ui.modal.showPointEditModal(pointIndex);
    return;
  }
  
  // Fallback to older interactions method
  window.KenBurns.interactions.showPointEditModal(pointIndex);
}

/**
 * Hide the point edit modal
 */
export function hidePointEditModal() {
  if (typeof window.KenBurns.ui.modal.hideModal === 'function') {
    window.KenBurns.ui.modal.hideModal('point-edit-modal');
    return;
  }
  
  // Fallback to older interactions method
  window.KenBurns.interactions.hidePointEditModal();
}

/**
 * Get editing point index
 */
export function getEditingPointIndex() {
  return editingPointIndex;
}

/**
 * Set editing point index
 */
export function setEditingPointIndex(index) {
  editingPointIndex = index;
  return editingPointIndex;
}
