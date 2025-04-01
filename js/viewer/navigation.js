// OpenSeadragon navigation functions

/**
 * Smooth pan and zoom using TWEEN
 */
export function smoothPanZoom(viewer, targetZoom, targetCenter, duration = 4000) {
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

  // Get the selected easing function from the settings
  const easingSelection = document.getElementById('easing-function')?.value || 'Cubic.InOut';
  const [easingFamily, easingType] = easingSelection.split('.');
  const easingFunction = TWEEN.Easing[easingFamily]?.[easingType] || TWEEN.Easing.Cubic.InOut;

  return new TWEEN.Tween(initial)
    .to(target, duration)
    .easing(easingFunction)
    .onUpdate(obj => {
      viewport.zoomTo(obj.zoom, null, true);
      viewport.panTo(new OpenSeadragon.Point(obj.x, obj.y), true);
    });
}

/**
 * Reset the viewer to initial state
 */
export function resetView(viewer) {
  if (!viewer) return;
  
  // Go to home position (fit viewport)
  viewer.viewport.goHome();
  
  // Reset any animations
  TWEEN.removeAll();
  
  // Force redraw
  viewer.forceRedraw();
}

/**
 * Get current viewport info
 */
export function getViewportInfo(viewer) {
  if (!viewer || !viewer.viewport) return null;
  
  const viewport = viewer.viewport;
  return {
    zoom: viewport.getZoom(),
    center: viewport.getCenter(),
    bounds: viewport.getBounds(),
    containerSize: viewport.getContainerSize()
  };
}

/**
 * Convert screen coordinates to viewport coordinates
 */
export function screenToViewport(viewer, x, y) {
  const point = new OpenSeadragon.Point(x, y);
  return viewer.viewport.pointFromPixel(point);
}

/**
 * Convert viewport coordinates to screen coordinates 
 */
export function viewportToScreen(viewer, x, y) {
  const point = new OpenSeadragon.Point(x, y);
  return viewer.viewport.pixelFromPoint(point);
}
