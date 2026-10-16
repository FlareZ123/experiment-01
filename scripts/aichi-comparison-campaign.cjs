'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const PILOT_RANKS = Object.freeze([1, 2, 3, 4, 5, 6, 8, 10, 26]);
const CHALLENGERS = Object.freeze([
  ['hood-shield-v1', 'candidate-hood-shadow-rider.json'],
  ['temple-v1', 'candidate-temple-shadow-rider.json']
]);

/** @param {unknown} value @returns {string} */
function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Printing-sensitive, row-order-invariant representation of one fixed deck.
 * @param {unknown} cards
 * @returns {Array<[string, number]>}
 */
function canonicalCards(cards) {
  if (!Array.isArray(cards)) throw new TypeError('Cards must be an array.');
  const counts = new Map();
  let total = 0;
  for (const card of cards) {
    if (!card || typeof card.name !== 'string' || !card.name.trim() ||
        !card.printing || typeof card.printing.set !== 'string' ||
        !card.printing.set.trim() || !String(card.printing.number || '').trim() ||
        !Number.isInteger(card.count) || card.count < 1) {
      throw new Error('Invalid card row or printing.');
    }
    const key = JSON.stringify([
      card.name.trim(), card.printing.set.toUpperCase(),
      String(card.printing.number), card.printing.language || ''
    ]);
    counts.set(key, (counts.get(key) || 0) + card.count);
    total += card.count;
  }
  if (total !== 60) throw new Error('Expected exactly 60 cards, got ' + total);
  return [...counts].sort((a, b) => a[0].localeCompare(b[0]));
}

/** @param {string} csv @returns {Array<{rank:number,player:string,archetype:string,published:boolean}>} */
function parseField(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.shift() !== 'rank,player,archetype,full_list_published') {
    throw new Error('Unexpected field.csv header.');
  }
  return lines.map(line => {
    const cells = line.split(',');
    if (cells.length !== 4 || !/^\d+$/.test(cells[0]) ||
        !['yes', 'no'].includes(cells[3])) {
      throw new Error('Malformed field row: ' + line);
    }
    return {
      rank: Number(cells[0]), player: cells[1], archetype: cells[2],
      published: cells[3] === 'yes'
    };
  });
}

/**
 * Produce an explicit exploratory schedule. Candidate engine slots are not
 * actual first/second turns. Runtime draw-log proof must establish turn order.
 * @param {{field:Array<object>, source:object, candidates:Array<object>,
 *   pilotRanks?:number[], repeats?:number, seedBase?:number,
 *   seatSeedMode?:'paired-slots-v1'|'independent-slots-v2'}} options
 * @returns {object}
 */
