// Modal dialogs for point and tour editing
import * as sequence from '../sequence/index.js';
import * as table from '../table/index.js';
import * as visualization from '../visualization/index.js';

/**
 * Set up point edit modal handlers
 */
export function setupPointEditModal(viewer) {
  const modal = document.getElementById('point-edit-modal');
  const titleInput = document.getElementById('point-title');
  const descriptionInput = document.getElementById('point-description');
  const zoomInput = document.getElementById('point-zoom');
  const zoomValue = document.getElementById('zoom-value');
  const saveButton = document.getElementById('save-point');
  const cancelButton = document.getElementById('cancel-edit');

  // Update zoom value display when slider changes
  zoomInput.addEventListener('input', () => {
    zoomValue.textContent = Number.isInteger(parseFloat(zoomInput.value)) ?
      zoomInput.value : parseFloat(zoomInput.value).toFixed(1);
  });

  // Save point changes when save button is clicked
  saveButton.addEventListener('click', () => {
    const pointIndex = parseInt(document.getElementById('point-index').value);
    if (pointIndex < 0) return;

    // Update point properties
    sequence.updatePoint(pointIndex, 'title', titleInput.value.trim());
    sequence.updatePoint(pointIndex, 'description', descriptionInput.value.trim());
    sequence.updatePoint(pointIndex, 'zoom', parseFloat(zoomInput.value));
    sequence.updatePoint(pointIndex, 'durationTransition', parseInt(document.getElementById('point-duration-transition').value));
    sequence.updatePoint(pointIndex, 'durationStill', parseInt(document.getElementById('point-duration-still').value));

    // Update table and visualization
    table.updateTable();
    table.updateJsonFromSequence();
    visualization.updateVisualizations(viewer);

    // Hide modal
    hideModal('point-edit-modal');
  });
  
  // Cancel editing when cancel button is clicked
  cancelButton.addEventListener('click', () => {
    hideModal('point-edit-modal');
  });
  
  // Close modal when clicking outside the content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal('point-edit-modal');
    }
  });
  
  // Add keyboard handlers for the modal
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('show')) return;
    
    if (e.key === 'Escape') {
      // Close on Escape key
      hideModal('point-edit-modal');
    } else if (e.key === 'Enter' && e.ctrlKey) {
      // Save on Ctrl+Enter
      saveButton.click();
    }
  });
}

/**
 * Show the point edit modal
 */
export function showPointEditModal(viewer, pointIndex) {
  const modal = document.getElementById('point-edit-modal');
  const currentSequence = sequence.getSequence();
  const point = currentSequence[pointIndex];

  if (!point) {
    console.error('Point not found:', pointIndex);
    return;
  }

  // Set form values
  document.getElementById('point-title').value = point.title || '';
  document.getElementById('point-description').value = point.description || '';
  document.getElementById('point-zoom').value = point.zoom || 1.0;
  document.getElementById('point-duration-transition').value = point.duration?.transition || 1500;
  document.getElementById('point-duration-still').value = point.duration?.still || 1500;
  document.getElementById('point-index').value = pointIndex;
  document.getElementById('zoom-value').textContent = Number.isInteger(point.zoom) ?
    point.zoom.toString() : point.zoom.toFixed(1);

  // Show modal using Bootstrap
  try {
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  } catch (e) {
    console.warn('Failed to show Bootstrap modal:', e);
    showModalFallback(modal);
  }
}

/**
 * Hide a modal by its ID
 */
export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  try {
    const bsModal = bootstrap.Modal.getInstance(modal);
    if (bsModal) {
      bsModal.hide();
    } else {
      hideModalFallback(modal);
    }
  } catch (e) {
    console.warn('Failed to hide Bootstrap modal:', e);
    hideModalFallback(modal);
  }
}

/**
 * Fallback function to show a modal without Bootstrap
 */
function showModalFallback(modal) {
  modal.style.display = 'block';
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  document.body.appendChild(backdrop);
}

/**
 * Fallback function to hide a modal without Bootstrap
 */
function hideModalFallback(modal) {
  modal.style.display = 'none';
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  
  // Remove backdrop
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
}