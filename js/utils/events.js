// Event handling utilities

/**
 * Create and dispatch a custom event
 */
export function dispatchCustomEvent(eventName, detail = {}, target = document) {
  const event = new CustomEvent(eventName, { detail });
  target.dispatchEvent(event);
}

/**
 * Register a one-time event listener
 */
export function addOnceEventListener(element, eventName, callback) {
  const handler = (e) => {
    callback(e);
    element.removeEventListener(eventName, handler);
  };
  element.addEventListener(eventName, handler);
}

/**
 * Add multiple event listeners to an element
 */
export function addEventListeners(element, events) {
  Object.entries(events).forEach(([event, handler]) => {
    element.addEventListener(event, handler);
  });
  
  // Return function to remove all event listeners
  return () => {
    Object.entries(events).forEach(([event, handler]) => {
      element.removeEventListener(event, handler);
    });
  };
}
