'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {rangerEarlyAccess, sourceComposition, report} =
  require('../scripts/aichi-ranger-early-access.cjs');

/** Independent exhaustive physical-card enumeration. */
function* combinations(items, count, start = 0, chosen = []) {
  if (chosen.length === count) {
    yield chosen.slice();
    return;
  }
  for (let i = start; i <= items.length - (count - chosen.length); i += 1) {
    chosen.push(items[i]);
    yield* combinations(items, count, i + 1, chosen);
    chosen.pop();
  }
}

function brute(input) {
  const {size, basics, lele, ranger, opening, draws, prizes} = input;
  const cards = [
    ...Array(lele).fill('L'), ...Array(ranger).fill('R'),
    ...Array(basics - lele).fill('B'),
    ...Array(size - basics - ranger).fill('X')
  ].map((type, index) => ({type, index}));
  let valid = 0;
  let direct = 0;
  let wonder = 0;
  for (const start of combinations(cards, opening)) {
    if (!start.some(card => card.type === 'L' || card.type === 'B')) continue;
    const used = new Set(start.map(card => card.index));
    const unseen = cards.filter(card => !used.has(card.index));
    for (const ordinaryDraws of combinations(unseen, draws)) {
      const drawn = new Set(ordinaryDraws.map(card => card.index));
      const afterDraw = unseen.filter(card => !drawn.has(card.index));
      const seen = [...start, ...ordinaryDraws];
      const heldRanger = seen.some(card => card.type === 'R');
      const startingLele = start.filter(card => card.type === 'L').length;
      const laterLele = ordinaryDraws.some(card => card.type === 'L');
      const otherBasic = start.some(card => card.type === 'B');
      const benchLele = seen.some(card => card.type === 'L') &&
        (otherBasic || startingLele >= 2 || laterLele);
      for (const prize of combinations(afterDraw, prizes)) {
        valid += 1;
        if (heldRanger) direct += 1;
        else if (benchLele && afterDraw.some(card =>
          card.type === 'R' && !prize.includes(card))) wonder += 1;
      }
    }
  }
  return {direct: direct / valid, wonderTag: wonder / valid,
    either: (direct + wonder) / valid};
}

