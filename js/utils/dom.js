// DOM manipulation utilities

/**
 * Create an element with attributes and properties
 */
export function createElement(tag, attributes = {}, properties = {}) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  // Set properties
  Object.entries(properties).forEach(([key, value]) => {
    element[key] = value;
  });
  
  return element;
}

/**
 * Remove all child nodes from an element
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Find element by selector or return null
 */
export function getElement(selector) {
  return document.querySelector(selector);
}

/**
 * Get all elements matching a selector
 */
export function getElements(selector) {
  return document.querySelectorAll(selector);
}
