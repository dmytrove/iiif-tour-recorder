// Table event handlers

/**
 * Setup table event handlers
 */
export function setupEventHandlers() {
  // Handle edit button clicks
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-action')) {
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(e.target.dataset.index);
      console.log('Edit button clicked for index:', index);
      
      if (window.KenBurns.interactions.showPointEditModal) {
        window.KenBurns.interactions.showPointEditModal(index);
      }
    }
  });
  
  // Handle delete button clicks
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-action')) {
      const index = parseInt(e.target.dataset.index);
      if (confirm('Are you sure you want to delete this point?')) {
        window.KenBurns.sequence.deletePoint(index);
        window.KenBurns.table.updateTable();
        window.KenBurns.table.updateJsonFromSequence();
        
        const viewer = window.KenBurns.viewer.getViewer();
        window.KenBurns.visualization.updateVisualizations(viewer);
      }
    }
  });
}

/**
 * Function to update sequence from input changes
 */
export function updateSequenceFromInput(e) {
  const index = parseInt(e.target.dataset.index);
  const property = e.target.dataset.property;
  let value = e.target.value;
  
  if (property === 'zoom' || property === 'centerX' || property === 'centerY' || property === 'duration') {
    value = parseFloat(value);
  }
  
  window.KenBurns.sequence.updatePoint(index, property, value);
  updateJsonFromSequence();
  
  const viewer = window.KenBurns.viewer.getViewer();
  window.KenBurns.visualization.updateVisualizations(viewer);
}
