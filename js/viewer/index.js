// OpenSeadragon viewer module - main entry point
import * as navigation from './navigation.js';
import * as imageLoader from './image-loader.js';
import * as config from './config.js';

// Viewer instance
let viewer;

/**
 * Initialize the OpenSeadragon viewer
 */
export function initializeViewer(iiifUrl = "https://i.micr.io/vjYfT/info.json") {
  viewer = OpenSeadragon(config.defaultConfig);
  
  // Set tile source
  viewer.open(iiifUrl);

  // Return the viewer instance so it can be used elsewhere
  return viewer;
}

/**
 * Get the current viewer instance
 */
export function getViewer() {
  return viewer;
}

// Export modules
export {
  navigation,
  imageLoader,
  config
};

// Export specific functions directly for compatibility
export const loadNewImage = (url) => imageLoader.loadNewImage(viewer, url);
export const smoothPanZoom = navigation.smoothPanZoom;
export const resetView = navigation.resetView;