// Sequence validation functions

/**
 * Validate a single sequence point
 */
export function validateSequencePoint(point) {
  // Handle both old and new duration formats
  let durationObj;
  if (typeof point.duration === 'object' && point.duration !== null) {
    // New format with transition and still
    durationObj = {
      transition: parseInt(point.duration.transition || 1500),
      still: parseInt(point.duration.still || 1500)
    };
  } else if (typeof point.duration === 'number' || typeof point.duration === 'string') {
    // Old format with a single duration value - split it in half for transition and still
    const totalDuration = parseInt(point.duration || 3000);
    durationObj = {
      transition: Math.floor(totalDuration / 2),
      still: Math.ceil(totalDuration / 2)
    };
  } else {
    // Default duration
    durationObj = {
      transition: 1500,
      still: 1500
    };
  }

  return {
    id: point.id || `point_${Date.now()}`,
    order: parseInt(point.order || 0),
    zoom: parseFloat(point.zoom || 1),
    center: {
      x: parseFloat(point.center?.x || 0.5),
      y: parseFloat(point.center?.y || 0.5)
    },
    duration: durationObj,
    title: point.title || "",
    description: point.description || ""
  };
}

/**
 * Validate the whole tour info structure
 */
export function validateTourInfo(info) {
  // Create default if nothing provided
  if (!info) {
    return {
      id: `tour_${Date.now()}`,
      title: "New Tour",
      tiles: document.getElementById('iiif-url').value || "https://i.micr.io/vjYfT/info.json",
      description: "Tour description",
      pointsOfInterest: []
    };
  }
  
  // Basic structure validation
  const validated = {
    id: info.id || `tour_${Date.now()}`,
    title: info.title || "Untitled Tour",
    tiles: info.tiles || document.getElementById('iiif-url').value || "https://i.micr.io/vjYfT/info.json",
    description: info.description || "",
    pointsOfInterest: Array.isArray(info.pointsOfInterest) ? 
      info.pointsOfInterest.map(point => validateSequencePoint(point)) : []
  };
  
  return validated;
}
