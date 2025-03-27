// Facade pattern to maintain backward compatibility with the global window.KenBurns API
import * as viewer from './viewer/index.js';
import * as sequence from './sequence/index.js';
import * as visualization from './visualization/index.js';
import * as capture from './capture/index.js';
import * as interactions from './interactions/index.js';
import * as ui from './ui/index.js';
import * as table from './table/index.js';
import * as tours from './tours/index.js';

// Initialize global namespace if not already defined
window.KenBurns = window.KenBurns || {};

// Set up the global KenBurns API
window.KenBurns = {
  ...window.KenBurns,
  
  // Viewer module
  viewer: {
    initialize: viewer.initializeViewer,
    getViewer: viewer.getViewer,
    loadNewImage: (url) => viewer.imageLoader.loadNewImage(viewer.getViewer(), url),
    smoothPanZoom: (viewer, zoom, center, duration) => 
      viewer.navigation.smoothPanZoom(viewer, zoom, center, duration),
    resetView: (viewer) => viewer.navigation.resetView(viewer)
  },
  
  // Sequence module
  sequence: {
    getSequence: sequence.getSequence,
    setSequence: sequence.setSequence,
    getTourInfo: sequence.getTourInfo,
    setTourInfo: sequence.setTourInfo,
    addPoint: sequence.addPoint,
    updatePoint: sequence.updatePoint,
    deletePoint: sequence.deletePoint,
    updateSequenceFromJson: sequence.updateSequenceFromJson,
    validateSequencePoint: sequence.validateSequencePoint,
    validateTourInfo: sequence.validateTourInfo
  },
  
  // Visualization module
  visualization: {
    updateVisualizations: visualization.updateVisualizations,
    updateVisualizationsForCurrentView: visualization.updateVisualizationsForCurrentView,
    setCurrentPoint: visualization.state.setCurrentPoint,
    updateCaptureFrame: visualization.frames.updateCaptureFrame,
    clearMarkers: (markers) => { return []; },
    updateTitleCalloutAndSubtitle: visualization.captions.updateTitleCalloutAndSubtitle,
    clearTitleCalloutAndSubtitle: visualization.captions.clearTitleCalloutAndSubtitle,
    isDragging: visualization.state.isDraggingPoint,
    setDragging: visualization.state.setDragging,
    getDragPointIndex: visualization.state.getDragPointIndex,
    isZoomingPoint: visualization.state.isZoomingPoint,
    setZoomingPoint: visualization.state.setZoomingPoint,
    getZoomPointIndex: visualization.state.getZoomPointIndex
  },
  
  // Capture module
  capture: {
    startRecording: capture.default.startRecording,
    startPreview: capture.default.startPreview,
    stopRecording: capture.default.stopRecording,
    startAnimation: capture.default.startAnimation,
    animate: capture.default.animate,
    isCapturing: capture.default.isCapturing,
    isPreviewMode: capture.default.isPreviewMode
  },
  
  // Interactions module
  interactions: {
    setupViewerInteractions: interactions.setupViewerInteractions,
    setupAspectRatioHandling: interactions.setupAspectRatioHandling,
    showPointEditModal: interactions.showPointEditModal,
    hidePointEditModal: interactions.hidePointEditModal
  },
  
  // UI module
  ui: {
    setupEventListeners: ui.setupEventListeners,
    updateTourInfo: ui.updateTourInfo
  },
  
  // Table module
  table: {
    updateTable: table.updateTable,
    setupTablePropertiesToggle: table.setupTablePropertiesToggle,
    updateJsonFromSequence: table.updateJsonFromSequence,
    updateSequenceFromInput: table.events.updateSequenceFromInput
  },
  
  // Tours module
  tours: {
    initialize: tours.initialize,
    loadTour: tours.loadTour,
    getCurrentTour: tours.getCurrentTour,
    generateSRT: tours.generateSRT,
    downloadSRT: tours.downloadSRT
  }
};

// Export the KenBurns global object for module imports
export default window.KenBurns;