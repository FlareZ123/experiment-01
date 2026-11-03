'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function combinations(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k) && k >= 0);
  if (k > n) return 0n;
  const r = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= r; i += 1) {
    value = value * BigInt(n - r + i) / BigInt(i);
  }
  return value;
}

/**
 * Exact event that exactly one fixed 60 has a Basic in an opening sample,
 * under one uniformly selected common set of card positions. This is an
 * idealized pre-mulligan coupling, not a native Twinleaf deal guarantee.
 * @param {boolean[]} left
 * @param {boolean[]} right
 * @param {number} [handSize]
 * @returns {object}
 */
function auditBasicOpeningAsymmetry(left, right, handSize = 7) {
  assert.ok(Array.isArray(left) && Array.isArray(right));
  assert.equal(left.length, right.length);
  assert.ok(left.length >= 1 && left.every(x => typeof x === 'boolean'));
  assert.ok(right.every(x => typeof x === 'boolean'));
  assert.ok(Number.isSafeInteger(handSize) && handSize >= 1 &&
    handSize <= left.length);

  let bothBasic = 0, leftOnlyBasic = 0, rightOnlyBasic = 0, neitherBasic = 0;
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] && right[i]) bothBasic += 1;
    else if (left[i]) leftOnlyBasic += 1;
    else if (right[i]) rightOnlyBasic += 1;
    else neitherBasic += 1;
  }
  const leftBasics = bothBasic + leftOnlyBasic;
  const rightBasics = bothBasic + rightOnlyBasic;
  const denominator = combinations(left.length, handSize);
  const leftMulligans = combinations(left.length - leftBasics, handSize);
  const rightMulligans = combinations(left.length - rightBasics, handSize);
  const simultaneousMulligans = combinations(neitherBasic, handSize);
  const discordant = leftMulligans + rightMulligans -
    2n * simultaneousMulligans;
  assert.ok(discordant >= 0n && discordant <= denominator);
  return {
    schema: 'agent44-idealized-common-position-basic-opening-v1',
    totalCards: left.length,
    handSize,
    bothBasic, leftOnlyBasic, rightOnlyBasic, neitherBasic,
    leftBasics, rightBasics,
    denominator: denominator.toString(),
    leftMulliganNumerator: leftMulligans.toString(),
    rightMulliganNumerator: rightMulligans.toString(),
    simultaneousMulliganNumerator: simultaneousMulligans.toString(),
    discordantMulliganNumerator: discordant.toString(),
    discordantMulliganProbability: Number(discordant) / Number(denominator),
    comparableWithoutOpeningAsymmetryProbability:
      1 - Number(discordant) / Number(denominator)
  };
}

/**
 * Generate an ordered Basic mask using only a card's checked database stage.
 * Each input is a resolved English-proxy card ID/count entry; no unknown
 * printings or stages are silently interpreted as non-Basic.
 * @param {{id:string|null,count:number,nonPokemon?:boolean}[]} rows
 * @param {string} repoRoot
 * @returns {boolean[]}
 */
function maskForResolvedCards(rows, repoRoot) {
  const masks = [];
  const cache = new Map();
  for (const row of rows) {
    assert.ok(Number.isSafeInteger(row.count) && row.count >= 1);
    if (row.nonPokemon === true) {
      assert.equal(row.id, null);
      for (let i = 0; i < row.count; i += 1) masks.push(false);
      continue;
    }
    assert.ok(typeof row.id === 'string' && /^[a-z0-9]+-[A-Za-z0-9]+$/.test(row.id));
    const setId = row.id.split('-')[0];
    if (!cache.has(setId)) {
      cache.set(setId, JSON.parse(fs.readFileSync(path.join(repoRoot,
        'resources', 'cards', 'en', setId + '.json'), 'utf8')));
    }
    const matches = cache.get(setId).filter(card => card.id === row.id);
    assert.equal(matches.length, 1, 'Unresolved physical card ' + row.id);
    const card = matches[0];
    const basic = card.supertype === 'Pokémon' &&
      Array.isArray(card.subtypes) && card.subtypes.includes('Basic');
    if (card.supertype === 'Pokémon') {
      assert.ok(Array.isArray(card.subtypes) &&
        (card.subtypes.includes('Basic') ||
         card.subtypes.some(x => /^Stage [12]$/.test(x) ||
           ['VMAX','VSTAR','BREAK','MEGA'].includes(x))),
      'Unknown Pokémon stage ' + row.id);
    }
    for (let i = 0; i < row.count; i += 1) masks.push(basic);
  }
  assert.equal(masks.length, 60, 'Expected 60 resolved source cards');
  return masks;
}

/**
 * Load the exact fixed candidate entry ordering used by the Aichi benchmark
 * and New Moon English-equivalent loader. The two deck identities must remain
 * versioned externally; this function makes no claim of paper legality.
 * @param {string} repoRoot
 * @returns {{reference:boolean[],newMoon:boolean[]}}
 */
function benchmarkMasks(repoRoot) {
  const roster = JSON.parse(fs.readFileSync(path.join(repoRoot,
    'results/aichi-2026/full-decklists.json'), 'utf8'));
  const proposal = JSON.parse(fs.readFileSync(path.join(repoRoot,
    'results/als/new-moon-lockbreak-english-proxy-60.json'), 'utf8'));
  const sets = JSON.parse(fs.readFileSync(path.join(repoRoot,
    'resources/sets/en.json'), 'utf8'));
  const reference = roster.decks.find(x => x.rank === 1);
  assert.ok(reference && Array.isArray(reference.cards));
  assert.equal(proposal.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  const byCode = new Map();
  for (const set of sets) {
    if (!set.ptcgoCode) continue;
    const code = set.ptcgoCode.toUpperCase();
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(set.id);
  }
  const referenceIds = reference.cards.map(row => {
    if (row.category !== 'Pokémon') {
      assert.ok(row.category === 'Trainer' || row.category === 'Energy');
      return {id: null, count: row.count, nonPokemon: true};
    }
    const code = row.printing.set.toUpperCase();
    const number = String(row.printing.number);
    if (code === 'SMP') return {id: 'smp-SM' + number, count: row.count};
    const setIds = byCode.get(code) || [];
    assert.ok(setIds.length, 'Unknown print set ' + code);
    const matches = setIds.map(setId => {
      const cards = JSON.parse(fs.readFileSync(path.join(repoRoot,
        'resources/cards/en', setId + '.json'), 'utf8'));
      return cards.filter(card => String(card.number) === number &&
        card.name === row.name);
    }).flat();
    assert.equal(matches.length, 1, 'Ambiguous printing ' + code + ':' + number + ':' + row.name);
    return {id: matches[0].id, count: row.count};
  });
  const newMoonIds = proposal.entries.map(row => row.type === 'Pokémon' ?
    {id: row.english_proxy_card_id, count: row.count} :
    {id: null, count: row.count, nonPokemon: true});
  return {
    reference: maskForResolvedCards(referenceIds, repoRoot),
    newMoon: maskForResolvedCards(newMoonIds, repoRoot)
  };
}

module.exports = {
  combinations, auditBasicOpeningAsymmetry,
  maskForResolvedCards, benchmarkMasks
};
