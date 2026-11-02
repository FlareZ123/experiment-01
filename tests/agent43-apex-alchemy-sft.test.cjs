'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifest = require('../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json');
const sets = require('../resources/sets/en.json');
const printings = new Map(sets.map((set) => [set.id, set.ptcgoCode || set.name]));
const { openingEightAccess } = require('../simulation/evaluation/agent43-muk-search-eight-bound.cjs');
const allCardSets = new Map();

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) r = r * (n - i + 1) / i;
  return Math.round(r);
}

/** @param {string} id @returns {object} */
function cardById(id) {
  const setId = id.slice(0, id.lastIndexOf('-'));
  if (!allCardSets.has(setId)) {
    allCardSets.set(setId, require(path.join(root, 'resources', 'cards', 'en', setId + '.json')));
  }
  const card = allCardSets.get(setId).find((entry) => entry.id === id);
  assert.ok(card, 'Missing printed card: ' + id);
  return card;
}

/**
 * Exact random-deal opportunity before searching or bonus draws:
 * first 7, ordinary first draw, all 6 Prizes, Grimer and Shake in 8
 * with at least one Alolan Muk available in the remaining deck.
 * @param {number} grimer
 * @param {number} shake
 * @param {number} muk
 * @returns {number}
 */
function directFirstTurnOpportunity(grimer, shake, muk) {
  const other = 60 - grimer - shake - muk;
  let probability = 0;
  for (let a = 0; a <= grimer; a += 1) {
    for (let b = 0; b <= shake; b += 1) {
      for (let c = 0; c <= muk; c += 1) {
        const d = 7 - a - b - c;
        if (d < 0 || d > other) continue;
        const p7 = choose(grimer, a) * choose(shake, b) * choose(muk, c)
          * choose(other, d) / choose(60, 7);
        const remaining = [grimer - a, shake - b, muk - c, other - d];
        for (let index = 0; index < 4; index += 1) {
          const n = remaining[index];
          if (n === 0) continue;
          const seen = [a, b, c, d];
          seen[index] += 1;
          if (seen[0] === 0 || seen[1] === 0) continue;
          const mukStillInDeck = muk - seen[2];
          if (mukStillInDeck === 0) continue;
          const allSurvivingMukPrized =
            choose(52 - mukStillInDeck, 6 - mukStillInDeck) / choose(52, 6);
          probability += p7 * n / 53 * (1 - allSurvivingMukPrized);
        }
      }
    }
  }
  return probability;
}

const totals = { 'Pokémon': 0, Trainer: 0, Energy: 0 };
const names = new Map();
let basics = 0;
let aceSpecCopies = 0;

for (const row of manifest.cards) {
  const card = cardById(row.cardId);
  const setId = row.cardId.slice(0, row.cardId.lastIndexOf('-'));
  assert.equal(row.category, card.supertype, row.cardId + ': supertype');
  assert.equal(row.name, card.name, row.cardId + ': printed name');
  assert.equal(row.printing.set, printings.get(setId), row.cardId + ': printed set');
  assert.equal(row.printing.number, card.number, row.cardId + ': printed number');
  assert.equal(card.legalities.expanded, 'Legal', row.cardId + ': English Expanded flag');
  assert.equal(row.printing.language, 'en');
  assert.ok(Number.isInteger(row.count) && row.count >= 1 && row.count <= 4);
  totals[row.category] += row.count;
  names.set(row.name, (names.get(row.name) || 0) + row.count);
  if (row.category === 'Pokémon' && card.subtypes.includes('Basic')) basics += row.count;
  if (card.subtypes.includes('ACE SPEC')) aceSpecCopies += row.count;
}

assert.deepEqual(totals, { 'Pokémon': 20, Trainer: 30, Energy: 10 });
assert.deepEqual(totals, manifest.category_counts);
assert.equal(Object.values(totals).reduce((a, b) => a + b), 60);
assert.equal(manifest.total_cards, 60);
for (const [name, quantity] of names) {
  if (!name.startsWith('Basic ') || !name.endsWith(' Energy')) {
    assert.ok(quantity <= 4, name + ': exceeds four-card maximum');
  }
}
assert.equal(aceSpecCopies, 1);
assert.equal(basics, 12);
const canonical = manifest.cards.map((row) => row.cardId + ':' + row.count + '\n').sort().join('');
const fingerprint = crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
assert.equal(fingerprint, manifest.deck_identity_sha256);

assert.match(cardById('sm1-58').abilities[0].text, /Each Basic Pokémon.*has no Abilities/);
assert.match(cardById('swsh7-142').rules[0], /during your first turn/);
assert.match(cardById('swsh7-142').rules[0], /Your turn ends/);
assert.match(cardById('swsh12-136').attacks[0].text, /attack from a Dragon Pokémon in your discard pile/);
assert.match(cardById('sv6-77').abilities[0].text, /Pokémon with a Rule Box in play/);

const mulligan = choose(60 - basics, 7) / choose(60, 7);
const direct = directFirstTurnOpportunity(2, 3, 2);
const access = openingEightAccess();
const conditional = access.directAmongBasicValid;
assert.ok(Math.abs(direct - access.directUnconditional) < 1e-12);
assert.ok(Math.abs(access.basicValidInitialSeven - (1 - mulligan)) < 1e-12);
const bothMukPrized = choose(58, 4) / choose(60, 6);
const allVstarPrized = choose(57, 3) / choose(60, 6);
assert.ok(Math.abs(mulligan - 0.1906466927107365) < 1e-12);
assert.ok(Math.abs(direct - 0.07759162886050825) < 1e-12);
assert.ok(Math.abs(conditional - 0.0926277443382764) < 1e-12);
assert.ok(Math.abs(access.searchAssistedUnconditional - 0.24007559091372999) < 1e-12);
assert.ok(Math.abs(access.searchAssistedAmongBasicValid - 0.23089801437797755) < 1e-12);
assert.ok(Math.abs(bothMukPrized - 0.00847457627118644) < 1e-12);
assert.ok(Math.abs(allVstarPrized - 0.0005844535359438924) < 1e-12);

console.log(JSON.stringify({
  status: 'PASS',
  printedCards: 60,
  distinctNames: names.size,
  categories: totals,
  deckIdentity: fingerprint,
  BasicPokemonCount: basics,
  mulliganPercent: 100 * mulligan,
  directFirstTurnGrimerBoostMukPercent: 100 * direct,
  conditionalOnBasicValidFirstSevenPercent: 100 * conditional,
  idealizedSearchAssistedFirstEightPercent: 100 * access.searchAssistedUnconditional,
  idealizedSearchAssistedBasicValidPercent: 100 * access.searchAssistedAmongBasicValid,
  bothMukInSixPrizePercent: 100 * bothMukPrized,
  allThreeVSTARInSixPrizePercent: 100 * allVstarPrized,
  evidenceCategory: 'printed-card database and exact combinatorics; idealized search assumes playable Items and acceptable discards; zero native games'
}, null, 2));
