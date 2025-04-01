// filepath: c:\tools\KB\ken-burns-effect\js\table.js
// Table management for the sequence data using DataTables.js

let sequenceDataTable = null;
const tableElementId = '#sequence-table';

function initializeDataTable() {
  // Define columns for DataTables
  const columns = [
    { data: 'title', title: 'Title', defaultContent: '(No title)', className: 'text-nowrap' },
    { data: 'zoom', title: 'Zoom', render: data => data ? data.toFixed(1) : '', className: 'text-end property-column' },
    { data: 'center.x', title: 'Center X', render: data => data ? data.toFixed(3) : '', className: 'text-end property-column' },
    { data: 'center.y', title: 'Center Y', render: data => data ? data.toFixed(3) : '', className: 'text-end property-column' },
    { data: 'duration.transition', title: 'Transition (ms)', defaultContent: '', className: 'text-end property-column' },
    { data: 'duration.still', title: 'Still (ms)', defaultContent: '', className: 'text-end property-column' },
    {
      data: 'originalIndex',
      title: 'Actions',
      orderable: false,
      searchable: false,
      className: 'text-center actions-column',
      render: (data, type, row) => `
        <button class="btn btn-sm btn-outline-primary edit-action me-1" data-index="${data}" title="Edit Point">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
          </svg>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-action" data-index="${data}" title="Delete Point">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg>
        </button>
      `
    }
  ];

  sequenceDataTable = new DataTable(tableElementId, {
    columns: columns,
    data: [], // Initially empty, will be populated by updateTable
    paging: false, // Keep it simple for now
    searching: true,
    info: true,
    autoWidth: false,
    language: {
        emptyTable: "No sequence points defined yet.",
        search: "_INPUT_", // Use Bootstrap input group styling
        searchPlaceholder: "Search table..."
    },
    // Make table vertically scrollable if needed
    // scrollY: 'calc(100vh - 350px)', 
    // scrollCollapse: true,
  });

  // --- Event Delegation for Actions ---
  const tableBody = document.querySelector(`${tableElementId} tbody`);
  
  if(tableBody){
      tableBody.addEventListener('click', (e) => {
          const editButton = e.target.closest('.edit-action');
          const deleteButton = e.target.closest('.delete-action');
          
          if (editButton) {
              e.preventDefault();
              const index = parseInt(editButton.dataset.index);
              console.log('Edit button clicked via delegation for index:', index);
              // Call the interactions module's function to show the edit modal
              window.KenBurns.interactions.showPointEditModal(index);
          } else if (deleteButton) {
              e.preventDefault();
              const index = parseInt(deleteButton.dataset.index);
              if (confirm(`Are you sure you want to delete point ${index + 1}?`)) {
                  console.log('Delete button clicked via delegation for index:', index);
                  window.KenBurns.sequence.deletePoint(index);
                  updateTable(); // Refresh the DataTable
                  updateJsonFromSequence(); // Update the JSON view
                  
                  // Update visualization
                  const viewer = window.KenBurns.viewer.getViewer();
                  window.KenBurns.visualization.updateVisualizations(viewer);
                  window.KenBurns.ui.showToast(`Point ${index + 1} deleted.`, 'success');
              }
          }
      });
  } else {
      console.error("Table body not found for event delegation.");
  }
}

// Update the table display using DataTables API
function updateTable() {
  // Initialize DataTable if it hasn't been already
  if (!sequenceDataTable) {
    initializeDataTable();
    // Check if initialization was successful before proceeding
    if (!sequenceDataTable) {
        console.error("DataTable failed to initialize. Cannot update table.");
        return; 
    }
  }

  // Now, clear the table and add the current sequence data
  const sequence = window.KenBurns.sequence.getSequence();
  // Map sequence data and add original index for actions
  const mappedData = sequence.map((point, index) => ({
    ...point,
    originalIndex: index // Add index for button data attributes
  }));

  // Clear existing data, add new data, and redraw the table
  sequenceDataTable.clear().rows.add(mappedData).draw();
}

// Function to update JSON from sequence (Keep as is)
function updateJsonFromSequence() {
  const fullTourInfo = window.KenBurns.sequence.getTourInfo();
  document.getElementById('sequence-json').value = JSON.stringify(fullTourInfo, null, 2);
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.table = {
  updateTable,          // Expose the updated function
  // updateSequenceFromInput, // Removed - obsolete
  updateJsonFromSequence
};