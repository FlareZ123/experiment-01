'use strict';

const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent17-aichi-may2026-postdated-mee-prints-v1';
const TOURNAMENT_DATE = '2026-05-10';
const FUTURE_PRINT_RELEASE = '2026-09-16';
const OFFICIAL_RELEASE_SOURCE =
  'https://pokemon.gamespress.com/MEDIA-ALERT-Pokemon-Trading-Card-Game-30th-Celebration-Expansion-Launc';
const PRINT_FAMILY_SOURCE =
  'https://bulbapedia.bulbagarden.net/wiki/MEE_Basic_Energies_(TCG)';

/**
 * Audit a source manifest's claimed individual card collection numbers against
 * one independently date-verified future Basic Energy artwork family.
 * Report both counts and exact rows. This does not revise card names or
 * reconstruct physical printings that a tournament player actually used.
 *
 * @param {{decks:Array<{rank:number,cards:Array<object>}>}} manifest
 * @returns {object} Source chronology discrepancy evidence.
 */
function auditPostdatedMEE(manifest) {
  const suspect = [];
  for (const deck of manifest.decks) {
    for (const card of deck.cards) {
      const number = Number(card.printing?.number);
      if (card.printing?.set !== 'MEE' ||
          !Number.isInteger(number) || number < 9 || number > 16) continue;
      suspect.push({
        rank: deck.rank, player: deck.player,
        name: card.name, set: 'MEE', number,
        copies: card.count
      });
    }
  }
  suspect.sort((a, b) => a.rank - b.rank || a.number - b.number);
  const ranks = [...new Set(suspect.map(row => row.rank))];
  const copies = suspect.reduce((sum, row) => sum + row.copies, 0);
  return {
    version: VERSION, tournamentDate: TOURNAMENT_DATE,
    postdatedArtworkRelease: FUTURE_PRINT_RELEASE,
    releaseSource: OFFICIAL_RELEASE_SOURCE,
    artworkFamilySource: PRINT_FAMILY_SOURCE,
    decksChecked: manifest.decks.length,
    rows: suspect.length, copies, affectedDecks: ranks.length,
    affectedRanks: ranks,
    postdatedRows: suspect,
    exactOriginalPrintingProven: false,
    sourceDeckCardIdentityUnchanged: true,
    qualifiedCompetitiveGames: 0
  };
}

function run() {
  const file = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const result = auditPostdatedMEE(JSON.parse(fs.readFileSync(file,'utf8')));
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) run();
module.exports = { VERSION, auditPostdatedMEE, run };
