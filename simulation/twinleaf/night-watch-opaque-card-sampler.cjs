'use strict';
/** Uniform positions from an opaque card array; reads no card properties. */
function sampleOpaque(cards, count, random = Math.random) {
  if (!Array.isArray(cards) || !Number.isSafeInteger(count) || count < 0 || count > cards.length) throw new RangeError('sample bounds');
  const positions = cards.map((_, i) => i);
  const chosen = [];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (positions.length - i));
    [positions[i], positions[j]] = [positions[j], positions[i]];
    chosen.push(cards[positions[i]]);
  }
  return chosen;
}
module.exports = {sampleOpaque};
