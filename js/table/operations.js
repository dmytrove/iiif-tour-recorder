// Table-specific operations

/**
 * Function to update JSON from sequence
 */
export function updateJsonFromSequence() {
  // Get the full tour info, with updated sequence
  const fullTourInfo = window.KenBurns.sequence.getTourInfo();
  document.getElementById('sequence-json').value = JSON.stringify(fullTourInfo, null, 2);
}

/**
 * Function to update sequence from JSON
 */
export function updateSequenceFromJson() {
  const jsonText = document.getElementById('sequence-json').value;
  return window.KenBurns.sequence.updateSequenceFromJson(jsonText);
}

/**
 * Show point edit modal
 */
export function showPointEditModal(index) {
  // Call the interactions module's function to show the edit modal
  const viewer = window.KenBurns.viewer.getViewer();
  
  console.log('Calling interactions.showPointEditModal with index:', index, 'Viewer object exists:', !!viewer);
  
  // Just pass the index directly - we've fixed the interactions.js function to handle this
  window.KenBurns.interactions.showPointEditModal(index);
}
