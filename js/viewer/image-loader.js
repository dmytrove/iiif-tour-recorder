// Image loading functionality

/**
 * Load a new IIIF image
 */
export function loadNewImage(viewer, url) {
  // Close current tileSources
  viewer.close();
  
  // Open new tileSources
  viewer.open(url);
  
  // Return a promise that resolves when the image is fully loaded
  return new Promise(resolve => {
    viewer.addOnceHandler('open', () => {
      resolve(viewer);
    });
  });
}

/**
 * Get image info from the viewer
 */
export function getImageInfo(viewer) {
  if (!viewer || !viewer.world || !viewer.world.getItemCount()) {
    return {
      width: 0,
      height: 0,
      aspectRatio: 1,
      url: null
    };
  }
  
  try {
    const item = viewer.world.getItemAt(0);
    
    if (!item || !item.source) {
      return {
        width: 0,
        height: 0,
        aspectRatio: 1,
        url: null
      };
    }
    
    const source = item.source;
    
    // Try to get dimensions
    let width = source.dimensions ? source.dimensions.x : (source.width || 0);
    let height = source.dimensions ? source.dimensions.y : (source.height || 0);
    
    // If not available, try to get from tileSources
    if (!width || !height) {
      if (viewer.tileSources && viewer.tileSources[0]) {
        const tileSource = viewer.tileSources[0];
        width = tileSource.width || 0;
        height = tileSource.height || 0;
      }
    }
    
    return {
      width,
      height,
      aspectRatio: width / height,
      url: source.url || null
    };
  } catch (e) {
    console.warn('Error getting image info:', e);
    return {
      width: 0,
      height: 0,
      aspectRatio: 1,
      url: null
    };
  }
}
