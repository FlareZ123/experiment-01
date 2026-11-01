'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent11-rank10-last-bench-opening-bound-v1';
const PROFILE = Object.freeze({
  deckSize: 60,
  rank10Basics: 15,
  rank10RegidragoV: 4,
  rank10DedenneGX: 1,
  rank6IronThornsBasics: 4,
  openingSize: 7,
  prizeCount: 6
});
const BASIC_RANK10 = new Set([
  'Regidrago V:SIT:135',
  'Budew:ASC:16',
  'Dialga-GX:UPR:100',
  'Koraidon ex:TEF:120',
  'Kyurem:SFA:47',
  'Dedenne-GX:UNB:57',
  'Squawkabilly ex:PAL:169',
  'Tapu Lele-GX:GRI:60',
  'Latias ex:SSP:76',
  'Marshadow:UNB:81',
  'Wobbuffet:PHF:36'
]);
const NON_BASIC_RANK10 = new Set([
  'Regidrago VSTAR:SIT:136',
  'Dragapult ex:TWM:130',
  'Hisuian Goodra VSTAR:LOR:136'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || k < 0 || k > n)
    return 0n;
  const m = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= m; i++)
    result = result * BigInt(n - m + i) / BigInt(i);
  return result;
}

/**
 * Guard against changes to either authenticated source printing inventory.
 * All 15 other rank-10 Pokémon are Basic in the supplied printing database.
 * @param {{decks:object[]}} corpus
 * @returns {typeof PROFILE}
 */
function assertSourceProfile(corpus) {
  const rank10 = corpus.decks.find(x => x.rank === 10);
  const rank6 = corpus.decks.find(x => x.rank === 6);
  assert.ok(rank10 && rank6, 'Missing authenticated original ranks');
  for (const deck of [rank10, rank6])
    assert.equal(deck.cards.reduce((sum, c) => sum + c.count, 0), 60);
  const pokemon = rank10.cards.filter(c => c.category === 'Pokémon');
  const nonbasic = pokemon.filter(c => NON_BASIC_RANK10.has(
    c.name + ':' + c.printing.set + ':' + c.printing.number));
  assert.deepEqual(nonbasic.map(c => c.count).sort((a, b) => a-b), [1,1,3]);
  for (const c of pokemon) {
    const key = c.name + ':' + c.printing.set + ':' + c.printing.number;
    assert.ok(BASIC_RANK10.has(key) || NON_BASIC_RANK10.has(key),
      'Unclassified rank-10 Pokémon printing: ' + key);
  }
  assert.equal(pokemon.reduce((sum,c) => sum+c.count,0), 20);
  assert.equal(20 - nonbasic.reduce((sum,c) => sum+c.count,0),
    PROFILE.rank10Basics);
  assert.equal(rank10.cards.filter(c => c.name === 'Regidrago V' &&
    c.printing.set === 'SIT' && c.printing.number === '135')
    .reduce((sum,c) => sum+c.count,0), PROFILE.rank10RegidragoV);
  assert.equal(rank10.cards.filter(c => c.name === 'Dedenne-GX' &&
    c.printing.set === 'UNB' && c.printing.number === '57')
    .reduce((sum,c) => sum+c.count,0), PROFILE.rank10DedenneGX);
  assert.equal(rank6.cards.filter(c => c.category === 'Pokémon')
    .reduce((sum,c) => sum+c.count,0), PROFILE.rank6IronThornsBasics);
  assert.ok(rank6.cards.filter(c => c.category === 'Pokémon')
    .every(c => c.name === 'Iron Thorns ex' && c.printing.set === 'TWM' &&
      c.printing.number === '77'));
  return PROFILE;
}

/** @param {bigint} a @param {bigint} b @returns {number} */
const fraction = (a,b) => Number(a) / Number(b);

/**
 * Sample n distinct physical rank-10 cards. Require held Dedenne-GX,
 * at least one held Regidrago V, and at least minBasics total Basics.
 * One Dedenne, four Regidrago V, ten other Basics and 45 nonbasics.
 * @param {number} n Number of observed physical cards
 * @param {number} minBasics 2 for co-holding or 7 for five further Basics
 * @param {boolean} firstSevenAllNonbasic
 * @returns {number}
 */
