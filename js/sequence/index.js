// Sequence module - main entry point
import * as model from './model.js';
import * as validation from './validation.js';
import * as operations from './operations.js';

/**
 * Add a point to the sequence
 */
export function addPoint(zoom, center, duration, title, description) {
  const sequence = model.getSequence();
  operations.addPoint(sequence, zoom, center, duration, title, description);
  return sequence;
}

/**
 * Update a point in the sequence
 */
export function updatePoint(index, property, value) {
  const sequence = model.getSequence();
  return operations.updatePoint(sequence, index, property, value);
}

/**
 * Delete a point from the sequence
 */
export function deletePoint(index) {
  const sequence = model.getSequence();
  return operations.deletePoint(sequence, index);
}

// Export model and operations functions
export {
  model,
  validation,
  operations
};

// Export main model functions directly
export const getSequence = model.getSequence;
export const setSequence = model.setSequence;
export const getTourInfo = model.getTourInfo;
export const setTourInfo = model.setTourInfo;
export const updateSequenceFromJson = model.updateSequenceFromJson;
export const validateSequencePoint = validation.validateSequencePoint;
export const validateTourInfo = validation.validateTourInfo;
