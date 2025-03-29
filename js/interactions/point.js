// Point manipulation interactions
import * as sequence from '../sequence/index.js';
import * as table from '../table/index.js';
import * as visualization from '../visualization/index.js';

// Track point interaction state
let pointDragging = false;
let editingPointIndex = -1;

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
      showPointEditModal(pointIndex);
      return;
    }
    
    // Regular click on point marker for dragging
    if (e.target.classList.contains('point-marker')) {
      e.preventDefault();
      const pointIndex = parseInt(e.target.dataset.index);
      
      // Initial drag setup
      visualization.state.setDragging(true, pointIndex);
    }
  });
  
  // Mouse up handler to end point interactions
  document.addEventListener('mouseup', () => {
    if (visualization.state.isDraggingPoint()) {
      visualization.state.setDragging(false, -1);
      
      // Update table and JSON after drag ends
      if (pointDragging) {
        table.updateTable();
        table.updateJsonFromSequence();
        visualization.updateVisualizations(viewer);
        
        // Reset dragging state
        pointDragging = false;
      }
    }
  });
  
  // Mouse move handler for dragging points
  document.addEventListener('mousemove', (e) => {
    if (visualization.state.isDraggingPoint()) {
      e.preventDefault();
      
      // Mark as dragging
      pointDragging = true;
      
      const dragPointIndex = visualization.state.getDragPointIndex();
      
      if (dragPointIndex < 0) return;
      
      const rect = document.getElementById('viewer').getBoundingClientRect();
      const viewerPoint = new OpenSeadragon.Point(e.clientX - rect.left, e.clientY - rect.top);
      const viewportPoint = viewer.viewport.viewerElementToViewportCoordinates(viewerPoint);
      
      const sequenceData = sequence.getSequence();
      
      // Store the original zoom before updating position
      const originalZoom = sequenceData[dragPointIndex].zoom;
      
      // Update the point's position
      sequence.updatePoint(dragPointIndex, 'centerX', viewportPoint.x);
      sequence.updatePoint(dragPointIndex, 'centerY', viewportPoint.y);
      
      // Update visualization for drag operation
      visualization.updateVisualizationsForCurrentView(viewer);
    }
  });
}

/**
 * Show the point edit modal
 */
export function showPointEditModal(pointIndex) {
  if (window.KenBurns && window.KenBurns.ui && window.KenBurns.ui.modal && 
      typeof window.KenBurns.ui.modal.showPointEditModal === 'function') {
    window.KenBurns.ui.modal.showPointEditModal(window.KenBurns.viewer, pointIndex);
    return;
  }
  
  // Direct implementation if UI modal module is not available
  const modal = document.getElementById('point-edit-modal');
  const sequenceData = sequence.getSequence();
  const point = sequenceData[pointIndex];
  
  if (!point) {
    console.error('Point not found:', pointIndex);
    return;
  }
  
  // Populate the form with point data
  document.getElementById('point-title').value = point.title || '';
  document.getElementById('point-description').value = point.description || '';
  document.getElementById('point-zoom').value = point.zoom || 1.0;
  document.getElementById('point-duration-transition').value = point.duration?.transition || 1500;
  document.getElementById('point-duration-still').value = point.duration?.still || 1500;
  document.getElementById('point-index').value = pointIndex;
  document.getElementById('zoom-value').textContent = Number.isInteger(point.zoom) ?
    point.zoom.toString() : point.zoom.toFixed(1);
  
  // Store the current editing point index
  editingPointIndex = pointIndex;
  
  // Show modal using Bootstrap if available
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    try {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    } catch (e) {
      console.warn('Failed to initialize Bootstrap modal:', e);
      modal.style.display = 'flex';
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  } else {
    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Hide the point edit modal
 */
export function hidePointEditModal() {
  if (window.KenBurns && window.KenBurns.ui && window.KenBurns.ui.modal && 
      typeof window.KenBurns.ui.modal.hideModal === 'function') {
    window.KenBurns.ui.modal.hideModal('point-edit-modal');
    return;
  }
  
  // Direct implementation if UI modal module is not available
  const modal = document.getElementById('point-edit-modal');
  
  // Use Bootstrap to hide modal if available
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    try {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      } else {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }
    } catch (e) {
      console.warn('Failed to hide Bootstrap modal:', e);
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  } else {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
  
  // Reset editing point index
  editingPointIndex = -1;
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
