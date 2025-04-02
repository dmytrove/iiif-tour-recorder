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

// Function to generate SRT content from the current tour
function generateSRT() {
  if (!currentTour || !currentTour.pointsOfInterest) {
    console.error("Cannot generate SRT: No tour or points loaded.");
    return null; // Return null or empty string to indicate failure
  }

  let srtContent = "";
  let sequenceNumber = 1;
  let currentTimeMs = 0;
  const defaultTransition = parseInt(document.getElementById('default-transition-duration')?.value || 1500);
  const defaultStill = parseInt(document.getElementById('default-still-duration')?.value || 1500);

  // Sort points by order just in case
  const sortedPoints = [...currentTour.pointsOfInterest].sort((a, b) => a.order - b.order);

  sortedPoints.forEach((point) => {
    const transitionMs = point.duration?.transition ?? defaultTransition;
    const stillMs = point.duration?.still ?? defaultStill;
    
    // Time when the subtitle should appear (after transition)
    const startTimeMs = currentTimeMs + transitionMs;
    // Time when the subtitle should disappear (after transition + still)
    const endTimeMs = startTimeMs + stillMs;

    // Only add subtitle if there's a description and still duration > 0
    if (point.description && stillMs > 0) {
        srtContent += sequenceNumber + "\n";
        srtContent += formatSrtTime(startTimeMs) + " --> " + formatSrtTime(endTimeMs) + "\n";
        srtContent += point.description.trim() + "\n\n";
        sequenceNumber++;
    }
    
    // Update current time for the next point
    currentTimeMs += transitionMs + stillMs;
  });

  return srtContent;
}

// Function to download the generated SRT content
function downloadSRT(srtContent) {
    if (!srtContent || srtContent.trim() === "") {
        window.KenBurns.ui.showToast("No SRT content generated to download.", "warning");
        return;
    }

    const filename = `${currentTour?.id || 'tour'}_subtitles.srt`;
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });

    try {
        if (window.saveAs) {
            window.saveAs(blob, filename);
            window.KenBurns.ui.showToast("SRT file download started.", "success");
        } else {
            console.error("FileSaver.js not found.");
            window.KenBurns.ui.showToast("Download failed: FileSaver not found.", "error");
        }
    } catch (error) {
        console.error("Error triggering SRT download:", error);
        window.KenBurns.ui.showToast("Download error. See console.", "error");
    }
}

// Helper function to format milliseconds into SRT time format (HH:MM:SS,ms)
function formatSrtTime(totalMilliseconds) {
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const milliseconds = Math.floor(totalMilliseconds % 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    const pad = (num, size = 2) => num.toString().padStart(size, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
}

// Event Listeners (Should be set up in ui.js or script.js ideally)
// Placeholder here - Move to ui.js setupEventListeners if possible
function setupSrtButtonListeners() {
    const generateBtn = document.getElementById('generate-srt');
    const downloadBtn = document.getElementById('download-srt');
    const outputArea = document.getElementById('srt-output');

    if (generateBtn && downloadBtn && outputArea) {
        generateBtn.addEventListener('click', () => {
            const srtText = generateSRT();
            if (srtText !== null) {
                outputArea.value = srtText;
                downloadBtn.disabled = srtText.trim() === ""; // Enable download if content exists
                if (!downloadBtn.disabled) {
                   window.KenBurns.ui.showToast("SRT content generated.", "info");
                }
            } else {
                outputArea.value = "Failed to generate SRT. Check console.";
                downloadBtn.disabled = true;
            }
        });

        downloadBtn.addEventListener('click', () => {
            downloadSRT(outputArea.value);
        });
    }
}

// Call setup function (Ideally called from main script/DOMContentLoaded)
// setupSrtButtonListeners(); 

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
  updateTourMetadata,
  setupSrtButtonListeners
};