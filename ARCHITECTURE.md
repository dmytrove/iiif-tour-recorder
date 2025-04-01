# Software Architecture Document (SAD)

## 1. Introduction

This document outlines the architecture of the IIIF Tour Recorder & Ken Burns Animator application. It is a client-side web application designed to create Ken Burns-style animations on IIIF images and record them as video tours.

## 2. Architectural Goals

*   **Modularity**: Separate concerns into distinct JavaScript modules.
*   **Maintainability**: Clear code structure and dependencies.
*   **Extensibility**: Allow for future features (e.g., different export formats, advanced editing).
*   **User Experience**: Provide a responsive and intuitive interface.

## 3. System Overview

The system is a single-page application (SPA) running entirely in the user's web browser. It relies heavily on JavaScript for interactivity, image manipulation, animation, and video capture.

## 4. Key Components

### 4.1. Frontend (Client-Side)

*   **`index.html`**: The main HTML structure, including containers for the viewer, offcanvas panels (controls, info, playback, sequence), modals, and buttons.
*   **`styles.css`**: Custom CSS rules and overrides for Bootstrap 5 components to achieve the desired dark theme, layout, and specific element styling (e.g., progress markers, overlays).
*   **`script.js`**: Main entry point. Initializes the viewer, loads necessary modules, sets up initial event listeners, and handles application-level events (e.g., download completion).

### 4.2. JavaScript Modules (`js/`)

*   **`viewer.js`**: Manages the OpenSeadragon viewer instance, including initialization, loading IIIF images, and providing helper functions for smooth panning and zooming (using Tween.js).
*   **`sequence.js`**: Handles the animation sequence data (array of points). Includes functions for adding, removing, updating points, getting/setting the sequence, and loading/saving sequence data (implicitly via tour loading).
*   **`capture.js`**: Manages the recording and preview process.
    *   Interfaces with CCapture.js to record canvas frames.
    *   Controls the animation timing using `requestAnimationFrame` and TWEEN.js.
    *   Calculates total duration and frames.
    *   Handles the logic for burning text overlays onto the canvas during capture.
    *   Manages recording/preview states (`isCapturing`, `isPreview`).
*   **`tours.js`**: Handles loading tour data from `tours/manifest.json`, populating the tour selector UI, loading selected tours (which involves updating the IIIF image and sequence), and managing SRT generation/download.
*   **`ui.js`**: Manages UI updates and interactions.
    *   Sets up event listeners for UI elements (buttons, inputs, accordions).
    *   Updates UI displays (tour info, JSON editor, progress bar/markers/labels).
    *   Handles dynamic UI generation (e.g., tour selector cards, progress markers).
    *   Manages UI state transitions (e.g., enabling/disabling buttons).
    *   Controls Bootstrap components (modals, toasts, offcanvas - though Bootstrap handles basic toggling).
*   **`visualization.js`**: Responsible for drawing visual overlays on the OpenSeadragon viewer (point markers, sequence lines, capture frame outline, live title/subtitle displays).
*   **`interactions.js`**: Handles user interactions directly on the OpenSeadragon viewer (Ctrl+Click to add points, Shift+Click to edit points, point dragging - planned).
*   **(Obsolete/Removed)** `table.js`, `modal.js`, etc.: Older modules replaced by integrated Bootstrap components and logic within `ui.js`.

### 4.3. Dependencies (External Libraries - `lib/`)

*   **OpenSeadragon (v4.1.0)**: Core deep zoom image viewer.
*   **Tween.js (v21.0.0)**: Handles smooth animation interpolation for pan/zoom.
*   **CCapture.js (v1.1.0)**: Client-side canvas recording library.
*   **Bootstrap (v5.3.3)**: UI framework for layout, components (offcanvas, accordion, modal, etc.), and styling.
*   **Bootstrap Icons**: Icon font library.
*   **FileSaver.js**: Used for triggering file downloads (SRT, WebM).
*   **jQuery (v3.6.0)**: (Potentially used by DataTables or older code - review if still needed).
*   **DataTables**: (If sequence table implementation uses it - review if active).

### 4.4. Tour Data (`tours/`)

*   **`manifest.json`**: Lists available tours with metadata (title, description, thumbnail, IIIF `info.json` URL, optional pre-defined `pointsOfInterest`).

## 5. Data Flow

1.  **Initialization**: `script.js` initializes OpenSeadragon (`viewer.js`), loads tours (`tours.js`), and sets up UI listeners (`ui.js`).
2.  **Tour Loading**: User selects a tour (`tours.js`) -> `viewer.js` loads the IIIF image -> `sequence.js` loads points -> `ui.js` updates info panel -> `visualization.js` draws markers.
3.  **Point Creation**: User interacts with viewer (`interactions.js`) -> `sequence.js` adds point -> `ui.js` updates sequence table -> `visualization.js` adds marker.
4.  **Animation Start**: User clicks Preview/Record (`ui.js`) -> `capture.js` calculates duration, starts `animate` loop, sets initial text, schedules `animateNextPoint` -> `ui.js` updates progress bar/markers.
5.  **Animation Loop**: `capture.js` (`animate`) runs continuously -> updates TWEEN -> updates UI progress (`ui.js`) -> draws burn-in text (if enabled/recording) -> captures frame via CCapture.js (if recording).
6.  **Segment Transition**: `capture.js` (`animateNextPoint`) called by timer -> updates text variables -> starts TWEEN transition (`viewer.js`) -> schedules next call.
7.  **SRT Generation**: User clicks button (`ui.js`) -> `tours.js` reads sequence, formats SRT string -> `ui.js` updates textarea/enables download.

## 6. Key Design Decisions

*   **Client-Side Recording**: Using CCapture.js avoids server-side processing for video generation, simplifying deployment but potentially limited by browser performance.
*   **Modular JavaScript**: Separating logic into modules improves organization.
*   **Bootstrap UI**: Leveraging a standard framework speeds up UI development and ensures consistency.
*   **Offcanvas Panels**: Using offcanvas keeps the main viewer area clean while providing access to controls and information.
*   **State Management**: Primarily handled within relevant modules (`capture.js` for recording state, `sequence.js` for points, etc.), with UI updates triggered via direct function calls or potentially events (e.g., download completion). 