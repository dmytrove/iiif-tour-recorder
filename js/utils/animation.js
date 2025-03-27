// Animation utilities

/**
 * Ease-in-out function
 */
export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Ease-in function
 */
export function easeInQuad(t) {
  return t * t;
}

/**
 * Ease-out function
 */
export function easeOutQuad(t) {
  return t * (2 - t);
}

/**
 * Create a smoothly animated value change
 */
export function animateValue(start, end, duration, onUpdate, onComplete, easing = easeInOutQuad) {
  const startTime = performance.now();
  
  function update(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    const value = start + (end - start) * easedProgress;
    
    onUpdate(value);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (onComplete) onComplete();
    }
  }
  
  requestAnimationFrame(update);
}

/**
 * Create an animation timeline with multiple keyframes
 */
export function createTimeline(keyframes, onUpdate, onComplete) {
  let currentFrame = 0;
  
  function playNextFrame() {
    if (currentFrame >= keyframes.length - 1) {
      if (onComplete) onComplete();
      return;
    }
    
    const current = keyframes[currentFrame];
    const next = keyframes[currentFrame + 1];
    
    animateValue(
      current.value,
      next.value,
      next.time - current.time,
      (value) => onUpdate(value, currentFrame),
      () => {
        currentFrame++;
        playNextFrame();
      },
      current.easing || easeInOutQuad
    );
  }
  
  playNextFrame();
}
