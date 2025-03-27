// Title and subtitle captions

/**
 * Update title callout and subtitle for current point
 */
export function updateTitleCalloutAndSubtitle(index, sequence) {
  if (index < 0 || index >= sequence.length) {
    clearTitleCalloutAndSubtitle();
    return;
  }
  
  const point = sequence[index];
  const showCallouts = document.getElementById('show-callouts').checked;
  const showSubtitles = document.getElementById('show-subtitles').checked;
  
  // Update title callout if it has a title
  if (point.title && showCallouts) {
    const titleCallout = document.getElementById('title-callout');
    titleCallout.textContent = point.title;
    titleCallout.style.display = 'block';
  } else {
    document.getElementById('title-callout').style.display = 'none';
  }
  
  // Update subtitle if it has a description
  if (point.description && showSubtitles) {
    const subtitleDisplay = document.getElementById('subtitle-display');
    subtitleDisplay.textContent = point.description;
    subtitleDisplay.style.display = 'block';
  } else {
    document.getElementById('subtitle-display').style.display = 'none';
  }
}

/**
 * Clear title callout and subtitle
 */
export function clearTitleCalloutAndSubtitle() {
  document.getElementById('title-callout').style.display = 'none';
  document.getElementById('subtitle-display').style.display = 'none';
}
