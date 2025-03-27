// Connections between points (lines)
import { createElement } from '../utils/dom.js';

/**
 * Create connecting line between two points
 */
export function createConnectionLine(sourcePoint, nextPoint, viewer) {
  const sourceViewportPoint = new OpenSeadragon.Point(sourcePoint.center.x, sourcePoint.center.y);
  const sourceContainerPoint = viewer.viewport.viewportToViewerElementCoordinates(sourceViewportPoint);
  
  const nextViewportPoint = new OpenSeadragon.Point(nextPoint.center.x, nextPoint.center.y);
  const nextContainerPoint = viewer.viewport.viewportToViewerElementCoordinates(nextViewportPoint);
  
  // Calculate distance and angle
  const dx = nextContainerPoint.x - sourceContainerPoint.x;
  const dy = nextContainerPoint.y - sourceContainerPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  
  const line = createElement('div', {
    className: 'point-line',
    style: `left: ${sourceContainerPoint.x}px; top: ${sourceContainerPoint.y}px; width: ${length}px; transform: rotate(${angle}rad);`
  });
  
  document.body.appendChild(line);
  
  return line;
}

/**
 * Update a connection line between points
 */
export function updateConnectionLine(line, sourcePoint, nextPoint, viewer) {
  if (!line) return;
  
  const sourceViewportPoint = new OpenSeadragon.Point(sourcePoint.center.x, sourcePoint.center.y);
  const sourceContainerPoint = viewer.viewport.viewportToViewerElementCoordinates(sourceViewportPoint);
  
  const nextViewportPoint = new OpenSeadragon.Point(nextPoint.center.x, nextPoint.center.y);
  const nextContainerPoint = viewer.viewport.viewportToViewerElementCoordinates(nextViewportPoint);
  
  // Calculate distance and angle
  const dx = nextContainerPoint.x - sourceContainerPoint.x;
  const dy = nextContainerPoint.y - sourceContainerPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  
  line.style.left = sourceContainerPoint.x + 'px';
  line.style.top = sourceContainerPoint.y + 'px';
  line.style.width = length + 'px';
  line.style.transform = `rotate(${angle}rad)`;
}
