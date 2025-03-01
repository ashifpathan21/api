const convertSecondsToDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const durationArray = [];
  if (hours > 0) {
    durationArray.push(`${hours}h`);
  }
  if (minutes > 0) {
    durationArray.push(`${minutes}m`);
  }
  if (secs > 0) {
    durationArray.push(`${secs}s`);
  }

  return durationArray.join(' ');
};

module.exports = {
  convertSecondsToDuration,
};