'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SOURCE = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
const RANKS = [8, 11, 16];
const BASIC_POKEMON = new Set([
  'Trubbish', 'Mega Absol ex', 'Tapu Koko ♢', 'Dedenne-GX',
  'Crobat V', 'Squawkabilly ex', 'Tapu Lele-GX', 'Budew',
  'Oranguru V', 'Latias ex'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) {
    return 0n;
  }
  const length = Math.min(k, n - k);
  let result = 1n;
  for (let j = 1; j <= length; j++) {
    result = result * BigInt(n - length + j) / BigInt(j);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/**
 * Exact legal-opening-7-conditional direct lock resource probability.
 * First eight seen cards: opening seven plus first own draw (position 14).
 * Six unknown Prizes: independent random six-subset of other 52 cards.
 * @param {{trubbish:number,boostShake:number,tools:number,garbotoxin:number,otherBasics:number}} counts
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function exactDirectLock(counts) {
  const {trubbish, boostShake, tools, garbotoxin, otherBasics} = counts;
  const last = 60 - trubbish - boostShake - tools - garbotoxin - otherBasics;
  assert.ok([trubbish, boostShake, tools, garbotoxin, otherBasics, last]
    .every(x => Number.isInteger(x) && x >= 0));
  const prizeDenominator = choose(52, 6);
  let numeratorSum = 0n;
  for (let t = 1; t <= Math.min(8, trubbish); t++) {
    for (let b = 1; b <= Math.min(8 - t, boostShake); b++) {
      for (let u = 1; u <= Math.min(8 - t - b, tools); u++) {
        for (let g = 0; g <= Math.min(8 - t - b - u, garbotoxin); g++) {
          for (let o = 0; o <= Math.min(8 - t - b - u - g, otherBasics); o++) {
            const x = 8 - t - b - u - g - o;
            if (x < 0 || x > last || g >= garbotoxin) continue;
            const basicsAmongEight = t + o;
            const validOpeningOfEight = basicsAmongEight === 1 ? 7n : 8n;
            const unprizedGarbotoxin = garbotoxin - g;
            const sourcePileAvailableWays = prizeDenominator -
              choose(52 - unprizedGarbotoxin, 6 - unprizedGarbotoxin);
            const multiplicity = choose(trubbish, t) *
              choose(boostShake, b) * choose(tools, u) *
              choose(garbotoxin, g) * choose(otherBasics, o) *
              choose(last, x);
            numeratorSum += multiplicity * validOpeningOfEight * sourcePileAvailableWays;
          }
        }
      }
    }
  }
  const basicCount = trubbish + otherBasics;
  const acceptedSeven = choose(60, 7) - choose(60 - basicCount, 7);
  const numerator = numeratorSum * choose(60, 7);
  const denominator = 8n * choose(60, 8) * prizeDenominator * acceptedSeven;
  const factor = gcd(numerator, denominator);
  return {
    numerator: String(numerator / factor),
    denominator: String(denominator / factor),
    probability: Number(numerator) / Number(denominator)
  };
}

/** @param {object[]} cards @param {string} name @returns {number} */
function count(cards, name) {
  return cards.reduce((sum, card) => sum + (card.name === name ? card.count : 0), 0);
}

/**
 * Positive printed-stage and card-name whitelist for exactly the three
 * registered source lists; source edits must be reviewed before updating.
 * @param {object} deck Full source-manifest entry.
 * @returns {object}
 */
function sourceCounts(deck) {
  assert.equal(deck.cards.reduce((sum, row) => sum + row.count, 0), 60);
  for (const row of deck.cards.filter(card => card.category === 'Pokémon')) {
    assert.ok(row.name === 'Garbodor' || BASIC_POKEMON.has(row.name),
      'Unreviewed source Pokémon Stage: ' + row.name);
    if (row.name === 'Garbodor') {
      assert.ok((row.printing.set === 'LTR' && row.printing.number === '68') ||
        (row.printing.set === 'BKP' && row.printing.number === '57'),
        'Unreviewed Garbotoxin printing');
    }
  }
  for (const [name, set, number] of [
    ['Boost Shake', 'EVS', '142'], ['Float Stone', 'BKT', '137'],
    ['Muscle Band', 'XY', '121'], ['Forest Seal Stone', 'SIT', '156']
  ]) {
    for (const row of deck.cards.filter(c => c.name === name)) {
      assert.equal(row.printing.set, set);
      assert.equal(row.printing.number, number);
    }
  }
  const trubbish = count(deck.cards, 'Trubbish');
  const totalBasics = deck.cards.filter(c => c.category === 'Pokémon' &&
    BASIC_POKEMON.has(c.name)).reduce((sum, c) => sum + c.count, 0);
  return {
    trubbish,
    boostShake: count(deck.cards, 'Boost Shake'),
    nonStoneTools: count(deck.cards, 'Float Stone') + count(deck.cards, 'Muscle Band'),
    stones: count(deck.cards, 'Forest Seal Stone'),
    garbotoxin: count(deck.cards, 'Garbodor'),
    otherBasics: totalBasics - trubbish
  };
}

/** @returns {object} */
function main() {
  const manifest = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const expected = {
    8: ['54091677403/3353695676760', '1881968169/101627141720'],
    11: ['797280257/32270533152', '1354685947/39971455836'],
    16: ['35689156879/1172496037856', '10242120731/293124009464']
  };
  const results = RANKS.map(rank => {
    const deck = manifest.decks.find(d => d.rank === rank);
    assert.ok(deck, 'Source missing rank ' + rank);
    const raw = sourceCounts(deck);
    const common = {
      trubbish: raw.trubbish, boostShake: raw.boostShake,
      garbotoxin: raw.garbotoxin, otherBasics: raw.otherBasics
    };
    const noStone = exactDirectLock({...common, tools: raw.nonStoneTools});
    const includingStone = exactDirectLock({
      ...common, tools: raw.nonStoneTools + raw.stones
    });
    assert.equal(noStone.numerator + '/' + noStone.denominator, expected[rank][0]);
    assert.equal(includingStone.numerator + '/' + includingStone.denominator, expected[rank][1]);
    assert.ok(includingStone.probability >= noStone.probability);
    return {
      rank, player: deck.player, sourceCounts: raw,
      printed60Sha256: crypto.createHash('sha256')
        .update(JSON.stringify(deck.cards)).digest('hex'),
      withoutForestSealStone: noStone,
      withForestSealStone: includingStone
    };
  });
  return {
    kind: 'aichi-first-turn-direct-garbotoxin-window-v1',
    conditionalOn: 'legal opening seven containing at least one Basic Pokémon',
    sourceOrder: 'opening seven -> six unknown Prizes -> first own draw',
    sourceFirstOnly: true,
    sourceFullDecklistCount: manifest.decks.length,
    evidence: 'exact combinatorial resource window; neither played policy nor win probability',
    results
  };
}

if (require.main === module) console.log(JSON.stringify(main(), null, 2));
module.exports = {choose, gcd, exactDirectLock, sourceCounts, main};
