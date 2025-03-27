// Viewer configuration

/**
 * Default viewer configuration
 */
export const defaultConfig = {
  id: "viewer",
  prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
  showNavigationControl: false,
  animationTime: 0.3,
  blendTime: 0.1,
  constrainDuringPan: true,
  crossOriginPolicy: 'Anonymous',
  subPixelRoundingForTransparency: true,
  immediateRender: false,
  preserveViewport: true,
  preload: true,
  minZoomImageRatio: 0.1,
  maxZoomPixelRatio: 10
};

/**
 * Update viewer quality settings
 */
export function updateQualitySettings(viewer, quality) {
  if (!viewer) return;
  
  switch(quality) {
    case 'high':
      viewer.defaultZoomLevel = 1;
      viewer.minZoomImageRatio = 0.1;
      viewer.maxZoomPixelRatio = 10;
      break;
    case 'medium':
      viewer.defaultZoomLevel = 0.8;
      viewer.minZoomImageRatio = 0.2;
      viewer.maxZoomPixelRatio = 5;
      break;
    case 'low':
      viewer.defaultZoomLevel = 0.5;
      viewer.minZoomImageRatio = 0.5;
      viewer.maxZoomPixelRatio = 2;
      break;
  }
  
  // Redraw to apply changes
  viewer.forceRedraw();
}

/**
 * Update animation smoothness
 */
export function updateAnimationSmoothness(viewer, smooth) {
  if (!viewer) return;
  
  viewer.animationTime = smooth ? 0.3 : 0.1;
  viewer.blendTime = smooth ? 0.1 : 0;
}

/**
 * Update memory optimization settings
 */
export function updateMemoryOptimization(viewer, optimize) {
  if (!viewer) return;
  
  viewer.imageLoaderLimit = optimize ? 3 : 10;
  viewer.maxImageCacheCount = optimize ? 50 : 200;
}
