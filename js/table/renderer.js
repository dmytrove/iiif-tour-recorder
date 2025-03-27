// Table rendering

/**
 * Function to update the table from the sequence
 */
export function updateTable() {
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
    actionsCell.innerHTML = '<span class="edit-action" data-index="' + index + '">Edit</span><span class="delete-action" data-index="' + index + '">Delete</span>';
    
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
}

/**
 * Setup table properties toggle
 */
export function setupTablePropertiesToggle() {
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
