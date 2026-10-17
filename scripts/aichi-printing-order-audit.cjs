'use strict';

const {createHash} = require('node:crypto');
const path = require('node:path');
const {canonicalCards} = require('./aichi-comparison-campaign.cjs');

/** @param {unknown} value @returns {string} */
const sha256 = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * A separately versioned, locale-independent print-order alternative.
 * Historical campaign hashes must remain unchanged until deliberately migrated.
 * @param {object[]} cards
 * @returns {Array<[string,number]>}
 */
function stablePrintingOrder(cards) {
  const rows = canonicalCards(cards);
  return rows.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
}

/** @param {{decks:object[]}} manifest */
function auditPrintingOrder(manifest) {
  return {
    schema: 'aichi-printing-order-comparator-audit-v1',
    currentCampaignChanged: false,
    records: manifest.decks.map(deck => {
      const legacy = canonicalCards(deck.cards);
      const stable = stablePrintingOrder(deck.cards);
      return {
        rank: deck.rank,
        legacyLocaleDigest: sha256(legacy),
        stableCodeUnitDigest: sha256(stable),
        differ: legacy.some((item, i) => item[0] !== stable[i][0]),
        firstDisagreement: legacy.findIndex((item, i) => item[0] !== stable[i][0])
      };
    })
  };
}

if (require.main === module) {
  const source = require(path.resolve(__dirname, '../results/aichi-2026/full-decklists.json'));
  process.stdout.write(JSON.stringify(auditPrintingOrder(source), null, 2) + '\n');
}

module.exports = {stablePrintingOrder, auditPrintingOrder};
