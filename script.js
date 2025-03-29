// Initialize app features
import './js/main.js';

document.addEventListener('DOMContentLoaded', function() {
  // Handle drag and drop for tour files
  const dropzone = document.querySelector('body');
  
  dropzone.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    // Add visual feedback for drag operation
    document.body.classList.add('drag-active');
  });
  
  dropzone.addEventListener('dragleave', function(e) {
    document.body.classList.remove('drag-active');
  });
  
  dropzone.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove('drag-active');
    
    if (window.KenBurns && window.KenBurns.viewer) {
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            const jsonData = JSON.parse(event.target.result);
            
            // Check if this is a valid tour file
            if (jsonData.id && jsonData.title && jsonData.tiles && Array.isArray(jsonData.pointsOfInterest)) {
              console.log('Dropped valid tour file:', jsonData.title);
              
              // Load the tour via the tours module
              if (window.KenBurns.tours && typeof window.KenBurns.tours.loadTourFromData === 'function') {
                window.KenBurns.tours.loadTourFromData(jsonData)
                  .then(() => {
                    console.log('Tour loaded successfully');
                    // Update UI
                    if (window.KenBurns.ui && typeof window.KenBurns.ui.updateTourInfo === 'function') {
                      window.KenBurns.ui.updateTourInfo();
                    }
                    // Show notification if available
                    if (window.KenBurns.ui && window.KenBurns.ui.notifications && 
                        typeof window.KenBurns.ui.notifications.showNotification === 'function') {
                      window.KenBurns.ui.notifications.showNotification('Tour loaded successfully', 'success');
                    }
                  })
                  .catch(error => {
                    console.error('Error loading tour:', error);
                    // Show error notification if available
                    if (window.KenBurns.ui && window.KenBurns.ui.notifications && 
                        typeof window.KenBurns.ui.notifications.showNotification === 'function') {
                      window.KenBurns.ui.notifications.showNotification('Error loading tour: ' + error.message, 'error');
                    }
                  });
              } else {
                console.error('Tours module not available or missing loadTourFromData function');
              }
            } else {
              console.error('Invalid tour file format:', jsonData);
              // Show error notification if available
              if (window.KenBurns.ui && window.KenBurns.ui.notifications && 
                  typeof window.KenBurns.ui.notifications.showNotification === 'function') {
                window.KenBurns.ui.notifications.showNotification('Invalid tour file format', 'error');
              }
            }
          } catch (error) {
            console.error('Error parsing dropped file:', error);
            // Show error notification if available
            if (window.KenBurns.ui && window.KenBurns.ui.notifications && 
                typeof window.KenBurns.ui.notifications.showNotification === 'function') {
              window.KenBurns.ui.notifications.showNotification('Error parsing file: ' + error.message, 'error');
            }
          }
        };
        reader.readAsText(file);
      } else {
        console.error('Dropped file is not a JSON file');
        // Show error notification if available
        if (window.KenBurns.ui && window.KenBurns.ui.notifications && 
            typeof window.KenBurns.ui.notifications.showNotification === 'function') {
          window.KenBurns.ui.notifications.showNotification('Please drop a JSON tour file', 'error');
        }
      }
    }
  });
  
  // Add CSS for drag and drop visual feedback
  const style = document.createElement('style');
  style.textContent = `
    body.drag-active::after {
      content: "Drop tour file here";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      z-index: 9999;
    }
  `;
  document.head.appendChild(style);
});