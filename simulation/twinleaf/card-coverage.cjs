'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

/**
 * This is a card-ID and implementation-signal audit, not paper legality proof.
 * It never substitutes a same-name reprint for a requested printing silently.
 */
function normalizeNumber(value) {
  return String(value || '').replace(/^0+(?=\d)/, '').trim().toUpperCase();
}

/**
 * Map a published diamond-glyph rendering to the literal name used by
 * Twinleaf. Resolve only against a matching set/number and PRISM_STAR tag.
 * @param {string} name Source card name, preserved in the final report.
 * @returns {string}
 */
function prismAlias(name) {
  return name.replace(/\s*[♢◇]\s*$/u, ' Prism Star');
}

/**
 * @param {any} card Upstream Twinleaf card object.
 * @param {any} Card Base Twinleaf Card class.
 * @returns {string[]} Weak signals only, not a judgment of semantic correctness.
 */
function implementationSignals(card, Card) {
  const signals = [];
  if (card.reduceEffect !== Card.prototype.reduceEffect) signals.push('customReduceEffect');
  if (typeof card.canPlay === 'function') signals.push('customCanPlay');
  if ((card.attacks || []).some(attack => typeof attack.effect === 'function')) {
    signals.push('attackHandler');
  }
  if ((card.powers || []).some(power => typeof power.effect === 'function')) {
    signals.push('powerHandler');
  }
  if (card.toolEffect !== undefined) signals.push('toolEffect');
  return signals;
}

/**
 * @param {{decks:Array<{rank:number,cards:Array<{name:string,count:number,printing?:{set?:string,number?:string}}>}>}} manifest Parsed source manifest.
 * @returns {object} Coverage report for exact printings and fallback names.
 */
function reportCoverage(manifest) {
  const { Card } = require(path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output/game/store/card/card'));
  const { CardTag } = require(path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types'));

  const cards = initializeCards().getAllCards();
  const byName = new Map();
  for (const card of cards) {
    if (!byName.has(card.name)) byName.set(card.name, []);
    byName.get(card.name).push(card);
  }
  const decks = [];
  const missingRows = [];
  const alternateRows = [];
  let exactRows = 0;
  let exactAliasedRows = 0;
  let totalRows = 0;
  for (const deck of manifest.decks) {
    const rows = [];
    let count = 0;
    for (const item of deck.cards) {
      count += item.count;
      totalRows += 1;
      const normalizedName = prismAlias(item.name);
      const aliasCandidates = normalizedName === item.name ? [] :
        (byName.get(normalizedName) || []).filter(card => card.tags.includes(CardTag.PRISM_STAR));
      const candidates = [...(byName.get(item.name) || []), ...aliasCandidates];
      const matches = candidates.filter(card =>
        String(card.set).toUpperCase() === String(item.printing?.set || '').toUpperCase() &&
        normalizeNumber(card.setNumber) === normalizeNumber(item.printing?.number)
      );
      const status = matches.length === 1 ?
        (normalizedName === item.name ? 'exact' : 'exact-alias') :
        matches.length > 1 ? 'ambiguous-exact' :
          candidates.length ? 'alternate-only' : 'missing-name';
      const row = {
        name: item.name,
        count: item.count,
        requested: item.printing || null,
        status,
        alias: normalizedName === item.name ? null : normalizedName,
        exact: matches.map(c => ({ fullName: c.fullName, signals: implementationSignals(c, Card) })),
        alternatives: status === 'exact' ? [] : candidates.map(c => ({
          fullName: c.fullName, set: c.set, number: c.setNumber,
          signals: implementationSignals(c, Card)
        }))
      };
      if (status === 'exact') exactRows += 1;
      if (status === 'exact-alias') exactAliasedRows += 1;
      if (status === 'alternate-only' || status === 'ambiguous-exact') {
        alternateRows.push({ rank: deck.rank, ...row });
      } else if (status === 'missing-name') {
        missingRows.push({ rank: deck.rank, ...row });
      }
      rows.push(row);
    }
    if (count !== 60) {
      throw new Error('Manifest has non-60-card deck at rank ' + deck.rank + ': ' + count);
    }
    decks.push({
      rank: deck.rank,
      resolved: rows.every(row => row.status === 'exact' || row.status === 'exact-alias'),
      rows
    });
  }
  return {
    source: manifest.source,
    scope: 'Twinleaf pinned revision card-ID coverage; NOT legality or engine semantic validation',
    engineRevision: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    publishedDecks: decks.length,
    requestedPrintingRows: totalRows,
    exactRows,
    exactAliasedRows,
    alternateOnlyRows: alternateRows.length,
    missingNameRows: missingRows.length,
    unresolvedRanks: decks.filter(deck => !deck.resolved).map(deck => deck.rank),
    missingRows,
    alternateRows,
    decks
  };
}

/**
 * @param {string} filePath Manifest JSON path.
 * @returns {object} Coverage report.
 */
function reportManifestFile(filePath) {
  return reportCoverage(JSON.parse(fs.readFileSync(filePath, 'utf8')));
}

if (require.main === module) {
  const filePath = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
  const report = reportManifestFile(filePath);
  const summary = {
    publishedDecks: report.publishedDecks,
    requestedPrintingRows: report.requestedPrintingRows,
    exactRows: report.exactRows,
    exactAliasedRows: report.exactAliasedRows,
    alternateOnlyRows: report.alternateOnlyRows,
    missingNameRows: report.missingNameRows,
    unresolvedRanks: report.unresolvedRanks,
    missingNames: [...new Set(report.missingRows.map(row => row.name))],
    alternateNames: [...new Set(report.alternateRows.map(row => row.name))]
  };
  console.log(JSON.stringify(summary, null, 2));
}

module.exports = { reportCoverage, reportManifestFile, normalizeNumber, prismAlias, implementationSignals };
