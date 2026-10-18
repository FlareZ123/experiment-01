'use strict';

const assert = require('node:assert/strict');
const variant = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const {choose} = require('./new-moon-lockbreak-access.cjs');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} a @param {bigint} b */
function rational(a, b) {
  assert.ok(a >= 0n && b > 0n);
  const divisor = gcd(a, b);
  return {
    numerator: String(a / divisor),
    denominator: String(b / divisor),
    probability: Number(a) / Number(b)
  };
}

/**
 * Count a direct Field Blower and an exclusive Secret Box -> unprized
 * Field Blower opportunity. The first eight cards are the legal starting
 * seven and first mandatory draw, with six Prizes dealt between them.
 * Exactly one eligible Basic in those eight is in the first seven with
 * probability 7/8. Prize locations are sampled uniformly from the other 52.
 * The result represents available cards, not an executable action policy.
 *
 * @param {number} basics Frozen deck's starting-eligible Basic Pokemon.
 * @param {number} blowers Number of Field Blower cards.
 * @param {number} boxes Number of Secret Box cards.
 */
function calculate(basics, blowers, boxes) {
  for (const n of [basics, blowers, boxes]) {
    assert.ok(Number.isInteger(n) && n >= 0);
  }
  assert.ok(basics > 0 && blowers <= 6 && basics + blowers + boxes <= 60);
  const other = 60 - basics - blowers - boxes;
  let validWeight = 0n;
  let directWeight = 0n;
  let boxOnlyWeight = 0n;
  for (let b = 0; b <= Math.min(basics, 8); b++) {
    const validFirstSevenPositions = b === 1 ? 7n : b >= 2 ? 8n : 0n;
    if (!validFirstSevenPositions) continue;
    for (let f = 0; f <= Math.min(blowers, 8 - b); f++) {
      for (let s = 0; s <= Math.min(boxes, 8 - b - f); s++) {
        const o = 8 - b - f - s;
        if (o > other) continue;
        const weight = validFirstSevenPositions *
          choose(basics, b) * choose(blowers, f) *
          choose(boxes, s) * choose(other, o);
        validWeight += weight;
        if (f > 0) directWeight += weight;
        else if (s > 0) boxOnlyWeight += weight;
      }
    }
  }

  const openingHands = choose(60, 7);
  const validOpeningHands = openingHands - choose(60 - basics, 7);
  const eightHands = choose(60, 8);
  assert.equal(validWeight * openingHands,
    8n * eightHands * validOpeningHands);

  const prizeAllocations = choose(52, 6);
  // Box needs a Blower still in the deck after six Prizes.
  // Since the exclusive case has no Blower in the first eight,
  // every Blower is among the remaining 52 cards before Prizing.
  const allBlowersPrized = choose(52 - blowers, 6 - blowers);
  const boxValidPrizeAllocations = prizeAllocations - allBlowersPrized;
  const denominator = 8n * eightHands * prizeAllocations * validOpeningHands;
  const normalizer = openingHands;
  const directNumerator = directWeight * prizeAllocations * normalizer;
  const boxNumerator = boxOnlyWeight * boxValidPrizeAllocations * normalizer;
  return {
    direct: rational(directNumerator, denominator),
    secretBoxOnly: rational(boxNumerator, denominator),
    directOrSecretBox: rational(directNumerator + boxNumerator, denominator),
    blowerUnprizedAfterBox: rational(boxValidPrizeAllocations, prizeAllocations)
  };
}

/** @returns {object} */
function main() {
  assert.equal(variant.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(variant.counts.total, 60);
  /** @param {string} name */
  const copies = name => variant.entries
    .filter(row => row.name_en === name)
    .reduce((sum, row) => sum + row.count, 0);
  // Dusclops is the only Evolution Pokemon in this particular source 60.
  const basics = variant.counts['Pokémon'] - copies('Dusclops');
  assert.equal(basics, 17);
  assert.equal(copies('Field Blower'), 2);
  assert.equal(copies('Secret Box'), 1);
  return {
    schema: 'new-moon-secret-box-field-blower-access-v1',
    candidateHash: variant.canonical_id_count_sha256,
    basics,
    scope: 'Legal opening seven, six unknown Prizes, first mandatory draw; no opponent mulligan bonus.',
    conditionalOpponentState: 'Opponent has Tool-equipped Garbodor; Items can be played.',
    result: calculate(basics, copies('Field Blower'), copies('Secret Box')),
    limitations: 'Three-card Secret Box discard opportunity costs, Item lock, alternate searches, timing, policy and opponent retooling are not evaluated. This is not a game-win estimate.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
}
module.exports = {calculate, main};
