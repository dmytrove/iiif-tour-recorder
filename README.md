# IIIF Tour Recorder & Ken Burns Animator

An interactive web application that allows you to create dynamic Ken Burns effect animations from high-resolution IIIF images and record them as video tours, complete with optional burned-in titles and subtitles.

## Features

*   **Interactive Editor**: Modern UI using Bootstrap 5 with offcanvas panels for controls and information.
*   **IIIF Support**: Works with any high-resolution IIIF (International Image Interoperability Framework) image URL.
*   **Tour Creation & Management**:
    *   Define point sequences with customizable zoom levels, durations (transition/still), titles, and descriptions.
    *   Load existing tours from a `tours/manifest.json` file.
    *   Edit tour metadata (title, description) directly in the UI.
    *   View sequence points in a sortable table (planned: drag-and-drop reordering).
*   **Animation & Recording**:
    *   Preview animations in real-time.
    *   Record tours as WebM video files using CCapture.js.
    *   Configure quality, framerate, and aspect ratio.
    *   **Burn-in Overlays**: Optionally burn point titles and/or descriptions directly into the video frames with customizable font size, color, and family.
*   **Enhanced Playback Controls**:
    *   Progress bar showing animation progress.
    *   Persistent markers on the progress bar indicating point start times (with title/timestamp) and still period start times (pause icon).
*   **Subtitle Generation**: Export SRT subtitle files based on point timing and descriptions.
*   **JSON Editor**: View and edit the raw JSON for the current sequence.
*   **Keyboard Shortcuts**: Speed up point creation and editing.
*   **(Planned/Existing)** Headless Mode: Generate videos programmatically via command-line or API server.

## Getting Started

### Prerequisites

*   Modern web browser (Chrome, Firefox, Edge recommended)
*   Local web server for development (optional but recommended)

### Quick Start

1.  Clone or download the repository.
2.  Open `index.html` in your browser (ideally served by a local web server).
3.  Load a IIIF Image:
    *   Enter a IIIF Image `info.json` URL in the "Current Tour Information" section and click Apply.
    *   Or, select a pre-defined tour from the "Available Tours" section.
4.  Create Animation Points:
    *   `Ctrl` + `Click` on the image adds a point at the current view.
    *   Points appear in the sequence table (bottom panel).
5.  Edit Points & Sequence:
    *   Click a point marker on the image to select it.
    *   `Shift` + `Click` on a selected point marker to open the edit modal (set title, description, durations).
    *   (Planned) Drag points in the table (bottom panel) to reorder.
6.  Configure Settings (Left Panel):
    *   Adjust capture quality, framerate, aspect ratio.
    *   Configure burn-in overlay options and styles.
    *   Set default animation timings.
7.  Preview & Record (Top Panel):
    *   Click "Preview" to watch the animation.
    *   Click "Record" to generate and download a WebM video.
    *   Use the progress bar markers for navigation context.
8.  Export (Right Panel):
    *   Generate and download SRT subtitles.
    *   View/copy the sequence JSON.

## Usage Guide

### Interface Overview

*   **Viewer**: Main area displaying the IIIF image.
*   **Top Panel (Playback)**: Contains Preview/Record/Stop buttons and the enhanced progress bar.
*   **Left Panel (Settings)**: Accordion sections for Capture, Burn-in Overlays, Performance, and Animation settings.
*   **Right Panel (Info/Tours)**: Accordion sections for Current Tour Info (loading images/metadata), Available Tours (loading from manifest), JSON Editor, SRT Subtitles, and Keyboard Shortcuts.
*   **Bottom Panel (Sequence)**: Table display of sequence points (planned: editing/reordering).

### Tour Management

*   The application loads available tours from `tours/manifest.json`.
*   Each entry in the manifest points to a IIIF `info.json` URL and can contain pre-defined sequence points (`pointsOfInterest`).
*   You can load a base image via URL and build a sequence from scratch, or load an existing tour.

### Burn-in Overlays

*   Enable "Burn titles" and/or "Burn subtitles" in the Settings panel.
*   Customize font size, color, and family.
*   The text (using the `title` and `description` from sequence points) will be drawn onto the video frames during recording.
*   Subtitles have a maximum width and will wrap automatically.
*   Text is drawn with a semi-transparent, rounded background for readability.

## Technologies Used

*   OpenSeadragon (v4.1.0) for deep zoom image viewing
*   Tween.js (v21.0.0) for smooth animations
*   CCapture.js (v1.1.0) for client-side video capture
*   Bootstrap 5.3.3 for UI components and layout
*   Bootstrap Icons for iconography
*   IIIF Image API for high-resolution image support
*   (Planned/Existing) Puppeteer for headless video generation

## Browser Compatibility

*   Chrome 88+
*   Firefox 85+
*   Edge 88+
*   Safari 14+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

*   OpenSeadragon for the powerful deep zoom viewer
*   IIIF for the image interoperability framework
*   CCapture.js for the client-side video recording capabilities
*   Bootstrap contributors
*   The Rijksmuseum for providing high-quality IIIF images used in the example tours