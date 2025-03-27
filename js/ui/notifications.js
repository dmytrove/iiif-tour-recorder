// Notification system

// Create notification container if it doesn't exist
function ensureNotificationContainer() {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a notification message
 */
export function showNotification(message, type = 'info', duration = 3000) {
  const container = ensureNotificationContainer();
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.backgroundColor = getBackgroundColor(type);
  notification.style.color = '#fff';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '5px';
  notification.style.marginBottom = '10px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
  notification.style.transition = 'opacity 0.3s, transform 0.3s';
  notification.style.opacity = '0';
  notification.style.transform = 'translateX(50px)';
  
  // Set notification content
  notification.textContent = message;
  
  // Add close button
  const closeButton = document.createElement('span');
  closeButton.textContent = '×';
  closeButton.style.marginLeft = '10px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.float = 'right';
  closeButton.onclick = () => {
    removeNotification(notification);
  };
  
  notification.appendChild(closeButton);
  container.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(notification);
    }, duration);
  }
  
  return notification;
}

/**
 * Remove a notification
 */
function removeNotification(notification) {
  notification.style.opacity = '0';
  notification.style.transform = 'translateX(50px)';
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

/**
 * Get background color based on notification type
 */
function getBackgroundColor(type) {
  switch (type) {
    case 'success':
      return '#4CAF50';
    case 'error':
      return '#F44336';
    case 'warning':
      return '#FF9800';
    case 'info':
    default:
      return '#2196F3';
  }
}

/**
 * Clear all notifications
 */
export function clearNotifications() {
  const container = document.getElementById('notification-container');
  if (container) {
    container.innerHTML = '';
  }
}
