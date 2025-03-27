// Tab navigation functionality

/**
 * Setup tab navigation
 */
export function setupTabs() {
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      // Deactivate all tabs and buttons
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Activate the selected tab and button
      document.getElementById(`${tabId}-tab`).classList.add('active');
      button.classList.add('active');
      
      // Special handling for tours tab
      if (tabId === 'tours') {
        window.KenBurns.ui.updateTourInfo();
      }
    });
  });
}

/**
 * Activate a specific tab
 */
export function activateTab(tabId) {
  // Deactivate all tabs and buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Activate the selected tab and button
  document.getElementById(`${tabId}-tab`).classList.add('active');
  document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
}

/**
 * Get the currently active tab ID
 */
export function getActiveTabId() {
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    return activeTab.id.replace('-tab', '');
  }
  return null;
}
