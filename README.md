# Ken Burns Effect Creator
An interactive web application that allows you to create dynamic Ken Burns effect animations from high-resolution images. Perfect for creating engaging presentations, videos, and digital storytelling with smooth panning and zooming effects.

## Features
- **Interactive Editor**: Create, preview, and modify Ken Burns effects with an intuitive interface
- **High-Quality Output**: Export professional animations with adjustable quality and framerate
- **IIIF Support**: Works with high-resolution IIIF (International Image Interoperability Framework) images
- **Tour Creation**: Define point sequences with customizable zoom levels, durations, and transitions
- **Subtitle Generation**: Export SRT subtitle files to accompany your animations
- **Aspect Ratio Control**: Choose from standard aspect ratios or define custom dimensions
- **Quality Settings**: Optimize rendering quality based on your hardware capabilities
- **Headless Mode**: Generate videos programmatically via command-line or API server
- **Responsive Design**: Works across desktop and tablet devices
- **Export Options**: WebM video with configurable quality and framerate

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge recommended)
- Local web server for development (optional)

### Quick Start
1. Clone or download the repository
2. Open `index.html` in your browser
3. Use the default IIIF image or enter your own IIIF URL
4. Create animation points by clicking "Add Point" or using Ctrl+Click in the image
5. Customize durations, titles, and descriptions in the Table tab
6. Preview your animation using the "Preview" button
7. Record the final animation with "Start Recording"

## Usage Guide

### Basic Controls
- **Add Points**: Click "Add Point" button or use Ctrl+Click on the image
- **Edit Points**: Drag points to reposition, use Shift+Click+Mouse Wheel to adjust zoom levels
- **Sequence Management**: Use the Table tab to edit details and reorder points
- **Preview**: Click "Preview" to see how your animation will look
- **Record**: Click "Start Recording" to generate a WebM video file

### Tour Management
The application supports loading tour data from JSON files:
1. Tours are listed in the `tours/tours.json` file which contains metadata about each available tour
2. Actual tour data is stored in individual JSON files (e.g., `tours/SK-A-2099.json`)
3. Add new tours by creating a JSON file following the existing format and adding its entry to `tours.json`
4. Generate SRT subtitles for your tour using the "Generate SRT Subtitles" button in the Tours tab

### Advanced Features
- **Custom Aspect Ratios**: Define specific dimensions for your output video
- **Performance Settings**: Adjust quality settings based on your device capabilities
- **Custom Styles**: Modify the visualization of points, capture frames, and UI elements
- **Keyboard Shortcuts**: Speed up your workflow with keyboard shortcuts for common actions
- **Point Reordering**: Drag and drop to reorder animation points in the Table tab

## Headless Implementation
A headless implementation is available in the `headless` directory, allowing you to generate videos programmatically without requiring a browser UI:

### Command Line Usage
```bash
cd headless
npm install
node index.js --tour ../tours/SK-A-2099.json --output ./videos/asparagus.webm
```

### Additional Command Line Options
```bash
# Specify custom framerate
node index.js --tour ../tours/SK-A-2099.json --output ./videos/asparagus.webm --fps 30

# Set quality (1-100)
node index.js --tour ../tours/SK-A-2099.json --output ./videos/asparagus.webm --quality 85

# Custom aspect ratio
node index.js --tour ../tours/SK-A-2099.json --output ./videos/asparagus.webm --width 1920 --height 1080
```

### API Server
A simple API server is also provided for generating videos on demand:
```bash
cd headless
npm install
node server.js
```
This will start a server on port 3000 that you can use to generate videos via REST API calls.

#### API Endpoints
- `POST /generate-video`: Generate a video from a tour
  - Request body:
    ```json
    {
      "tourPath": "../tours/SK-A-2099.json",
      "outputPath": "./videos/output.webm",
      "fps": 30,
      "quality": 85,
      "width": 1920,
      "height": 1080
    }
    ```
  - Response: JSON with video URL and generation status

For more information, see the [Headless README](headless/README.md).

## Configuration Options

### Capture Settings
- **Quality**: Adjusts the export quality (1-100)
- **Framerate**: Sets the frames per second (FPS) for the output video
- **Aspect Ratio**: Choose from predefined ratios or create custom dimensions

### Performance Settings
- **Subpixel Rendering**: Enables higher quality rendering (may impact performance)
- **High Quality Animation**: Smoother transitions between points
- **Optimize Memory Usage**: Reduces memory consumption for large images
- **Render Quality**: Low, medium, or high settings for overall visual quality

## Examples
The project includes sample tours of "The Milkmaid" by Johannes Vermeer and "Still Life with Asparagus" by Adriaen Coorte, showcasing how to:
- Create effective point sequences
- Add informative titles and descriptions
- Generate appropriate durations for each segment

## Technologies Used
- OpenSeadragon (v4.1.0) for deep zoom image viewing
- Tween.js (v21.0.0) for smooth animations
- CCapture.js (v1.1.0) for video capture
- IIIF Image API for high-resolution image support
- Puppeteer for headless video generation

## Browser Compatibility
- Chrome 88+
- Firefox 85+
- Edge 88+
- Safari 14+

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- OpenSeadragon for the powerful deep zoom viewer
- IIIF for the image interoperability framework
- CCapture.js for the client-side video recording capabilities
- The Rijksmuseum for providing high-quality IIIF images used in the example tours