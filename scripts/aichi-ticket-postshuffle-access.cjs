'use strict';
const { ticketCompressor, verifyCompressor } = require('./aichi-meloetta-ticket-compressor.cjs');
/**
 * Restricted Ticket -> Battle Compressor -> draw resource-location model.
 * Japanese paper ruling FAQ 9672 requires Battle Compressor to discard
 * at least one card. A legal Compressor discards 1 to 3 cards and shuffles.
 * This model assumes the discarded cards are not the retrieved DCE.
 *
 * The initial h includes at least one Basic; q old Prizes contain the DCE;
 * Ticket and Compressor must be seen in opening h plus one normal draw.
 * This counts a resource opportunity, never an executable winning line.
 *
 * @param {number} n Total deck size
 * @param {number} b Initial Basic Pokemon count
 * @param {number} h Opening hand size
 * @param {number} q Initial Prize count
 * @param {number} c Battle Compressor copies
 * @param {number} k Draws after the compulsory Compressor discard and shuffle
 * @param {number} discarded Other deck cards legally selected for Compressor, 1..3
 */
function ticketPostShuffleAccess(n, b, h, q, c, k, discarded = 1) {
  const beforeCompressor = n - h - q - 1;
  if (!Number.isInteger(discarded) || discarded < 1 || discarded > 3 ||
      discarded >= beforeCompressor) {
    throw new RangeError('Compressor must discard 1 to 3 non-DCE cards');
  }
  const afterCompressor = beforeCompressor - discarded;
  if (!Number.isInteger(k) || beforeCompressor < q || k < 0 || k > afterCompressor) {
    throw new RangeError('Invalid post-Compressor draw horizon');
  }
  const direct = ticketCompressor(n, b, h, q, c);
  // Returned old Prize cards occupy the bottom q positions until shuffle.
  // Compressor must discard >=1 other card; DCE remains in the deck.
  const afterShuffle = k / afterCompressor;
  const withoutShuffle = Math.max(0, k - (beforeCompressor - q)) / q;
  return {
    cardsBeforeCompressor: beforeCompressor,
    cardsRemaining: afterCompressor,
    compressorDiscardCount: discarded,
    directTicketCompressor: direct.directRoute,
    conditionalAfterShuffle: afterShuffle,
    unconditionalAfterShuffle: direct.directRoute * afterShuffle,
    conditionalWithoutShuffle: withoutShuffle,
    unconditionalWithoutShuffle: direct.directRoute * withoutShuffle
  };
}
function verifyRank26PostShuffle(manifest) {
  const c = verifyCompressor(manifest);
  const deck = manifest.decks.find(d => d.rank === 26);
  const sourceBasics = new Set(['Unown','Exeggcute','Meloetta ex','Tapu Koko ♢','Bunnelby','Squawkabilly ex','Crobat V','Dedenne-GX']);
  const pokemon = deck.cards.filter(x => x.category === 'Pokémon');
  if (pokemon.some(x => !sourceBasics.has(x.name))) throw new Error('Rank 26 source changed: recalculate Basic count');
  const basicCount = pokemon.reduce((n, x) => n + x.count, 0);
  if (basicCount !== 12) throw new Error('Rank 26 Basic count changed');
  return { basicCount, compressorCount: c };
}
if (require.main === module) {
  const path = require('node:path'), fs = require('node:fs');
  const root = path.resolve(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const { basicCount, compressorCount } = verifyRank26PostShuffle(manifest);
  const drawHorizon = [1,4,7,10,40,41,45];
  console.log(JSON.stringify({
    rank: 26,
    paperRuling: 'https://www.pokemon-card.com/rules/faq/details.php?id=9672',
    horizons: [1,2,3].map(discarded => ({
      discarded,
      draws: drawHorizon.filter(k => k <= 46 - discarded).map(k =>
        ({ k, ...ticketPostShuffleAccess(60, basicCount, 7, 6, compressorCount, k, discarded) }))
    }))
  }, null, 2));
}
module.exports = { ticketPostShuffleAccess, verifyRank26PostShuffle };
