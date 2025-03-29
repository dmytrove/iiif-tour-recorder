// Modal dialog functionality

/**
 * Show a modal dialog
 */
export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Bootstrap 5 modal implementation
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
  
  // Fix accessibility issue by updating aria attributes
  modal.setAttribute('aria-hidden', 'false');
  
  // Additional class for our own styling/tracking
  modal.classList.add('active');
  
  // Set focus on the first input element
  setTimeout(() => {
    const firstInput = modal.querySelector('input, textarea, select, button');
    if (firstInput) {
      firstInput.focus();
    }
  }, 100);
}

/**
 * Hide a modal dialog
 */
export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  // Bootstrap 5 modal implementation
  const bsModal = bootstrap.Modal.getInstance(modal);
  if (bsModal) {
    bsModal.hide();
  }
  
  // Remove our active class
  modal.classList.remove('active');
  
  // Restore aria-hidden when closing
  modal.setAttribute('aria-hidden', 'true');
}

/**
 * Setup point edit modal
 */
export function setupPointEditModal(viewer) {
  const modalElement = document.getElementById('point-edit-modal');
  
  if (!modalElement) {
    console.error('Modal element not found! Check if point-edit-modal exists in the HTML.');
    return;
  }
  
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
    hideModal('point-edit-modal');
  });
  
  // Cancel button handler
  cancelButton.addEventListener('click', () => {
    hideModal('point-edit-modal');
  });
  
  // Close modal if clicking outside the content
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      hideModal('point-edit-modal');
    }
  });
  
  // Add keyboard handlers for the modal
  document.addEventListener('keydown', (e) => {
    if (!modalElement.classList.contains('active')) return;
    
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
 * Show point edit modal with point data
 */
export function showPointEditModal(pointIndex) {
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
  
  // Populate the form with point data
  titleInput.value = point.title || '';
  descriptionInput.value = point.description || '';
  zoomInput.value = point.zoom;
  zoomValue.textContent = point.zoom.toFixed(1);
  document.getElementById('point-duration-transition').value = point.duration?.transition || 1500;
  document.getElementById('point-duration-still').value = point.duration?.still || 1500;
  pointIndexInput.value = pointIndex;
  
  // Show the modal
  showModal('point-edit-modal');
}
