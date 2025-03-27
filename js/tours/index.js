// Tours module - main entry point
import * as loader from './loader.js';
import * as selector from './selector.js';
import * as subtitle from './subtitle.js';

/**
 * Initialize by loading available tours
 */
async function initialize() {
  try {
    // Scan tours directory for available tours first
    await selector.scanAvailableTours();
    
    // Load default tour (SK-A-2099.json)
    await loader.loadTour('tours/SK-A-2099.json');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize tours:', error);
    return false;
  }
}

// Export functions
export {
  initialize,
  loader,
  selector,
  subtitle
};

// Export main functions directly
export const loadTour = loader.loadTour;
export const getCurrentTour = loader.getCurrentTour;
export const generateSRT = subtitle.generateSRT;
export const downloadSRT = subtitle.downloadSRT;
