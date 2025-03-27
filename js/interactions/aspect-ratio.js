// Aspect ratio handling

/**
 * Setup aspect ratio handling
 */
export function setupAspectRatioHandling(viewer) {
  const aspectRatio = document.getElementById('aspect-ratio');
  const customAspectRatio = document.getElementById('custom-aspect-ratio');
  const showCaptureFrame = document.getElementById('show-capture-frame');
  
  // Handle aspect ratio selection change
  aspectRatio.addEventListener('change', () => {
    if (aspectRatio.value === 'custom') {
      customAspectRatio.style.display = 'block';
    } else {
      customAspectRatio.style.display = 'none';
    }
    
    // Update capture frame
    window.KenBurns.visualization.updateCaptureFrame(viewer, aspectRatio.value);
  });
  
  // Show/hide capture frame
  showCaptureFrame.addEventListener('change', () => {
    window.KenBurns.visualization.updateCaptureFrame(viewer, aspectRatio.value);
  });
  
  // Custom aspect ratio inputs
  document.getElementById('custom-width').addEventListener('change', () => {
    window.KenBurns.visualization.updateCaptureFrame(viewer, 'custom');
  });
  
  document.getElementById('custom-height').addEventListener('change', () => {
    window.KenBurns.visualization.updateCaptureFrame(viewer, 'custom');
  });
  
  // Initialize capture frame
  window.KenBurns.visualization.updateCaptureFrame(viewer, aspectRatio.value);
}

/**
 * Get the current aspect ratio settings
 */
export function getAspectRatioSettings() {
  const aspectRatio = document.getElementById('aspect-ratio').value;
  
  if (aspectRatio === 'custom') {
    return {
      type: 'custom',
      width: parseInt(document.getElementById('custom-width').value),
      height: parseInt(document.getElementById('custom-height').value)
    };
  } else if (aspectRatio === '0') {
    return {
      type: 'viewport'
    };
  } else {
    // Parse ratio like "16:9"
    const [width, height] = aspectRatio.split(':').map(Number);
    return {
      type: 'ratio',
      ratio: aspectRatio,
      width,
      height
    };
  }
}

/**
 * Calculate dimensions for current aspect ratio
 */
export function calculateDimensions(containerWidth, containerHeight) {
  const settings = getAspectRatioSettings();
  let width, height;
  
  if (settings.type === 'viewport') {
    width = containerWidth;
    height = containerHeight;
  } else if (settings.type === 'custom') {
    const ratio = settings.width / settings.height;
    
    if (containerWidth / containerHeight > ratio) {
      // Container is wider than frame
      height = containerHeight;
      width = height * ratio;
    } else {
      // Container is taller than frame
      width = containerWidth;
      height = width / ratio;
    }
  } else {
    // Predefined ratio
    const ratio = settings.width / settings.height;
    
    if (containerWidth / containerHeight > ratio) {
      // Container is wider than frame
      height = containerHeight;
      width = height * ratio;
    } else {
      // Container is taller than frame
      width = containerWidth;
      height = width / ratio;
    }
  }
  
  return { width, height };
}
