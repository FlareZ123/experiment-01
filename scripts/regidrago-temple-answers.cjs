'use strict';

const manifest = require('../results/aichi-2026/full-decklists.json');
const openingAudit = require('../results/aichi-2026/opening-hand-audit.json');

const STADIUMS = new Set(['Parallel City', 'Path to the Peak', 'Sky Field', 'Silent Lab']);
const REMOVAL_ITEMS = new Set(['Megaton Blower', 'Field Blower', 'Lost Vacuum']);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    value = (value * BigInt(n - i + 1)) / BigInt(i);
  }
  return value;
}

/**
 * Exact sampling without replacement: an initially valid hand of 'opening'
 * cards, followed by one normal draw. 'out' is a directly playable
 * Stadium/removal Trainer. Marshadow is usable if it is drawn eighth, or
 * appeared in the opening hand alongside a different Basic starter.
 *
 * Discards, Supporter restrictions, existing locks, hand actions and
 * opponent bonus draws are excluded, deliberately.
 *
 * @param {{size?:number,opening?:number,basics:number,outs:number,marshadow?:number}} input
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function exactOpeningResponse(input) {
  const {size = 60, opening = 7, basics, outs, marshadow = 0} = input;
  if (![size,opening,basics,outs,marshadow].every(Number.isInteger) ||
      size <= opening || opening <= 0 || basics < 1 || marshadow < 0 ||
      marshadow > basics || outs < 0 || basics + outs > size) {
    throw new RangeError('Invalid disjoint deck category counts.');
  }
  const otherBasics = basics - marshadow;
  const other = size - basics - outs;
  const categories = [outs, marshadow, otherBasics, other];
  let valid = 0n;
  let denominator = 0n;
  let numerator = 0n;
  for (let u = 0; u <= Math.min(opening, outs); u++) {
    for (let m = 0; m <= Math.min(opening - u, marshadow); m++) {
      for (let b = 0; b <= Math.min(opening - u - m, otherBasics); b++) {
        const n = opening - u - m - b;
        if (n < 0 || n > other || m + b === 0) continue;
        const combinations = choose(outs,u) * choose(marshadow,m) *
          choose(otherBasics,b) * choose(other,n);
        valid += combinations;
        const alreadyUsable = u > 0 || (m > 0 && b > 0);
        const observed = [u,m,b,n];
        for (let next = 0; next < categories.length; next++) {
          const remaining = categories[next] - observed[next];
          if (remaining <= 0) continue;
          const weight = combinations * BigInt(remaining);
          denominator += weight;
          if (alreadyUsable || next === 0 || next === 1) numerator += weight;
        }
      }
    }
  }
  const expectedValid = choose(size,opening) - choose(size-basics,opening);
  if (valid !== expectedValid || denominator !== valid * BigInt(size-opening)) {
    throw new Error('Exact combinatorial partition invariant violated.');
  }
  return {
    numerator: numerator.toString(),
    denominator: denominator.toString(),
    probability: Number(numerator) / Number(denominator)
  };
}

/**
 * @returns {{assumptions:string,rows:object[],meanWithoutFaba:number,meanWithFaba:number}}
 */
function regidragoTempleResponses() {
  const decks = manifest.decks.filter(deck => deck.archetype === 'Regidrago');
  const rows = decks.map(deck => {
    const audit = openingAudit.decks.find(row => row.rank === deck.rank);
    if (!audit || audit.basic_count_known < 1 || audit.unresolved_pokemon.length) {
      throw new Error('Unresolved basic count for rank ' + deck.rank);
    }
    const count = predicate => deck.cards.reduce((n,card) =>
      n + (predicate(card) ? card.count : 0), 0);
    const stadiums = count(card => STADIUMS.has(card.name));
    const removalItems = count(card => REMOVAL_ITEMS.has(card.name));
    const faba = count(card => card.name === 'Faba');
    const marshadow = count(card => card.name === 'Marshadow' &&
      card.printing.set === 'UNB' && String(card.printing.number) === '81');
    const basics = audit.basic_count_known;
    const response = (outs, m = 0) =>
      exactOpeningResponse({basics,outs,marshadow:m}).probability;
    return {
      rank: deck.rank, basics, stadiums, removalItems, faba, marshadow,
      stadiumOnly: response(stadiums),
      stadiumOrItem: response(stadiums + removalItems),
      includingBenchMarshadow: response(stadiums + removalItems, marshadow),
      includingFabaSupporter: response(stadiums + removalItems + faba,marshadow)
    };
  });
  rows.sort((a,b) => a.rank - b.rank);
  return {
    assumptions: 'Uniform valid opening seven and mandatory eighth draw; response presence conditional on Temple in play. Source-printed direct counters only. Usable Marshadow requires Bench access; Supporter-enabled figure assumes Faba may be played. No search, prize recovery, opponent bonuses, blocking effects, discards, turn-action contention or match wins.',
    rows,
    meanWithoutFaba: rows.reduce((sum,row) => sum + row.includingBenchMarshadow,0)/rows.length,
    meanWithFaba: rows.reduce((sum,row) => sum + row.includingFabaSupporter,0)/rows.length
  };
}

if (require.main === module) console.log(JSON.stringify(regidragoTempleResponses(),null,2));
module.exports = {choose,exactOpeningResponse,regidragoTempleResponses};
