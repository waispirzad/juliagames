// Bright, child-friendly color palette
const COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFEAA7', // yellow
  '#DDA0DD', // plum
  '#FF9FF3', // pink
  '#54A0FF', // blue
  '#5F27CD', // purple
  '#FF9F43', // orange
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBounce(t) {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
