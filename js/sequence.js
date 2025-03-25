// Animation sequence management
// Default sequence
let sequence = [
  { id: "overview", order: 1, zoom: 1, center: { x: 0.5, y: 0.5 }, duration: { transition: 1000, still: 1000 }, title: "Overview", description: "Overview of the image" },
  { id: "detail1", order: 2, zoom: 3, center: { x: 0.5, y: 0.4 }, duration: { transition: 2000, still: 2000 }, title: "Detail 1", description: "Examining the first detail" },
  { id: "detail2", order: 3, zoom: 2.5, center: { x: 0.7, y: 0.6 }, duration: { transition: 2000, still: 2000 }, title: "Detail 2", description: "Examining the second detail" },
  { id: "detail3", order: 4, zoom: 4, center: { x: 0.3, y: 0.3 }, duration: { transition: 2500, still: 2500 }, title: "Detail 3", description: "Examining the third detail" },
  { id: "conclusion", order: 5, zoom: 1, center: { x: 0.5, y: 0.5 }, duration: { transition: 2000, still: 2000 }, title: "Conclusion", description: "Returning to the overview" }
];

// Full tour info object
let tourInfo = {
  id: "default_tour",
  title: "Default Tour",
  tiles: "https://i.micr.io/vjYfT/info.json",
  description: "Default tour description",
  pointsOfInterest: sequence
};

// Add validation for sequence points
function validateSequencePoint(point) {
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

// Validate the whole tour info structure
function validateTourInfo(info) {
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

// Update sequence from JSON input
function updateSequenceFromJson(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    
    // Check if it's a full tour format or just a sequence array
    if (Array.isArray(parsed)) {
      // It's just a sequence array
      const validatedSequence = parsed.map(point => {
        // Convert old format if needed
        if (!point.center && point.x !== undefined && point.y !== undefined) {
          return validateSequencePoint({
            zoom: point.zoom || 1,
            center: { x: point.x, y: point.y },
            duration: point.duration || 3000,
            title: point.title || "",
            description: point.description || ""
          });
        }
        return validateSequencePoint(point);
      });
      
      sequence = validatedSequence;
      
      // Update tourInfo with new sequence but keep other properties
      tourInfo.pointsOfInterest = sequence;
    } else if (parsed.pointsOfInterest) {
      // It's a full tour format
      tourInfo = validateTourInfo(parsed);
      sequence = tourInfo.pointsOfInterest;
      
      // Update IIIF URL if provided
      if (tourInfo.tiles) {
        document.getElementById('iiif-url').value = tourInfo.tiles;
      }
    } else {
      throw new Error('Invalid JSON format: must be either an array of points or a tour object with pointsOfInterest');
    }
    
    return true;
  } catch (error) {
    alert('Invalid JSON: ' + error.message);
    return false;
  }
}

// Add a new point to the sequence
function addPoint(zoom, center, duration = { transition: 1500, still: 1500 }, title = "", description = "") {
  // Handle the case when duration is passed as a number (backward compatibility)
  let durationObj;
  if (typeof duration === 'number') {
    durationObj = {
      transition: Math.floor(duration / 2),
      still: Math.ceil(duration / 2)
    };
  } else {
    durationObj = duration;
  }
  
  sequence.push(validateSequencePoint({
    zoom,
    center,
    duration: durationObj,
    title,
    description
  }));
}

// Update a point in the sequence
function updatePoint(index, property, value) {
  if (index < 0 || index >= sequence.length) return false;
  
  if (property === 'zoom') {
    sequence[index].zoom = parseFloat(value);
  } else if (property === 'centerX') {
    sequence[index].center.x = parseFloat(value);
  } else if (property === 'centerY') {
    sequence[index].center.y = parseFloat(value);
  } else if (property === 'durationTransition') {
    sequence[index].duration.transition = parseInt(value);
  } else if (property === 'durationStill') {
    sequence[index].duration.still = parseInt(value);
  } else if (property === 'title') {
    sequence[index].title = value;
  } else if (property === 'description') {
    sequence[index].description = value;
  }
  
  return true;
}

// Delete a point from the sequence
function deletePoint(index) {
  if (index < 0 || index >= sequence.length) return false;
  sequence.splice(index, 1);
  return true;
}



// Get current tour info - always returns updated version with current sequence
function getTourInfo() {
  // Ensure tour info always has latest sequence
  tourInfo.pointsOfInterest = sequence;
  return tourInfo;
}

// Set tour info directly
function setTourInfo(newTourInfo) {
  const validated = validateTourInfo(newTourInfo);
  tourInfo = validated;
  sequence = tourInfo.pointsOfInterest;
  return tourInfo;
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.sequence = {
  getSequence: () => sequence,
  setSequence: (newSequence) => { sequence = newSequence; tourInfo.pointsOfInterest = newSequence; },
  getTourInfo,
  setTourInfo,
  addPoint,
  updatePoint,
  deletePoint,
  updateSequenceFromJson,
  validateSequencePoint,
  validateTourInfo
};