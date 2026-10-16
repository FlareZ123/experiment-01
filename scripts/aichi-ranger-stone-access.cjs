'use strict';

const fs = require('node:fs');
const path = require('node:path');

const BASIC_NAMES = new Set([
  'Shadow Rider Calyrex V', "Lillie's Clefairy ex", 'Tapu Lele-GX',
  'Trevenant & Dusknoir-GX', 'Latias ex', 'Dialga-GX', 'Mimikyu',
  'Girafarig', 'Marshadow', 'Radiant Eternatus', 'Wobbuffet'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let r = 1n;
  for (let j = 1; j <= Math.min(k, n - k); j += 1) {
    r = (r * BigInt(n - j + 1)) / BigInt(j);
  }
  return r;
}

/**
 * Enumerate physical subsets by category, retaining integer multiplicity.
 * @param {number[]} available
 * @param {number} take
 * @param {(counts:number[],multiplicity:bigint)=>void} emit
 */
function select(available, take, emit) {
  const a = Array(available.length).fill(0);
  function walk(i, left, weight) {
    if (i === available.length) {
      if (left === 0) emit(a.slice(), weight);
      return;
    }
    for (let c = 0; c <= Math.min(available[i], left); c += 1) {
      a[i] = c;
      walk(i + 1, left - c, weight * choose(available[i], c));
    }
  }
  walk(0, take, 1n);
}

/**
 * Disjoint categories: Lele, Shadow Rider V, Ranger, Forest Seal Stone,
 * other Basics, other cards. Exactly one Ranger, seven starting cards,
 * and a single unseen-Prize selection before later normal draws.
 *
 * A seen Lele requires a legal hand-to-Bench entry; a seen Stone requires
 * a V that could occupy play. No other search or use of the Supporter is
 * modeled, and Stone and Wonder Tag are treated as independently usable.
 * @param {{size:number,basics:number,lele:number,shadowV:number,ranger:number,stone:number}} profile
 * @param {{draws?:number,opening?:number,prizes?:number}} [options]
 */
function rangerStoneAccess(profile, options = {}) {
  const {size, basics, lele, shadowV, ranger, stone} = profile;
  const {draws = 2, opening = 7, prizes = 6} = options;
  if (![size, basics, lele, shadowV, ranger, stone, draws, opening, prizes]
    .every(Number.isInteger) || size < 1 || ranger !== 1 || stone < 0 ||
    lele < 0 || shadowV < 0 || basics < lele + shadowV ||
    opening < 1 || draws < 0 || prizes < 0 ||
    opening + draws + prizes > size || basics + ranger + stone > size) {
    throw new Error('Invalid source composition or draw/Prize window');
  }
  const categories = [lele, shadowV, ranger, stone,
    basics - lele - shadowV, size - basics - ranger - stone];
  const U = BigInt(size - opening - draws);
  const deckFraction = U - BigInt(prizes);
  const keys = ['direct', 'wonderOnly', 'stoneOnly', 'bothSearch', 'either', 'withoutWonder'];
  const n = Object.fromEntries(keys.map(k => [k, 0n]));
  let denominator = 0n;
  select(categories, opening, (first, wFirst) => {
    const [startLele, startV, , , startOtherBasic] = first;
    if (startLele + startV + startOtherBasic === 0) return;
    const rem = categories.map((c, i) => c - first[i]);
    select(rem, draws, (later, wLater) => {
      const w = wFirst * wLater;
      const [seenLele, seenV, seenRanger, seenStone] =
        first.map((c, i) => c + later[i]);
      const direct = seenRanger > 0;
      const wonder = seenLele > 0 &&
        (startV + startOtherBasic > 0 || startLele >= 2 || startLele === 0);
      const star = seenStone > 0 && seenV > 0;
      const scaled = w * U;
      const searchable = w * deckFraction;
      denominator += scaled;
      if (direct) n.direct += scaled;
      else if (wonder && star) n.bothSearch += searchable;
      else if (wonder) n.wonderOnly += searchable;
      else if (star) n.stoneOnly += searchable;
      if (direct || wonder || star) n.either += direct ? scaled : searchable;
      if (direct || star) n.withoutWonder += direct ? scaled : searchable;
    });
  });
  if (denominator === 0n) throw new Error('No legal initial Basic Pokémon');
  const rates = Object.fromEntries(keys.map(k => [k, Number(n[k]) / Number(denominator)]));
  return {rates, numerators:Object.fromEntries(keys.map(k => [k, n[k].toString()])),
    denominator:denominator.toString()};
}

/** @param {{cards:Array<{name:string,category:string,count:number}>}} deck */
function sourceProfile(deck) {
  const count = name => deck.cards.filter(c => c.name === name)
    .reduce((n, c) => n + c.count, 0);
  const sum = pred => deck.cards.filter(pred).reduce((n, c) => n + c.count, 0);
  const size = sum(() => true);
  const basics = sum(c => c.category === 'Pokémon' && BASIC_NAMES.has(c.name));
  const evolutions = count('Shadow Rider Calyrex VMAX');
  const pokemon = sum(c => c.category === 'Pokémon');
  if (size !== 60 || basics + evolutions !== pokemon ||
    count('Forest Seal Stone') !== 1 || count('Shadow Rider Calyrex V') < 1 ||
    !deck.cards.every(c => Number.isInteger(c.count) && c.count > 0)) {
    throw new Error('Source inventory drift or unsupported Pokémon stages');
  }
  return {size, basics, lele:count('Tapu Lele-GX'),
    shadowV:count('Shadow Rider Calyrex V'), ranger:count('Pokémon Ranger'),
    stone:count('Forest Seal Stone')};
}

/** @returns {object[]} */
function report() {
  const dir = path.resolve(__dirname, '../results/aichi-2026');
  const field = JSON.parse(fs.readFileSync(path.join(dir,'full-decklists.json'),'utf8'));
  const decks = [
    ['champion', field.decks.find(d => d.rank === 1)],
    ['hood', JSON.parse(fs.readFileSync(path.join(dir,'candidate-hood-shadow-rider.json'),'utf8'))],
    ['temple', JSON.parse(fs.readFileSync(path.join(dir,'candidate-temple-shadow-rider.json'),'utf8'))]
  ];
  return decks.map(([name,deck]) => {
    const p = sourceProfile(deck);
    return {name, profile:p, windows:p.ranger === 1 ? [0,1,2].map(draws =>
      ({draws, ...rangerStoneAccess(p,{draws})})) : []};
  });
}

if (require.main === module) console.log(JSON.stringify(report(),null,2));
module.exports = {choose, select, rangerStoneAccess, sourceProfile, report};
