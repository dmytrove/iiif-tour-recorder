// Sequence operations (add, update, delete)
import { validateSequencePoint } from './validation.js';

/**
 * Add a new point to the sequence
 */
export function addPoint(sequence, zoom, center, duration = { transition: 1500, still: 1500 }, title = "", description = "") {
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
  
  const newPoint = validateSequencePoint({
    zoom,
    center,
    duration: durationObj,
    title,
    description
  });
  
  sequence.push(newPoint);
  return sequence;
}

/**
 * Update a point in the sequence
 */
export function updatePoint(sequence, index, property, value) {
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

/**
 * Delete a point from the sequence
 */
export function deletePoint(sequence, index) {
  if (index < 0 || index >= sequence.length) return false;
  sequence.splice(index, 1);
  return true;
}

/**
 * Reorder points in the sequence
 */
export function reorderPoints(sequence, oldIndex, newIndex) {
  if (oldIndex < 0 || oldIndex >= sequence.length) return false;
  if (newIndex < 0 || newIndex >= sequence.length) return false;
  
  const point = sequence.splice(oldIndex, 1)[0];
  sequence.splice(newIndex, 0, point);
  
  return true;
}
