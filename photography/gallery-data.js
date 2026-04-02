/**
 * Photography categories + auto-discovery settings.
 * Your files are expected at:
 *   photography/<category>/1.jpg, 2.jpg, 3.jpg, ...
 * (No 0-padding; category folders: landscapes, people, motorvehicles)
 */

window.PHOTO_CATEGORIES = [
  { key: 'landscapes', title: 'Landscape' },
  { key: 'people', title: 'People' },
  { key: 'motorvehicles', title: 'Motor Vehicles' },
];

// Discovery starts at 1 and tries common extensions until we find images.
// Stops after a few consecutive missing files so the page doesn't loop forever.
window.PHOTO_DISCOVERY = {
  startIndex: 1,
  maxIndex: 80,
  consecutiveMissingStop: 6,
  exts: ['jpg', 'jpeg', 'png', 'webp'],
  // Per-attempt load timeout (ms)
  loadTimeoutMs: 900,
};
