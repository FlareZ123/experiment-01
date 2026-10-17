'use strict';
const {readFileSync} = require('node:fs');
const path = require('node:path');

/** Count published Telepath printings without assuming observed in-game use. */
function audit() {
  const f = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const field = JSON.parse(readFileSync(f, 'utf8'));
  const rows = field.decks.map(deck => {
    /** @param {string} name */
    const count = name => deck.cards.filter(card => card.name === name)
      .reduce((sum, card) => sum + card.count, 0);
    const cards = deck.cards.filter(card => card.name === 'Telepathic Psychic Energy');
    return {
      rank: deck.rank, archetype: deck.archetype,
      telepathCopies: count('Telepathic Psychic Energy'),
      telepathPrintings: cards.map(card => ({
        set: card.printing.set, number: card.printing.number, count: card.count
      })),
      miniorCopies: count('Minior'),
      wondrousPatchCopies: count('Wondrous Patch'),
      raihanCopies: count('Raihan')
    };
  }).filter(row => row.telepathCopies > 0).sort((a, b) => a.rank - b.rank);
  return {
    schema: 'aichi-telepath-source-inventory-v1',
    publishedExactDecks: field.decks.length,
    benchmarkPlacements: field.total_placements,
    unpublishedPlacements: field.missing_full_lists.map(row => row.rank),
    observedTelepathRanks: rows.length,
    observedTelepathCopies: rows.reduce((sum, row) => sum + row.telepathCopies, 0),
    ranks: rows,
    inference: 'List inclusion alone does not establish legal trigger exposure, actual use, engine effects or match strength.'
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(audit(), null, 2) + '\n');
module.exports = {audit};
