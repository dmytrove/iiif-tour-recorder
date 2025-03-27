// Interactions module - main entry point
import * as aspectRatio from './aspect-ratio.js';
import * as viewer from './viewer.js';
import * as point from './point.js';

// Export modules and functions
export {
  setupViewerInteractions: viewer.setupViewerInteractions,
  setupAspectRatioHandling: aspectRatio.setupAspectRatioHandling,
  showPointEditModal: point.showPointEditModal,
  hidePointEditModal: point.hidePointEditModal
};
