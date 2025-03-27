// Tour selection UI

// Available tours list
let availableTours = [];

/**
 * Scan for available tours
 */
export async function scanAvailableTours() {
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

/**
 * Update tour selector UI
 */
export function updateTourSelector() {
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
        await window.KenBurns.tours.loadTour(tour.path);
        window.KenBurns.ui.updateTourInfo();
      } catch (error) {
        alert('Error loading tour: ' + error.message);
      }
    });
    
    tourSelector.appendChild(tourCard);
  });
  
  // Select the current tour if any
  const currentTour = window.KenBurns.tours.getCurrentTour();
  if (currentTour) {
    const currentTourCard = tourSelector.querySelector(`[data-tour-id="${currentTour.id}"]`);
    if (currentTourCard) {
      currentTourCard.classList.add('selected');
    }
  }
}

/**
 * Get available tours
 */
export function getAvailableTours() {
  return availableTours;
}
