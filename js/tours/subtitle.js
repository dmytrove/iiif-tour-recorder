// SRT subtitle generation

/**
 * Generate SRT subtitles from sequence descriptions
 */
export function generateSRT() {
  const sequence = window.KenBurns.sequence.getSequence();
  let srtContent = '';
  let totalTime = 0;
  
  sequence.forEach((point, index) => {
    // Calculate start and end times
    const startTime = totalTime;
    // Sum transition and still durations
    const pointDuration = point.duration.transition + point.duration.still;
    totalTime += pointDuration;
    const endTime = totalTime;
    
    // Format times as SRT format (HH:MM:SS,mmm)
    const formatTime = (ms) => {
      const totalSec = Math.floor(ms / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      const milliseconds = ms % 1000;
      
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
    };
    
    // Add entry to SRT content
    srtContent += `${index + 1}\n`;
    srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
    srtContent += `${point.description || ''}\n\n`;
  });
  
  return srtContent;
}

/**
 * Download SRT file
 */
export function downloadSRT() {
  const currentTour = window.KenBurns.tours.getCurrentTour();
  const srtContent = generateSRT();
  const blob = new Blob([srtContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = currentTour ? `${currentTour.id}_subtitles.srt` : 'subtitles.srt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
