// Sequence data model
import { validateSequencePoint, validateTourInfo } from './validation.js';

// Default sequence
const defaultSequence = [
  { id: "overview", order: 1, zoom: 1, center: { x: 0.5, y: 0.5 }, duration: { transition: 1000, still: 1000 }, title: "Overview", description: "Overview of the image" },
  { id: "detail1", order: 2, zoom: 3, center: { x: 0.5, y: 0.4 }, duration: { transition: 2000, still: 2000 }, title: "Detail 1", description: "Examining the first detail" },
  { id: "detail2", order: 3, zoom: 2.5, center: { x: 0.7, y: 0.6 }, duration: { transition: 2000, still: 2000 }, title: "Detail 2", description: "Examining the second detail" },
  { id: "detail3", order: 4, zoom: 4, center: { x: 0.3, y: 0.3 }, duration: { transition: 2500, still: 2500 }, title: "Detail 3", description: "Examining the third detail" },
  { id: "conclusion", order: 5, zoom: 1, center: { x: 0.5, y: 0.5 }, duration: { transition: 2000, still: 2000 }, title: "Conclusion", description: "Returning to the overview" }
];

// Default tour info
const defaultTourInfo = {
  id: "default_tour",
  title: "Default Tour",
  tiles: "https://i.micr.io/vjYfT/info.json",
  description: "Default tour description",
  pointsOfInterest: defaultSequence
};

// Current sequence and tour info
let sequence = [...defaultSequence];
let tourInfo = { ...defaultTourInfo };

/**
 * Update sequence from JSON input
 */
export function updateSequenceFromJson(jsonText) {
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

/**
 * Get current sequence
 */
export function getSequence() {
  return sequence;
}

/**
 * Set sequence directly
 */
export function setSequence(newSequence) {
  sequence = newSequence;
  tourInfo.pointsOfInterest = newSequence;
  return sequence;
}

/**
 * Get current tour info
 */
export function getTourInfo() {
  // Ensure tour info always has latest sequence
  tourInfo.pointsOfInterest = sequence;
  return tourInfo;
}

/**
 * Set tour info directly
 */
export function setTourInfo(newTourInfo) {
  const validated = validateTourInfo(newTourInfo);
  tourInfo = validated;
  sequence = tourInfo.pointsOfInterest;
  return tourInfo;
}
