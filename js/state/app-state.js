// Central application state management

// Private state object
const state = {
  currentPoint: -1,
  sequence: [],
  capturing: false,
  previewMode: false,
  aspectRatio: '0',
  currentTour: null,
  viewer: null
};

// Subscribers to state changes
const subscribers = new Map();

/**
 * Get a value from the state
 */
export function getState(key) {
  return state[key];
}

/**
 * Set a value in the state
 */
export function setState(key, value) {
  const oldValue = state[key];
  state[key] = value;
  
  // Notify subscribers
  if (subscribers.has(key)) {
    subscribers.get(key).forEach(callback => {
      callback(value, oldValue);
    });
  }
}

/**
 * Subscribe to state changes
 */
export function subscribe(key, callback) {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  
  subscribers.get(key).add(callback);
  
  // Return unsubscribe function
  return () => {
    subscribers.get(key).delete(callback);
  };
}

/**
 * Initialize state with defaults
 */
export function initializeState(initialState = {}) {
  Object.entries(initialState).forEach(([key, value]) => {
    setState(key, value);
  });
}
