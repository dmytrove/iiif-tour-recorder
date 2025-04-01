// filepath: c:\tools\KB\ken-burns-effect\js\tours.js
// Tour data management and subtitle generation

// Current loaded tour data
let currentTour = null;
let availableTours = [];

// Function to initialize tour loading and selection
async function initialize() {
  const tourSelector = document.getElementById('tour-selector');
  if (!tourSelector) {
      console.error("Tour selector element not found.");
      return; // Don't proceed if selector isn't there
  }

  try {
    // Load the manifest of available tours
    const response = await fetch('tours/manifest.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    availableTours = await response.json();

    // Clear existing options
    tourSelector.innerHTML = ''; 

    // Populate the tour selector with cards
    availableTours.forEach((tour) => {
      const cardCol = document.createElement('div');
      cardCol.className = 'col'; // Bootstrap grid column

      const card = document.createElement('div');
      card.className = 'card h-100 text-white bg-secondary tour-card-selector'; // Use secondary bg, add custom class
      card.style.cursor = 'pointer';
      card.dataset.tourUrl = tour.url;
      
      let cardBodyContent;
      if(tour.thumbnail){
          cardBodyContent = `
            <img src="${tour.thumbnail}" class="card-img-top" alt="${tour.title || 'Tour thumbnail'}" style="height: 80px; object-fit: cover;">
            <div class="card-body p-2">
              <h6 class="card-title small mb-1 text-truncate" title="${tour.title || 'Untitled Tour'}">${tour.title || 'Untitled Tour'}</h6>
              <p class="card-text small text-muted text-truncate" title="${tour.id}">${tour.id}</p>
            </div>
          `;
      } else {
          // Fallback if no thumbnail
          cardBodyContent = `
            <div class="card-body p-2">
                <div class="placeholder-thumbnail bg-primary d-flex align-items-center justify-content-center" style="height: 80px;">
                    <i class="bi bi-image fs-3"></i>
                </div>
                <h6 class="card-title small mb-1 mt-2 text-truncate" title="${tour.title || 'Untitled Tour'}">${tour.title || 'Untitled Tour'}</h6>
                <p class="card-text small text-muted text-truncate" title="${tour.id}">${tour.id}</p>
            </div>
          `;
      }

      card.innerHTML = cardBodyContent;

      // Add click listener to load tour
      card.addEventListener('click', async () => {
          await loadTour(tour.url); // Load the tour data
          
          // Update selection appearance
          document.querySelectorAll('.tour-card-selector').forEach(c => c.classList.remove('border', 'border-info', 'border-3'));
          card.classList.add('border', 'border-info', 'border-3');
      });

      cardCol.appendChild(card);
      tourSelector.appendChild(cardCol);
    });

    // Load the default tour if specified and available
    const defaultTour = availableTours.find(t => t.default);
    if (defaultTour) {
      await loadTour(defaultTour.url);
      // Highlight default selection
      const defaultCard = tourSelector.querySelector(`[data-tour-url="${defaultTour.url}"]`);
      if (defaultCard) defaultCard.classList.add('border', 'border-info', 'border-3');
    } else if (availableTours.length > 0) {
        // Or load the first tour if no default
        await loadTour(availableTours[0].url);
        const firstCard = tourSelector.querySelector(`[data-tour-url="${availableTours[0].url}"]`);
        if (firstCard) firstCard.classList.add('border', 'border-info', 'border-3');
    }

  } catch (error) {
    console.error('Error loading tour manifest:', error);
    tourSelector.innerHTML = '<p class="text-danger">Could not load tour list.</p>';
    throw error; // Re-throw to be caught by script.js if needed
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
    tourCard.className = 'tour-card';
    tourCard.dataset.tourId = tour.id;
    tourCard.dataset.tourPath = tour.path;
    
    // Create thumbnail
    let thumbnailHTML = '';
    if (tour.thumbnail) {
      thumbnailHTML = `<img src="${tour.thumbnail}" alt="${tour.name}" class="tour-thumbnail">`;
    } else {
      thumbnailHTML = `<div class="tour-thumbnail placeholder">${tour.name[0]}</div>`;
    }
    
    // Create card content
    tourCard.innerHTML = `
      <div class="tour-thumbnail-container">
        ${thumbnailHTML}
      </div>
      <div class="tour-info">
        <h5>${tour.name}</h5>
        <p class="tour-id">${tour.id}</p>
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
      console.warn("Sequence module not found, setting tour data directly.");
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
      if (viewer && viewer.world) {
        window.KenBurns.visualization.updateVisualizations(viewer);
      }
    }

    // --- Trigger UI update for Current Tour Info ---
    if (window.KenBurns.ui && window.KenBurns.ui.updateTourInfo) {
        window.KenBurns.ui.updateTourInfo();
    }
    
    return currentTour;
  } catch (error) {
    console.error('Error loading tour:', error);
    if (window.KenBurns?.ui?.showToast) window.KenBurns.ui.showToast(`Error loading tour: ${error.message}`, "error");
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
    
    // Add entry to SRT content
    srtContent += `${index + 1}\n`;
    srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
    srtContent += `${point.description || ''}\n\n`;
  });
  
  return srtContent;
}

// Download SRT file
function downloadSRT() {
  const srtContent = generateSRT();
  const blob = new Blob([srtContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = currentTour ? `${currentTour.id}_subtitles.srt` : 'subtitles.srt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to update the current tour's metadata
function updateTourMetadata(newTitle, newDescription) {
    if (!currentTour) {
        console.error("Cannot update metadata: No tour loaded.");
        return false;
    }
    try {
        currentTour.title = newTitle;
        currentTour.description = newDescription;
        console.log("Tour metadata updated locally:", currentTour);
        // No need to re-save to file here, just update in memory
        // The updated info will be included if the user updates/exports JSON
        return true;
    } catch (error) {
        console.error("Error updating tour metadata:", error);
        return false;
    }
}

// Export functions
window.KenBurns = window.KenBurns || {};
window.KenBurns.tours = {
  initialize,
  loadTour,
  getCurrentTour,
  generateSRT,
  downloadSRT,
  updateTourMetadata
};