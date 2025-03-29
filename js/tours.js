// filepath: c:\tools\KB\ken-burns-effect\js\tours.js
// Tour data management and subtitle generation

// Current loaded tour data
let currentTour = null;
let availableTours = [];

// Initialize by loading available tours
async function initialize() {
  try {
    // Scan tours directory for available tours first
    await scanAvailableTours();
    
    // Load default tour (SK-A-2099.json)
    await loadTour('tours/SK-A-2099.json');
    
    return true;
  } catch (error) {
    console.error('Failed to initialize tours:', error);
    return false;
  }
}

// Scan for available tours
async function scanAvailableTours() {
  try {
    // Load the tours list from tours.json
    const response = await fetch('tours/tours.json');
    if (!response.ok) {
      throw new Error(`Failed to load tours list: ${response.status} ${response.statusText}`);
    }
    
    const tours = await response.json();
    availableTours = tours;
    
    // Create tour selection dropdown
    updateTourSelector();
    
    return tours;
  } catch (error) {
    console.error('Error loading tours list:', error);
    // Fallback to hardcoded list
    availableTours = [
      { id: 'SK-A-2099', name: 'Still Life with Asparagus', path: 'tours/SK-A-2099.json' },
      { id: 'SK-A-2344', name: 'The Milkmaid', path: 'tours/SK-A-2344.json' }
    ];
    updateTourSelector();
    return availableTours;
  }
}

// Update tour selector UI
function updateTourSelector() {
  const tourSelector = document.getElementById('tour-selector');
  if (!tourSelector) return;
  
  // Clear existing options
  tourSelector.innerHTML = '';
  
  // Create cards for each tour
  availableTours.forEach(tour => {
    const tourCard = document.createElement('div');
    tourCard.className = 'card tour-card mb-3';
    tourCard.dataset.tourId = tour.id;
    tourCard.dataset.tourPath = tour.path;
    
    // Create card image using Bootstrap card-img-top
    let cardImageHTML = '';
    if (tour.thumbnail) {
      cardImageHTML = `<img src="${tour.thumbnail}" alt="${tour.name}" class="card-img-top">`;
    } else {
      cardImageHTML = `<div class="card-img-top placeholder text-center py-5 bg-secondary text-light">${tour.name[0]}</div>`;
    }
    
    // Create card body with title and text
    tourCard.innerHTML = `
      ${cardImageHTML}
      <div class="card-body">
        <h5 class="card-title">${tour.name}</h5>
        <p class="card-text">${tour.id}</p>
      </div>
    `;
    
    // Add click event to load the tour
    tourCard.addEventListener('click', async () => {
      // Mark this card as selected
      document.querySelectorAll('.tour-card').forEach(card => {
        card.classList.remove('selected');
      });
      tourCard.classList.add('selected');
      
      // Load the tour
      try {
        await loadTour(tour.path);
        updateTourInfo();
      } catch (error) {
        alert('Error loading tour: ' + error.message);
      }
    });
    
    tourSelector.appendChild(tourCard);
  });
  
  // Select the current tour if any
  if (currentTour) {
    const currentTourCard = tourSelector.querySelector(`[data-tour-id="${currentTour.id}"]`);
    if (currentTourCard) {
      currentTourCard.classList.add('selected');
    }
  }
}

// Load a tour from the given path
async function loadTour(tourPath) {
  try {
    const response = await fetch(tourPath);
    if (!response.ok) {
      throw new Error(`Failed to load tour: ${response.status} ${response.statusText}`);
    }
    
    const tourData = await response.json();
    
    // Validate and set the tour info
    if (window.KenBurns && window.KenBurns.sequence) {
      currentTour = window.KenBurns.sequence.setTourInfo(tourData);
    } else {
      currentTour = tourData;
    }
    
    // Update IIIF URL if provided in tour
    if (tourData.tiles) {
      document.getElementById('iiif-url').value = tourData.tiles;
      // Load the image if viewer is initialized
      if (window.KenBurns && window.KenBurns.viewer) {
        const viewer = window.KenBurns.viewer.getViewer();
        if (viewer) {
          window.KenBurns.viewer.loadNewImage(tourData.tiles);
        }
      }
    }
    
    // Update table and JSON if available
    if (window.KenBurns.table) {
      window.KenBurns.table.updateTable();
      window.KenBurns.table.updateJsonFromSequence();
    }
    
    // Update visualizations if viewer is ready
    if (window.KenBurns.viewer && window.KenBurns.visualization) {
      const viewer = window.KenBurns.viewer.getViewer();
      if (viewer) {
        window.KenBurns.visualization.updateVisualizations(viewer);
      }
    }
    
    return currentTour;
  } catch (error) {
    console.error('Error loading tour:', error);
    throw error;
  }
}

// Get the current tour data
function getCurrentTour() {
  // If sequence module is available, use its getTourInfo function to ensure latest data
  if (window.KenBurns && window.KenBurns.sequence) {
    return window.KenBurns.sequence.getTourInfo();
  }
  return currentTour;
}

// Generate SRT subtitles from sequence descriptions
function generateSRT() {
  const sequence = window.KenBurns.sequence.getSequence();
  let srtContent = '';
  let totalTime = 0;
  
  sequence.forEach((point, index) => {
    // Calculate start and end times
    const startTime = totalTime;
    totalTime += point.duration;
    const endTime = totalTime;
    
    // Format times as SRT format (HH:MM:SS,mmm)
    const formatTime = (ms) => {
      const totalSec = Math.floor(ms / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      const milliseconds = ms % 1000;
      
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
    };
    
    // Format the subtitle
    const subtitle = `${index + 1}\n${formatTime(startTime)} --> ${formatTime(endTime)}\n${point.description}`;
    
    // Append to the SRT content
    srtContent += subtitle + '\n\n';
  });
  
  return srtContent;
}

// At the end of the file, add the tours export
window.KenBurns = window.KenBurns || {};
window.KenBurns.tours = {
  initialize,
  scanAvailableTours,
  loadTour,
  getCurrentTour,
  generateSRT
};