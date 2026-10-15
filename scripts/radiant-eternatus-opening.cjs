'use strict';

/**
 * Exact finite-hypergeometric opening access for the Aichi 2026 champion's
 * Radiant Eternatus -> 2 Shadow Rider Calyrex VMAX line.
 * Pure model: 7 opening cards, 6 Prizes, mandatory first-turn draw; no other
 * draw/search, mulligan bonus, policy changes or opponent interference.
 */
const GROUPS = Object.freeze([1, 5, 1, 4, 13, 36]);
const [ETERNATUS, SEARCH_ITEM, HEAVY_BALL, VMAX, OTHER_BASIC] = [0, 1, 2, 3, 4];

/** @returns {bigint[][]} Exact binomial coefficients for 0 <= n <= 60. */
function binomialTable() {
  const c = Array.from({ length: 61 }, () => Array(61).fill(0n));
  for (let n = 0; n <= 60; n++) {
    c[n][0] = 1n;
    c[n][n] = 1n;
    for (let k = 1; k < n; k++) c[n][k] = c[n - 1][k - 1] + c[n - 1][k];
  }
  return c;
}
const CHOOSE = binomialTable();

/**
 * Enumerate mutually exclusive category counts of an unordered hand.
 * @param {number[]} available Count of each category still eligible to draw.
 * @param {number} cards Number of cards to select.
 * @param {(counts:number[], multiplicity:bigint)=>void} emit Called for every legal category distribution.
 */
function select(available, cards, emit) {
  const current = Array(available.length).fill(0);
  function recurse(i, remaining, multiplicity) {
    if (i === available.length - 1) {
      if (remaining <= available[i]) {
        current[i] = remaining;
        emit(current.slice(), multiplicity * CHOOSE[available[i]][remaining]);
      }
      return;
    }
    const max = Math.min(available[i], remaining);
    for (let count = 0; count <= max; count++) {
      current[i] = count;
      recurse(i + 1, remaining - count, multiplicity * CHOOSE[available[i]][count]);
    }
  }
  recurse(0, cards, 1n);
}

/**
 * @param {number[]} opening The opening seven-card hand category counts.
 * @param {number[]} prizes The face-down Prize card counts.
 * @param {number[]} drawn The first-turn draw (all zeros in setup-only snapshot).
 * @returns {{route:string|null,twoVmax:boolean,forcedEternatusActive:boolean}}
 */
function classify(opening, prizes, drawn, groups = GROUPS) {
  const availableBasicStart = opening[ETERNATUS] + opening[OTHER_BASIC] > 0;
  const forcedEternatusActive = opening[ETERNATUS] === 1 && opening[OTHER_BASIC] === 0;
  if (!availableBasicStart) return { route: null, twoVmax: false, forcedEternatusActive };

  const cardsInHand = opening.map((v, i) => v + drawn[i]);
  const inDeck = groups.map((v, i) => v - cardsInHand[i] - prizes[i]);
  let route = null;
  if (opening[ETERNATUS] && opening[OTHER_BASIC]) route = 'opening-radiant';
  else if (drawn[ETERNATUS] && opening[OTHER_BASIC]) route = 'topdeck-radiant';
  else if (inDeck[ETERNATUS] && opening[OTHER_BASIC] && cardsInHand[SEARCH_ITEM]) route = 'search-item';
  else if (prizes[ETERNATUS] && opening[OTHER_BASIC] && cardsInHand[HEAVY_BALL]) route = 'heavy-ball';
  return { route, twoVmax: inDeck[VMAX] >= 2, forcedEternatusActive };
}

/**
 * @param {boolean} includeTurnDraw If true, includes the required first-turn draw (either seat).
 * @returns {{includeTurnDraw:boolean,validProbability:number,access:number,twoVmax:number,forcedActive:number,routes:Record<string,number>,twoVmaxRoutes:Record<string,number>,numerators:Record<string,string>,denominator:string}}
 */
function exactOpening(includeTurnDraw, groups = GROUPS) {
  if (groups.length !== 6 || groups.some((n) => !Number.isInteger(n) || n < 0) || groups.reduce((a, b) => a + b, 0) !== 60 || groups[ETERNATUS] !== 1 || groups[VMAX] < 2 || groups[OTHER_BASIC] < 1) throw new Error('Expected a 60-card list with 1 Radiant Eternatus, at least 2 VMAX, and at least 1 other Basic.');
  const tally = Object.create(null);
  const add = (key, v) => { tally[key] = (tally[key] || 0n) + v; };
  const emptyDraw = Array(GROUPS.length).fill(0);
  const denominator = CHOOSE[60][7] * CHOOSE[53][6] * (includeTurnDraw ? 47n : 1n);
  select(groups, 7, (opening, hWeight) => {
    const afterHand = groups.map((v, i) => v - opening[i]);
    select(afterHand, 6, (prizes, pWeight) => {
      const weight = hWeight * pWeight;
      const run = (drawn, amount) => {
        const w = weight * amount;
        const state = classify(opening, prizes, drawn, groups);
        if (opening[ETERNATUS] + opening[OTHER_BASIC] === 0) return;
        add('valid', w);
        if (state.forcedEternatusActive) add('forcedActive', w);
        if (prizes[ETERNATUS]) add('prizedEternatus', w);
        if (state.route) {
          add('access', w);
          add('route.' + state.route, w);
          if (state.twoVmax) {
            add('twoVmax', w);
            add('two.' + state.route, w);
          }
        }
      };
      if (!includeTurnDraw) {
        run(emptyDraw, 1n);
        return;
      }
      for (let i = 0; i < groups.length; i++) {
        const remains = groups[i] - opening[i] - prizes[i];
        if (!remains) continue;
        const draw = emptyDraw.slice();
        draw[i] = 1;
        run(draw, BigInt(remains));
      }
    });
  });
  const valid = tally.valid;
  const percent = (v) => Number(v || 0n) / Number(valid);
  const routes = {};
  const twoVmaxRoutes = {};
  for (const route of ['opening-radiant', 'topdeck-radiant', 'search-item', 'heavy-ball']) {
    routes[route] = percent(tally['route.' + route]);
    twoVmaxRoutes[route] = percent(tally['two.' + route]);
  }
  return {
    includeTurnDraw,
    validProbability: Number(valid) / Number(denominator),
    access: percent(tally.access),
    twoVmax: percent(tally.twoVmax),
    forcedActive: percent(tally.forcedActive),
    prizedEternatus: percent(tally.prizedEternatus),
    routes,
    twoVmaxRoutes,
    numerators: Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, v.toString()])),
    denominator: denominator.toString()
  };
}

if (require.main === module) console.log(JSON.stringify({ setupOnly: exactOpening(false), turnAfterDraw: exactOpening(true) }, null, 2));
module.exports = { classify, exactOpening, GROUPS };
