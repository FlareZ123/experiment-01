'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent28-printed-opening-basics-v1';
const PROMO_SETS = {SMP: ['smp'], XYP: ['xyp']};
const EVOLUTION_STAGES = new Set(['Stage 1', 'Stage 2', 'VMAX', 'VSTAR', 'BREAK', 'MEGA']);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k) && k >= 0);
  if (k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); ++i) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/**
 * Probability of a failed seven-card Basic check, and of a solitary Basic in a
 * valid opening hand. A failed hand is shuffled back and sampled again.
 * All numerators/denominators are exact integers before display conversion.
 * @param {number} basicCount
 * @param {number} [deckSize]
 * @param {number} [handSize]
 */
function openingProbabilities(basicCount, deckSize = 60, handSize = 7) {
  assert.ok(Number.isSafeInteger(deckSize) && deckSize >= 1);
  assert.ok(Number.isSafeInteger(handSize) && handSize >= 1 && handSize <= deckSize);
  assert.ok(Number.isSafeInteger(basicCount) && basicCount > 0 && basicCount <= deckSize);
  const all = choose(deckSize, handSize);
  const zero = choose(deckSize - basicCount, handSize);
  const one = BigInt(basicCount) * choose(deckSize - basicCount, handSize - 1);
  const valid = all - zero;
  assert.ok(valid > 0n);
  const pMulligan = Number(zero) / Number(all);
  return {
    basicCount,
    allHands: all.toString(),
    initialMulliganHands: zero.toString(),
    exactlyOneBasicHands: one.toString(),
    validHands: valid.toString(),
    initialMulliganProbability: pMulligan,
    solitaryBasicGivenValidProbability: Number(one) / Number(valid),
    meanFailedHandsBeforeValid: Number(zero) / Number(valid)
  };
}

/** @param {string} actual @returns {string} */
function canonicalNumber(actual) {
  const match = /^(?:SM|XY)?0*([0-9]+[a-z]?)$/i.exec(actual);
  return match ? match[1] : actual;
}

/**
 * @param {{printing:{set:string,number:string},name:string}} card
 * @param {Map<string,string[]>} setsByCode
 * @param {(setId:string)=>object[]} loadSet
 * @returns {boolean}
 */
function isPrintedBasic(card, setsByCode, loadSet) {
  const ids = setsByCode.get(card.printing.set) ?? PROMO_SETS[card.printing.set];
  assert.ok(ids?.length, `Unknown set code ${card.printing.set}`);
  const matches = ids.flatMap(id => loadSet(id).filter(candidate =>
    candidate.supertype === 'Pokémon' &&
    candidate.name.replaceAll('♢', '◇') === card.name.replaceAll('♢', '◇') &&
    canonicalNumber(candidate.number) === canonicalNumber(card.printing.number)
  ));
  assert.ok(matches.length, `Printing unavailable: ${card.name} ${card.printing.set}-${card.printing.number}`);
  const types = [...new Set(matches.map(candidate => {
    const stages = candidate.subtypes ?? [];
    if (stages.includes('Basic')) return 'Basic';
    if (stages.some(s => EVOLUTION_STAGES.has(s))) return 'Evolution';
    throw new Error(`Unclassified printed stage: ${candidate.id}: ${stages.join(', ')}`);
  }))];
  assert.equal(types.length, 1, `Ambiguous stage: ${card.name} ${card.printing.set}-${card.printing.number}`);
  return types[0] === 'Basic';
}

/**
 * Derive source-field Basic counts from exact printed cards, never from species
 * names, candidate decks, or a pre-aggregated Pokémon count.
 * @param {object} manifest Archived full-decklists.json manifest.
 * @param {object[]} setMetadata Archived English sets list.
 * @param {(id:string)=>object[]} loadSet Lazy exact card-set reader.
 */
function census(manifest, setMetadata, loadSet) {
  assert.ok(Array.isArray(manifest.decks));
  const setsByCode = new Map();
  for (const set of setMetadata) {
    if (!set.ptcgoCode) continue;
    const ids = setsByCode.get(set.ptcgoCode) ?? [];
    ids.push(set.id);
    setsByCode.set(set.ptcgoCode, ids);
  }
  const stageCache = new Map();
  const ranks = new Set();
  const rows = manifest.decks.map(deck => {
    assert.ok(!ranks.has(deck.rank));
    ranks.add(deck.rank);
    assert.equal(deck.cards.reduce((sum, c) => sum + c.count, 0), 60,
      `Bad exact source size at rank ${deck.rank}`);
    let basics = 0;
    let evolutions = 0;
    for (const card of deck.cards) {
      if (card.category !== 'Pokémon') continue;
      const key = `${card.printing.set}-${card.printing.number}:${card.name}`;
      if (!stageCache.has(key)) stageCache.set(key, isPrintedBasic(card, setsByCode, loadSet));
      if (stageCache.get(key)) basics += card.count;
      else evolutions += card.count;
    }
    return {rank: deck.rank, player: deck.player, archetype: deck.archetype,
      pokemonCount: basics + evolutions, evolutionCount: evolutions,
      ...openingProbabilities(basics)};
  }).sort((a,b) => a.rank-b.rank);
  return {version: VERSION, published: rows.length,
    missing: manifest.missing_full_lists, printedPokemonValidated: stageCache.size,
    rows};
}

/** @param {string} root Repository root. */
function fromRepository(root) {
  const sets = JSON.parse(fs.readFileSync(path.join(root, 'resources/sets/en.json'), 'utf8'));
  const decks = JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const cache = new Map();
  const loadSet = id => {
    if (!cache.has(id)) {
      cache.set(id, JSON.parse(fs.readFileSync(
        path.join(root,'resources/cards/en',`${id}.json`), 'utf8')));
    }
    return cache.get(id);
  };
  return census(decks, sets, loadSet);
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(fromRepository(path.resolve(__dirname, '..')), null, 2)+'\n');
}

module.exports = {VERSION, choose, openingProbabilities, canonicalNumber, isPrintedBasic, census, fromRepository};