function buildCampaign(options) {
  const { field, source, candidates, pilotRanks = [...PILOT_RANKS],
    repeats = 1, seedBase = 20261016,
    seatSeedMode = 'paired-slots-v1' } = options;
  if (!['paired-slots-v1', 'independent-slots-v2'].includes(seatSeedMode)) {
    throw new Error('Unsupported seat seed protocol.');
  }
  if (!Array.isArray(field) || field.length !== 32 ||
      field.some(f => !Number.isInteger(f.rank) || f.rank < 1 || f.rank > 32) ||
      new Set(field.map(f => f.rank)).size !== 32) {
    throw new Error('Field must contain each rank 1..32 exactly once.');
  }
  if (!source || !Array.isArray(source.decks) ||
      !Array.isArray(candidates) || !candidates.length) {
    throw new Error('Missing source decks or candidate inventories.');
  }
  if (!Number.isInteger(repeats) || repeats < 1 || repeats > 100 ||
      !Number.isInteger(seedBase) || seedBase < 0 ||
      seedBase + 300000 + 32 * 1024 + repeats > 0xffffffff) {
    throw new Error('Invalid repeats or unsigned seed base.');
  }
  if (!Array.isArray(pilotRanks) || !pilotRanks.length ||
      new Set(pilotRanks).size !== pilotRanks.length ||
      pilotRanks.some(r => !Number.isInteger(r) || r < 1 || r > 32)) {
    throw new Error('Invalid pilot ranks.');
  }
  const sourceRanks = new Map();
  for (const deck of source.decks) {
    if (!Number.isInteger(deck.rank) || sourceRanks.has(deck.rank)) {
      throw new Error('Duplicate or invalid source rank.');
    }
    sourceRanks.set(deck.rank, deck);
  }
  const rows = [...field].sort((a, b) => a.rank - b.rank).map(f => {
    const sourceDeck = sourceRanks.get(f.rank);
    if (Boolean(sourceDeck) !== f.published ||
        (sourceDeck && (sourceDeck.player !== f.player ||
          sourceDeck.archetype !== f.archetype))) {
      throw new Error('Field/source disagreement at rank ' + f.rank);
    }
    return {
      rank: f.rank, player: f.player, archetype: f.archetype,
      status: f.published ? 'published' : 'missing-full-list',
      opponentDigest: sourceDeck ? hash(canonicalCards(sourceDeck.cards)) : null
    };
  });
  if (sourceRanks.size !== rows.filter(r => r.status === 'published').length) {
    throw new Error('Source contains ranks absent from the field.');
  }
  if (pilotRanks.some(rank => rows[rank - 1].status !== 'published')) {
    throw new Error('Pilot includes unpublished placement.');
  }
  const seen = new Set();
  const candidateRows = candidates.map(c => {
    if (!c || typeof c.id !== 'string' || !/^[a-z0-9-]+$/.test(c.id) ||
        seen.has(c.id)) throw new Error('Invalid or repeated candidate id.');
    seen.add(c.id);
    return {
      id: c.id, deckDigest: hash(canonicalCards(c.cards)),
      referenceOnly: c.referenceOnly === true
    };
  });
  const trials = [];
  for (const phase of ['pilot', 'published-field']) {
    const scheduled = phase === 'pilot' ? new Set(pilotRanks) :
      new Set(rows.filter(r => r.status === 'published').map(r => r.rank));
    for (const row of rows) {
      if (!scheduled.has(row.rank)) continue;
      for (let repeat = 0; repeat < repeats; repeat += 1) {
        // Seeds are matched across candidate variants and engine slots.
        // Phase offsets separate exploratory pilot from field-wide follow-up.
        const seedForRank = seedBase + (phase === 'pilot' ? 100000 : 200000) +
          row.rank * 1024;
        for (const candidate of candidateRows) {
          for (const candidateEngineSlot of ['A', 'B']) {
            const seed = seedForRank + (seatSeedMode === 'independent-slots-v2' ?
              2 * repeat + (candidateEngineSlot === 'B' ? 1 : 0) : repeat);
            trials.push({
              trialId: [phase, row.rank, repeat, candidate.id, candidateEngineSlot]
                .join(':'),
              phase, rank: row.rank, opponentDigest: row.opponentDigest,
              candidateId: candidate.id, candidateDigest: candidate.deckDigest,
              repeat, seed, candidateEngineSlot,
              actualStartingTurn: 'requires-runtime-verification'
            });
          }
        }
      }
    }
  }
  const metadata = {
    schemaVersion: seatSeedMode === 'independent-slots-v2' ? 2 : 1,
    purpose: 'exploratory-diagnostic-only',
    engineAndPolicyQualified: false,
    strengthClaimPermitted: false,
    fieldDigest: hash(rows), candidateRows,
    pilotRanks, repeats, seedBase,
    coverage: {
      publishedRanks: rows.filter(r => r.status === 'published').map(r => r.rank),
      missingRanks: rows.filter(r => r.status !== 'published').map(r => r.rank)
    },
    trialCountByPhase: {
      pilot: trials.filter(t => t.phase === 'pilot').length,
      publishedField: trials.filter(t => t.phase === 'published-field').length
    }
  };
  if (seatSeedMode === 'independent-slots-v2') {
    metadata.seedProtocol = seatSeedMode;
  }
  return { ...metadata, planDigest: hash({ metadata, trials }), trials };
}

/** @returns {object} Exact checked-in reference plus two research challengers. */
function loadDefaultCampaign(seatSeedMode = 'paired-slots-v1') {
  const dir = path.join(ROOT, 'results', 'aichi-2026');
  const source = JSON.parse(fs.readFileSync(path.join(dir, 'full-decklists.json'), 'utf8'));
  const field = parseField(fs.readFileSync(path.join(dir, 'field.csv'), 'utf8'));
  const reference = source.decks.find(d => d.rank === 1);
  if (!reference) throw new Error('Rank-1 reference is unavailable.');
  const candidates = [{ id: 'champion-reference', cards: reference.cards,
    referenceOnly: true }];
  for (const [id, file] of CHALLENGERS) {
    const candidate = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    candidates.push({ id, cards: candidate.cards });
  }
  return buildCampaign({ field, source, candidates, seatSeedMode });
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(loadDefaultCampaign(), null, 2) + '\n');
}

module.exports = { PILOT_RANKS, canonicalCards, parseField, buildCampaign,
  loadDefaultCampaign };
