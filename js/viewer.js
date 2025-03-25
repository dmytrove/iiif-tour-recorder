// OpenSeadragon initialization and core functionality
let viewer;

function initializeViewer(iiifUrl = "https://i.micr.io/vjYfT/info.json") {
  viewer = OpenSeadragon({
    id: "viewer",
    prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
    tileSources: iiifUrl,
    showNavigationControl: false,
    animationTime: 0.3,
    blendTime: 0.1,
    constrainDuringPan: true,
    crossOriginPolicy: 'Anonymous',
    // Enable subpixel rendering for improved quality
    subPixelRoundingForTransparency: true,
    immediateRender: false,
    preserveViewport: true,
    preload: true,
    minZoomImageRatio: 0.1,
    maxZoomPixelRatio: 10
  });

  // Return the viewer instance so it can be used elsewhere
  return viewer;
}

// Function to load a new IIIF image
function loadNewImage(url) {
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

// Reset the viewer to initial state
function resetView(viewer) {
  if (!viewer) return;
  
  // Go to home position (fit viewport)
  viewer.viewport.goHome();
  
  // Reset any animations
  TWEEN.removeAll();
  
  // Force redraw
  viewer.forceRedraw();
}

// Smooth pan and zoom using TWEEN
function smoothPanZoom(viewer, targetZoom, targetCenter, duration = 4000) {
  const viewport = viewer.viewport;

  const initial = {
    zoom: viewport.getZoom(),
    x: viewport.getCenter().x,
    y: viewport.getCenter().y
  };

  const target = {
    zoom: targetZoom,
    x: targetCenter.x,
    y: targetCenter.y
  };

  return new TWEEN.Tween(initial)
    .to(target, duration)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onUpdate(obj => {
      viewport.zoomTo(obj.zoom, null, true);
      viewport.panTo(new OpenSeadragon.Point(obj.x, obj.y), true);
    });
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.viewer = {
  initialize: initializeViewer,
  loadNewImage: loadNewImage,
  smoothPanZoom: smoothPanZoom,
  resetView: resetView,
  getViewer: () => viewer
};