function cardEvent(n, minBasics, firstSevenAllNonbasic=false) {
  assert.ok(Number.isSafeInteger(n) && n >= 7 && n <= 60);
  assert.ok(minBasics === 2 || minBasics === 7);
  const extra = n - 7;
  let numerator = 0n;
  const otherNonbasic = firstSevenAllNonbasic ? 38 : 45;
  const sample = firstSevenAllNonbasic ? extra : n;
  for (let r = 1; r <= 4; r++) {
    for (let o = 0; o <= 10; o++) {
      if (1 + r + o < minBasics) continue;
      numerator += choose(4,r) * choose(10,o) *
        choose(otherNonbasic, sample - 1 - r - o);
    }
  }
  return fraction(numerator, choose(firstSevenAllNonbasic ? 53 : 60, sample));
}

/**
 * Probability conditional on the rank-10 player's starting seven containing
 * at least one Basic. Bonus draws and a later ordinary draw are marginally
 * uniformly random from the unseen 53 cards, despite six unknown Prizes.
 * @param {number} n Observed card count (7 + bonus + ordinary draws)
 * @param {number} minBasics
 * @returns {number}
 */
function conditionalEvent(n, minBasics) {
  const invalidOpening = fraction(choose(45,7), choose(60,7));
  const unconditional = cardEvent(n, minBasics);
  const invalidAndEvent = invalidOpening * cardEvent(n, minBasics, true);
  return (unconditional - invalidAndEvent) / (1 - invalidOpening);
}

/**
 * Account for both players mulliganing simultaneously. When both starting
 * hands fail, both redraw and no bonus is awarded. When rank 10 fails alone,
 * rank 6's valid start yields zero bonus to rank 10. Only after rank 10 has
 * a valid start do continued rank-6 failed sevens earn bonus draws.
 * @param {number} bonus Number of rank-10 optional bonus cards
 * @returns {number}
 */
function bonusProbability(bonus) {
  assert.ok(Number.isSafeInteger(bonus) && bonus >= 0);
  const p10 = 1 - fraction(choose(45,7), choose(60,7));
  const p6 = 1 - fraction(choose(56,7), choose(60,7));
  const q6 = 1 - p6;
  const normalization = 1 - (1 - p10) * q6;
  return bonus === 0 ? p6 / normalization :
    p10 * p6 * q6 ** bonus / normalization;
}

/**
 * Pre-search, natural-card location envelope. Maximum voluntary bonus draws;
 * no Item, Supporter, Ability draw/search, Prize-taking or Bench actions.
 * Its 7-Basic event is necessary, not sufficient, for the specific scenario
 * of Dedenne and one Regidrago V still held while five other Basics occupy
 * the Active plus four Bench positions.
 * @param {0|1} normalDraws Ordinary draws after setup
 * @returns {object}
 */
function openingEnvelope(normalDraws = 0) {
  assert.ok(normalDraws === 0 || normalDraws === 1);
  const p10 = 1 - fraction(choose(45,7), choose(60,7));
  const q6 = fraction(choose(56,7), choose(60,7));
  const normalization = 1 - (1 - p10) * q6;
  const maxBonus = 47 - normalDraws;
  let coheld = 0;
  let sevenBasics = 0;
  for (let bonus = 0; bonus <= maxBonus; bonus++) {
    const probability = bonusProbability(bonus);
    const totalSeen = 7 + bonus + normalDraws;
    coheld += probability * conditionalEvent(totalSeen,2);
    sevenBasics += probability * conditionalEvent(totalSeen,7);
  }
  const unresolvedExcessMulliganMass = p10 * q6 ** (maxBonus + 1) /
    normalization;
  return {
    version: VERSION,
    ordinaryDraws: normalDraws,
    openingValidProbability: p10,
    rank6InvalidOpeningProbability: q6,
    zeroBonusProbability: bonusProbability(0),
    coheldProbabilityLower: coheld,
    sevenBasicsProbabilityLower: sevenBasics,
    residualMassUpper: unresolvedExcessMulliganMass,
    coheldProbabilityUpper: coheld + unresolvedExcessMulliganMass,
    sevenBasicsProbabilityUpper: sevenBasics + unresolvedExcessMulliganMass,
    fullBenchNecessaryNotSufficient: true,
    paperCompetitiveWinInference: false
  };
}

/** @returns {object} */
function loadAndCheckSource() {
  const file = path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json');
  const source = JSON.parse(fs.readFileSync(file, 'utf8'));
  assertSourceProfile(source);
  return source;
}

module.exports = {
  VERSION, PROFILE, choose, assertSourceProfile, cardEvent,
  conditionalEvent, bonusProbability, openingEnvelope, loadAndCheckSource
};
