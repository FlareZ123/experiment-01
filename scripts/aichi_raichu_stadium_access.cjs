'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {choose, loadBasicIndex, audit} = require('./aichi_opening_audit.cjs');

/**
 * Exact natural opening Stadium access, conditional on at least one Basic
 * Pokémon in the initial seven. The compulsory turn draw follows six random
 * face-down Prize cards; marginally it is a draw from the other 53 cards.
 *
 * @param {number} basicCount Number of printed Basic Pokémon in the 60.
 * @param {number} stadiumCount Number of directly playable Stadium cards.
 * @returns {object} Conditional probabilities.
 */
function directStadiumAccess(basicCount, stadiumCount) {
  if (!Number.isInteger(basicCount) || !Number.isInteger(stadiumCount) ||
      basicCount < 1 || stadiumCount < 1 || basicCount + stadiumCount > 60) {
    throw new RangeError('Invalid disjoint Basic/Stadium source counts');
  }
  const allHands = choose(60, 7);
  const validHands = allHands - choose(60 - basicCount, 7);
  const validStadiumHands = allHands - choose(60 - basicCount, 7) -
    choose(60 - stadiumCount, 7) + choose(60 - basicCount - stadiumCount, 7);
  const validNoStadiumHands = choose(60 - stadiumCount, 7) -
    choose(60 - basicCount - stadiumCount, 7);
  const afterTurnDraw = validStadiumHands + validNoStadiumHands * stadiumCount / 53;
  return {
    basicCount, stadiumCount,
    validOpening: validHands / allHands,
    directInValidSeven: validStadiumHands / validHands,
    directAfterMandatoryDraw: afterTurnDraw / validHands
  };
}

/**
 * Read the same exact published Aichi source and stage index used by
 * the established mulligan audit. Rank 25 is deliberately excluded.
 */
function report() {
  const root = path.resolve(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(
    path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const cardIndex = loadBasicIndex(path.join(root, 'resources/cards/en'));
  const stageAudit = new Map(audit(manifest.decks, cardIndex)
    .map(row => [row.rank, row.basicCount]));
  const out = [];
  for (const [rank, stadiumName, copies] of [[4, 'Sky Field', 3], [17, 'PokéStop', 1]]) {
    const deck = manifest.decks.find(row => row.rank === rank);
    if (!deck || !/Raichu Electrode/u.test(deck.archetype)) {
      throw new Error('Expected published Raichu/Electrode at rank ' + rank);
    }
    const stadiums = deck.cards.filter(card => card.category === 'Trainer' &&
      card.name === stadiumName).reduce((sum, row) => sum + row.count, 0);
    const otherStadiums = deck.cards.filter(card =>
      card.category === 'Trainer' && card.name !== stadiumName &&
      ['Sky Field', 'PokéStop', 'Temple of Sinnoh', 'Path to the Peak'].includes(card.name));
    if (otherStadiums.length || stadiums !== copies) {
      throw new Error('Published Raichu Stadium source changed at rank ' + rank);
    }
    const basicCount = stageAudit.get(rank);
    if (basicCount !== 13) throw new Error('Basic stage audit changed for rank ' + rank);
    out.push({rank, player: deck.player, stadiumName,
      ...directStadiumAccess(basicCount, copies)});
  }
  if (!manifest.missing_full_lists.some(entry => entry.rank === 25) ||
      manifest.decks.some(deck => deck.rank === 25)) {
    throw new Error('Rank-25 source availability changed; re-audit before reuse');
  }
  return {
    scope: 'Unrestricted natural hand and mandatory draw only; valid seven required',
    source: manifest.source,
    missingRank25: true,
    findings: out
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(report(), null, 2) + '\n');
module.exports = {directStadiumAccess, report};
