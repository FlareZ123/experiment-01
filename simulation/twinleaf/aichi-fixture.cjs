'use strict';
const path = require('node:path');
const { resolveManifestFile } = require('./resolve-field.cjs');
const { runMatch } = require('./headless.cjs');

/** Probe Aichi mirror and paired seats, without claiming match win rates. */
function probeAichi() {
  const file = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
  const field = resolveManifestFile(file, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const decks = new Map(field.decks.map(deck => [deck.rank, deck]));
  const pairs = [[1, 1], [1, 10], [10, 1]];
  const fixtures = pairs.map(([a, b], i) => {
    try {
      const result = runMatch({
        deckA: decks.get(a).cardIds, deckB: decks.get(b).cardIds,
        seed: 20261015 + (i === 0 ? 0 : 1),
        maxActions: 1200, label: 'Aichi ' + a + ' vs ' + b
      });
      return { a, b, result };
    } catch (error) {
      return { a, b, aborted: true, error: String(error.message) };
    }
  });
  return { kind: 'Aichi engine and policy feasibility only',
    source: field.source, mapped: field.resolvedDecks,
    count: field.totalPublishedDecks, fixtures };
}
if (require.main === module) {
  const report = probeAichi();
  console.log(JSON.stringify(report, null, 2));
  if (!report.fixtures.some(f => f.result?.finished)) process.exitCode = 1;
}
module.exports = { probeAichi };
