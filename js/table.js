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
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-action" data-index="${data}" title="Delete Point">
          <i class="bi bi-trash"></i>
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
    // Make table vertically scrollable within the bottom offcanvas
    scrollY: 'calc(40vh - 140px)', // Adjust height based on offcanvas height and header/footer
    scrollCollapse: true,
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