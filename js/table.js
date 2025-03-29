// filepath: c:\tools\KB\ken-burns-effect\js\table.js
// Table management for the sequence data

function showPointEditModal(index) {
  // Call the interactions module's function to show the edit modal
  const viewer = window.KenBurns.viewer.getViewer();
  
  console.log('Calling interactions.showPointEditModal with index:', index, 'Viewer object exists:', !!viewer);
  
  // Just pass the index directly - we've fixed the interactions.js function to handle this
  window.KenBurns.interactions.showPointEditModal(index);
}

// Setup table properties toggle
function setupTablePropertiesToggle() {
  const showPropertiesCheckbox = document.getElementById('show-properties');
  const sequenceTable = document.getElementById('sequence-table');
  
  showPropertiesCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      sequenceTable.classList.add('show-properties');
    } else {
      sequenceTable.classList.remove('show-properties');
    }
  });
  
  // Initialize to hidden (default state)
  sequenceTable.classList.remove('show-properties');
  showPropertiesCheckbox.checked = false;
}

// Function to update the table from the sequence
function updateTable() {
  const tbody = document.querySelector('#sequence-table tbody');
  tbody.innerHTML = '';
  
  const sequence = window.KenBurns.sequence.getSequence();
  
  sequence.forEach((point, index) => {
    const row = document.createElement('tr');
    
    // Title cell
    const titleCell = document.createElement('td');
    titleCell.className = 'readonly-cell';
    titleCell.textContent = point.title || '(No title)';
    
    // Zoom cell
    const zoomCell = document.createElement('td');
    zoomCell.className = 'readonly-cell property-column';
    zoomCell.textContent = point.zoom.toFixed(1);
    
    // Center X cell
    const centerXCell = document.createElement('td');
    centerXCell.className = 'readonly-cell property-column';
    centerXCell.textContent = point.center.x.toFixed(3);
    
    // Center Y cell
    const centerYCell = document.createElement('td');
    centerYCell.className = 'readonly-cell property-column';
    centerYCell.textContent = point.center.y.toFixed(3);
    
    // Duration Transition cell
    const durationTransitionCell = document.createElement('td');
    durationTransitionCell.className = 'readonly-cell property-column';
    durationTransitionCell.textContent = (point.duration.transition || 0) + ' ms';
    
    // Duration Still cell
    const durationStillCell = document.createElement('td');
    durationStillCell.className = 'readonly-cell property-column';
    durationStillCell.textContent = (point.duration.still || 0) + ' ms';
    
    // Description cell - removed from table display but still generated for future use if needed
    const descriptionCell = document.createElement('td');
    descriptionCell.className = 'readonly-cell description';
    descriptionCell.textContent = point.description || '(No description)';
    descriptionCell.style.display = 'none'; // Hide this cell
    
    // Actions cell
    const actionsCell = document.createElement('td');
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-primary btn-sm edit-action';
    editBtn.dataset.index = index;
    editBtn.textContent = 'Edit';
    btnGroup.appendChild(editBtn);
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm delete-action';
    deleteBtn.dataset.index = index;
    deleteBtn.textContent = 'Delete';
    btnGroup.appendChild(deleteBtn);
    actionsCell.appendChild(btnGroup);
    
    row.appendChild(titleCell);
    row.appendChild(zoomCell);
    row.appendChild(centerXCell);
    row.appendChild(centerYCell);
    row.appendChild(durationTransitionCell);
    row.appendChild(durationStillCell);
    // Removed description cell to save space
    row.appendChild(actionsCell);
    
    tbody.appendChild(row);
  });
  
  // Add event listeners for edit and delete actions
  document.querySelectorAll('.edit-action').forEach(editBtn => {
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(e.target.dataset.index);
      console.log('Edit button clicked for index:', index);
      showPointEditModal(index);
    });
  });
  
  document.querySelectorAll('.delete-action').forEach(deleteBtn => {
    deleteBtn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      if (confirm('Are you sure you want to delete this point?')) {
        window.KenBurns.sequence.deletePoint(index);
        updateTable();
        updateJsonFromSequence();
        
        const viewer = window.KenBurns.viewer.getViewer();
        window.KenBurns.visualization.updateVisualizations(viewer);
      }
    });
  });
}

// Function to update sequence from input changes
function updateSequenceFromInput(e) {
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

// Function to update JSON from sequence
function updateJsonFromSequence() {
  // Get the full tour info, with updated sequence
  const fullTourInfo = window.KenBurns.sequence.getTourInfo();
  document.getElementById('sequence-json').value = JSON.stringify(fullTourInfo, null, 2);
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.table = {
  updateTable,
  updateSequenceFromInput,
  updateJsonFromSequence,
  setupTablePropertiesToggle
};