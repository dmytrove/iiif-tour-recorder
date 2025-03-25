# Software Architecture Description - Ken Burns Effect Creator

## System Overview

The Ken Burns Effect Creator is a browser-based application for creating, editing, and exporting animations that use the Ken Burns effect (dynamic panning and zooming on still images). The application is built using vanilla JavaScript with no framework dependencies, focusing on modularity and clean separation of concerns.

## Core Components

The system is organized into the following key modules:

### 1. Viewer Component (`viewer.js`)

**Responsibility**: Manages the OpenSeadragon deep zoom viewer instance and provides an interface for image loading and viewport manipulation.

**Key Functions**:
- `initializeViewer()`: Creates and configures the OpenSeadragon viewer
- `loadNewImage(url)`: Loads a new IIIF image into the viewer
- `smoothPanZoom()`: Provides smooth animation between points using Tween.js
- `getViewportCoordinates()`: Converts screen coordinates to viewport coordinates
- `setQualityLevel()`: Configures rendering quality for performance optimization
- `captureCurrentViewAsImage()`: Creates a snapshot of the current view for recording

### 2. Sequence Management (`sequence.js`) 

**Responsibility**: Manages the animation sequence data structure and provides methods for manipulating points.

**Key Functions**:
- `addPoint()`, `updatePoint()`, `deletePoint()`: CRUD operations for sequence points
- `updateSequenceFromJson()`: Parses and validates JSON sequence data
- `reorderPoints()`: Changes the order of points in the sequence
- `calculateTotalDuration()`: Computes the total animation length
- `validateSequence()`: Performs integrity checks on the sequence data
- `exportSequenceToJson()`: Creates a serialized version of the sequence

### 3. Visualization Component (`visualization.js`)

**Responsibility**: Renders visual representations of the sequence points and connects them with lines.

**Key Functions**:
- `updateVisualizations()`: Creates markers, rectangles, and lines for all points
- `updateCaptureFrame()`: Updates the capture frame based on selected aspect ratio
- `updateTitleCalloutAndSubtitle()`: Shows/hides titles and descriptions during animation
- `setVisualizationStyle()`: Configures the appearance of visualization elements
- `updateConnectionLines()`: Refreshes the paths between sequence points
- `toggleVisualizationVisibility()`: Shows/hides visual elements during recording

### 4. Capture Component (`capture.js`)

**Responsibility**: Handles video recording, preview, and animation playback.

**Key Functions**:
- `startRecording()`, `startPreview()`, `stopRecording()`: Controls recording state
- `startAnimation()`: Initiates animation sequence
- `animate()`: Animation loop (requestAnimationFrame) for smooth capture
- `configureQuality()`: Sets encoding parameters for output quality
- `monitorMemoryUsage()`: Tracks and optimizes memory consumption during capture
- `generateFileName()`: Creates output filenames based on tour information
- `cleanupAfterRecording()`: Manages resources after recording completes

### 5. Table Management (`table.js`)

**Responsibility**: Provides tabular UI for editing sequence data.

**Key Functions**:
- `updateTable()`: Populates the table from the sequence data
- `updateSequenceFromInput()`: Updates sequence when table inputs change
- `updateJsonFromSequence()`: Synchronizes JSON representation with sequence data
- `setupDragAndDrop()`: Enables reordering points via drag and drop
- `validateTableInput()`: Performs input validation for table fields
- `applyBulkChanges()`: Updates multiple sequence points simultaneously
- `exportTableData()`: Exports sequence data to CSV or other formats

### 6. Tours Component (`tours.js`)

**Responsibility**: Manages loading and saving tour data (presets).

**Key Functions**:
- `scanAvailableTours()`: Loads available tours from tours.json
- `loadTour()`: Loads tour data from individual JSON files
- `generateSRT()`: Creates subtitle files from sequence descriptions
- `downloadSRT()`: Handles SRT file download
- `saveTourData()`: Persists tour data to local storage or download
- `importTourFromFile()`: Loads a tour from a user-uploaded file
- `validateTourFile()`: Ensures imported tour data is properly formatted

### 7. Interactions Component (`interactions.js`)

**Responsibility**: Manages user interactions with the viewer and points.

**Key Functions**:
- `setupViewerInteractions()`: Sets up events for clicking, dragging, and zooming points
- `setupAspectRatioHandling()`: Manages aspect ratio selection and visualization
- `registerKeyboardShortcuts()`: Sets up keyboard navigation and commands
- `setupTouchInteractions()`: Enables touch support for mobile/tablet devices
- `handleMultiplePointSelection()`: Supports selecting and manipulating multiple points
- `setupContextMenu()`: Provides context-specific options for points

### 8. UI Component (`ui.js`)

**Responsibility**: Handles UI controls and event listeners.

**Key Functions**:
- `setupEventListeners()`: Attaches events to UI controls
- `updateTourInfo()`: Displays information about the current tour
- `updateUIState()`: Reflects the current application state in the UI
- `showNotification()`: Displays user feedback messages
- `setupTabNavigation()`: Manages the tabbed interface
- `updateProgressIndicator()`: Shows recording/playback progress
- `setupResponsiveLayout()`: Adapts UI for different screen sizes

## Data Flow

