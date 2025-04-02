# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - YYYY-MM-DD

### Added
- Modern Bootstrap 5 UI with offcanvas panels for controls, tour info, and sequence table.
- Dark theme applied consistently across UI elements.
- Burn-in Overlays: Option to burn sequence point titles and/or subtitles directly into recorded video frames.
  - Customizable font size, color, and family for overlays.
  - Text wrapping for burned-in subtitles.
  - Rounded, semi-transparent background for burned-in text for better readability.
- Enhanced Progress Bar:
  - Persistent markers below the bar indicating start of transitions (with point title/timestamp).
  - Persistent pause icons below the bar indicating start of still periods.
  - Persistent time labels (MM:SS) above the bar aligned with transition markers.
- SRT Subtitles section in UI: Generate SRT content and display in a textarea, with a separate download button.
- Keyboard Shortcuts section moved to its own accordion in the info panel.
- Tour Info editing capabilities in the UI (Title, Description).
- Basic Software Architecture Document (`ARCHITECTURE.md`).

### Changed
- Refactored UI structure from tabs/modals to primarily use Bootstrap offcanvas components.
- Reorganized Settings panel into multiple accordion sections (Capture, Burn-in, Performance, Animation) with improved single-column layout.
- Refactored SRT generation logic to update textarea instead of direct download.
- Updated JavaScript modules (`ui.js`, `capture.js`, `tours.js`, etc.) to support the new UI and features.
- Improved animation timing logic in `capture.js` to prevent flickering of burned-in text.
- Updated tour loading to use `tours/manifest.json`.
- Switched from custom checkboxes to Bootstrap switches.
- Updated `README.md` to reflect new UI and features.

### Fixed
- Numerous UI styling issues related to text visibility (labels, accordion buttons, accordion content) in the dark theme.
- JavaScript errors related to incorrect button IDs after UI refactoring.
- JavaScript errors related to Bootstrap offcanvas initialization.
- JavaScript error in `resetUIAfterDownload` function using incorrect button IDs.
- Corrected function call for starting animation frame loop in `capture.js`.
- Fixed styling for JSON editor (`textarea`, muted text).
- Fixed text color issues in the right-hand info panel accordions.
- Removed conflicting/obsolete CSS rules.

### Removed
- Old tab-based UI structure and associated CSS/JS.
- Obsolete JavaScript modules (e.g., `js/ui/tabs.js`, `js/ui/modal.js`).
- Obsolete CSS related to previous UI and custom checkboxes. 