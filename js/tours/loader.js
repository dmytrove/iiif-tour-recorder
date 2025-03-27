// Tour loading functionality

// Current loaded tour data
let currentTour = null;

/**
 * Load a tour from the given path
 */
export async function loadTour(tourPath) {
  try {
    const response = await fetch(tourPath);
    if (!response.ok) {
      throw new Error(`Failed to load tour: ${response.status} ${response.statusText}`);
    }
    
    const tourData = await response.json();
    
    // Validate and set the tour info
    if (window.KenBurns && window.KenBurns.sequence) {
      currentTour = window.KenBurns.sequence.setTourInfo(tourData);
    } else {
      currentTour = tourData;
    }
    
    // Update IIIF URL if provided in tour
    if (tourData.tiles) {
      document.getElementById('iiif-url').value = tourData.tiles;
      // Load the image if viewer is initialized
      if (window.KenBurns && window.KenBurns.viewer) {
        const viewer = window.KenBurns.viewer.getViewer();
        if (viewer) {
          window.KenBurns.viewer.loadNewImage(tourData.tiles);
        }
      }
    }
    
    // Update table and JSON if available
    if (window.KenBurns.table) {
      window.KenBurns.table.updateTable();
      window.KenBurns.table.updateJsonFromSequence();
    }
    
    // Update visualizations if viewer is ready
    if (window.KenBurns.viewer && window.KenBurns.visualization) {
      const viewer = window.KenBurns.viewer.getViewer();
      if (viewer) {
        window.KenBurns.visualization.updateVisualizations(viewer);
      }
    }
    
    return currentTour;
  } catch (error) {
    console.error('Error loading tour:', error);
    throw error;
  }
}

/**
 * Get the current tour data
 */
export function getCurrentTour() {
  // If sequence module is available, use its getTourInfo function to ensure latest data
  if (window.KenBurns && window.KenBurns.sequence) {
    return window.KenBurns.sequence.getTourInfo();
  }
  return currentTour;
}

/**
 * Set the current tour
 */
export function setCurrentTour(tour) {
  currentTour = tour;
  return currentTour;
}
