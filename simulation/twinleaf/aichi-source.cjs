'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const EXPECTED_SHA256 = '404049fb296d4c0b8e173041cd369a7517e49ac04f30f73e6725e1b0fd8fd5ca';

/**
 * @param {string} [filename] Path of checked-in, source-validated archive.
 * @returns {object} Validated Aichi 2026 name-level opponent manifest.
 */
function loadAichiPublished(filename = path.resolve(__dirname, '../../results/aichi-2026/published-name-level.json.gz.b64')) {
  const encoded = fs.readFileSync(filename, 'utf8').replace(/\s/g, '');
  const raw = zlib.gunzipSync(Buffer.from(encoded, 'base64'));
  const digest = crypto.createHash('sha256').update(raw).digest('hex');
  if (digest !== EXPECTED_SHA256) throw new Error(`Aichi source digest mismatch: ${digest}`);
  const manifest = JSON.parse(raw.toString('utf8'));
  if (manifest.decks.length !== 29 || manifest.published_count !== 29 ||
      JSON.stringify(manifest.unpublished_ranks) !== '[23,25,28]') {
    throw new Error('Unexpected published field membership');
  }
  for (const deck of manifest.decks) {
    const count = Object.values(deck.sections).flat().reduce((sum, card) => sum + card.count, 0);
    if (count !== 60) throw new Error(`Rank ${deck.rank} has ${count} cards`);
  }
  return manifest;
}

/**
 * Convert source rows for card-coverage.cjs without inventing printings.
 * @param {object} source Output of loadAichiPublished.
 * @returns {object} Twinleaf card-coverage compatible manifest.
 */
function toCoverageManifest(source) {
  return {
    source: source.source,
    decks: source.decks.map(deck => ({
      rank: deck.rank,
      player: deck.player,
      archetype: deck.archetype,
      cards: Object.entries(deck.sections).flatMap(([section, rows]) =>
        rows.map(row => ({ name: row.name, count: row.count, section, printing: null })))
    }))
  };
}

module.exports = { loadAichiPublished, toCoverageManifest, EXPECTED_SHA256 };
