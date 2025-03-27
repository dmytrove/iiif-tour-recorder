// Table module - main entry point
import * as renderer from './renderer.js';
import * as events from './events.js';
import * as operations from './operations.js';

/**
 * Initialize the table
 */
export function initialize() {
  // Setup event handlers
  events.setupEventHandlers();
}

// Export modules and functions
export {
  renderer,
  events,
  operations
};

// Export main functions directly
export const updateTable = renderer.updateTable;
export const setupTablePropertiesToggle = renderer.setupTablePropertiesToggle;
export const updateJsonFromSequence = operations.updateJsonFromSequence;
export const updateSequenceFromJson = operations.updateSequenceFromJson;
export const showPointEditModal = operations.showPointEditModal;