1. User loads the application (`index.html` → `script.js`)
2. Main script initializes all components
3. Default tour is loaded from tours defined in `tours/tours.json`
4. User interacts with the viewer to add/modify points
5. Changes are reflected in the table and JSON representation
6. User can preview or record the animation sequence
7. Capture component generates the video output

## Data Structures

### Point Object
```javascript
{
  id: String,            // Unique identifier for the point
  zoom: Number,          // Zoom level (e.g., 1.0, 2.5)
  center: {              // Center coordinates in viewport space
    x: Number,           // X coordinate (0.0 - 1.0)
    y: Number            // Y coordinate (0.0 - 1.0)
  },
  duration: Number,      // Milliseconds for animation to this point
  title: String,         // Optional title for callout
  description: String,   // Optional description for subtitle
  easing: String,        // Optional easing function name (default: "easeInOutQuad")
  transition: Object     // Optional custom transition parameters
}
```

### Tour Object
```javascript
{
  id: String,            // Tour identifier
  title: String,         // Tour title
  description: String,   // Tour description
  tiles: String,         // IIIF image URL
  pointsOfInterest: [    // Array of points (see Point Object)
    // ...points
  ],
  metadata: {            // Optional metadata
    author: String,      // Author of the tour
    creationDate: String,// ISO date string of creation
    lastModified: String,// ISO date string of last modification
    version: String,     // Version of the tour
    tags: [String]       // Search tags for the tour
  }
}
```

## External Dependencies

- **OpenSeadragon**: Deep zoom image viewer (v4.1.0)
- **Tween.js**: Animation library (v21.0.0)
- **CCapture.js**: Client-side video capture (v1.1.0)
- **FileSaver.js**: Client-side file saving (v2.0.5)
- **Puppeteer**: Headless browser automation for server-side generation (v20.7.4, headless mode only)

## Design Patterns

1. **Module Pattern**: Each core component is encapsulated in its own module with clear responsibilities
2. **Observer Pattern**: Components communicate through events and callbacks
3. **Facade Pattern**: The `window.KenBurns` object provides a simplified interface to the underlying modules
4. **Command Pattern**: Used for implementing undo/redo functionality
5. **Factory Pattern**: For creating different types of visualization elements
6. **Strategy Pattern**: For implementing different animation easing functions
7. **Singleton Pattern**: Used for global configuration and state management

## Architectural Decisions

### Browser-only Architecture
The application runs entirely in the browser with no server-side components, allowing for easy deployment and offline use. Video processing is done client-side using CCapture.js.

### IIIF Support
The application is built around the IIIF Image API, allowing it to work with high-resolution images from cultural heritage institutions without downloading the entire image.

### Modular Design
The codebase is organized into separate modules with clear responsibilities, making it easier to maintain and extend.

### Progressive Enhancement
The application follows a progressive enhancement approach, providing core functionality in basic browsers while enhancing the experience in more capable browsers.

### Memory Management
Special attention is paid to memory usage during video recording, with mechanisms to release resources and prevent memory leaks.

## Performance Considerations

### Rendering Optimization
- Dynamic quality settings based on device capabilities
- Throttling of visualization updates during animation
- Use of web workers for computationally intensive tasks
- Image pre-fetching for smoother animations
- Canvas-based rendering for better performance with large images

### Memory Management
- Progressive loading of image tiles
- Disposal of unused resources during long recordings
- Monitoring of memory usage to prevent crashes
- Automatic quality adjustment based on available memory

## Security Considerations

### Content Security
- Implementation of Content Security Policy (CSP)
- Validation of IIIF image sources
- Sanitization of user-provided input
- Secure handling of local storage data

### Data Privacy
- No user data collection or tracking
- Local-only storage of tour data
- Option to encrypt sensitive tour data
- No third-party API dependencies that could leak information

## Accessibility Features

- Keyboard navigation for all key functions
- ARIA attributes for screen reader compatibility
- Configurable visualization colors for color blindness
- Adjustable UI sizing for better visibility
- Alternative text descriptions for visual elements

## Future Enhancements

1. **Server Integration**: Add optional backend for saving projects and processing videos
2. **Multiple Image Support**: Allow animations across multiple images
3. **Custom Transitions**: Support for different transition types between points
4. **Timeline Editor**: More advanced timeline-based editing interface
5. **Export Formats**: Support for additional output formats (MP4, GIF)
6. **Collaborative Editing**: Real-time collaboration features
7. **Audio Integration**: Support for adding narration and background music
8. **AI-Assisted Tours**: Automated tour generation based on image analysis
9. **3D Object Support**: Extend functionality to work with 3D objects
10. **Mobile App**: Native mobile application for iOS and Android

## Testing Strategy

### Unit Testing
- Jest for JavaScript function testing
- Jasmine for behavior-driven testing
- Stubs for external dependencies

### Integration Testing
- End-to-end testing with Playwright
- Cross-browser compatibility testing
- Performance benchmarking

### User Testing
- Usability sessions with target users
- A/B testing for UI improvements
- Feedback collection through in-app mechanisms

## Deployment Options

### Static Web Hosting
- Deploy as static files to any web server
- CDN distribution for improved performance
- Docker container for consistent deployment

### Headless Server
- Node.js server for headless video generation
- API endpoints for programmatic access
- Queue system for handling multiple rendering jobs