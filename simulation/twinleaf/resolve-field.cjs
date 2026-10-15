'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { reportCoverage } = require('./card-coverage.cjs');
const { initializeCards } = require('./headless.cjs');
const { registerPlayersCeremony, PLAYERS_CEREMONY_PRINT } = require('./card-patches.cjs');

const serverOutput = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const { EnergyType, Format } = require(path.join(serverOutput, 'game/store/card/card-types'));
const { DeckAnalyser } = require(path.join(serverOutput, 'game/cards/deck-analyser'));

/**
 * Convert the validated published field into explicitly provenance-tracked
 * Twinleaf IDs. Every substitution must be opted into by the caller.
 *
 * @typedef {object} ResolutionOptions
 * @property {boolean} allowEquivalentBasicEnergies Allow same-name, same-set
 *   basic Energy when source and engine printing numbers differ.
 * @property {boolean} allowJapanesePromoHooks Register 127/S-P Player's Ceremony
 *   research card, which does not exist in pinned upstream.
 */

/**
 * @param {object} manifest Source Aichi manifest with 29 full lists.
 * @param {ResolutionOptions} options Explicit non-native resolution permissions.
 * @returns {object} Complete lists and unresolved items per placement.
 */
function resolveManifest(manifest, options = {}) {
  const { allowEquivalentBasicEnergies = false, allowJapanesePromoHooks = false } = options;
  const manager = initializeCards();
  const native = reportCoverage(manifest);
  const resolved = [];

  for (const deck of native.decks) {
    const source = manifest.decks.find(item => item.rank === deck.rank);
    const cardIds = [];
    const modifications = [];
    const unresolved = [];

    for (let i = 0; i < source.cards.length; i++) {
      const item = source.cards[i];
      const row = deck.rows[i];
      let name;
      let reason;

      if (row.status === 'exact' || row.status === 'exact-alias') {
        name = row.exact[0].fullName;
        if (row.status === 'exact-alias') reason = 'prism-glyph-name-alias';
      } else if (row.status === 'ambiguous-exact' &&
          item.name === 'Electrike' && item.printing.set === 'PRC' &&
          String(item.printing.number) === '60') {
        // Printed PRC #60 is the Omega Barrier Electrike; the pinned engine
        // incorrectly assigns #60 to a second, non-Ancient-Trait Electrike.
        // https://limitlesstcg.com/cards/prc/60
        const ancientTrait = row.exact.filter(candidate =>
          (manager.getCardByName(candidate.fullName).powers || [])
            .some(power => power.name === 'Ω Barrier'));
        if (ancientTrait.length === 1) {
          name = ancientTrait[0].fullName;
          reason = 'verified-prc60-omega-barrier-disambiguation';
        }
      } else if (allowEquivalentBasicEnergies && item.category === 'Energy') {
        const candidates = row.alternatives
          .filter(card => card.set.toUpperCase() === String(item.printing.set).toUpperCase())
          .filter(card => manager.getCardByName(card.fullName).energyType === EnergyType.BASIC);
        if (candidates.length === 1) {
          name = candidates[0].fullName;
          reason = 'same-set-basic-energy-number-mismatch';
        }
      }

      if (!name && allowJapanesePromoHooks &&
          item.name === "Player's Ceremony" &&
          item.printing.set === 'SP' && String(item.printing.number) === '127') {
        name = registerPlayersCeremony();
        if (name !== PLAYERS_CEREMONY_PRINT) {
          throw new Error('Unexpected research card printing.');
        }
        reason = 'research-only-japanese-promo-implementation';
      }

      if (!name) {
        unresolved.push({
          name: item.name, count: item.count, requested: item.printing,
          status: row.status, alternatives: row.alternatives.map(c => c.fullName)
        });
        continue;
      }
      cardIds.push(...Array(item.count).fill(name));
      if (reason) {
        modifications.push({
          reason, sourceName: item.name, sourcePrinting: item.printing,
          resolvedId: name, count: item.count
        });
      }
    }
    const deckSizeValid = cardIds.length === 60;
    const engineDeckValid = deckSizeValid && new DeckAnalyser(cardIds).isValid(Format.EXPANDED);
    resolved.push({
      rank: deck.rank,
      player: source.player,
      archetype: source.archetype,
      nativeExactRows: deck.rows.filter(row => row.status === 'exact').length,
      playableUnderEngine: engineDeckValid && unresolved.length === 0,
      deckSize: cardIds.length,
      cardIds,
      modifications,
      unresolved
    });
  }

  return {
    source: manifest.source,
    caveat: 'Deck ID resolution is not paper legality or verified card-effect correctness.',
    engineRevision: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    permissions: { allowEquivalentBasicEnergies, allowJapanesePromoHooks },
    resolvedDecks: resolved.filter(deck => deck.playableUnderEngine).length,
    totalPublishedDecks: resolved.length,
    decks: resolved
  };
}

/** @param {string} filePath @param {ResolutionOptions} options @returns {object} */
function resolveManifestFile(filePath, options = {}) {
  return resolveManifest(JSON.parse(fs.readFileSync(filePath, 'utf8')), options);
}

if (require.main === module) {
  const filePath = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
  const results = resolveManifestFile(filePath, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  console.log(JSON.stringify({
    kind: 'explicitly-permitted-engine-deck-resolution',
    resolvedDecks: results.resolvedDecks,
    totalPublishedDecks: results.totalPublishedDecks,
    permissions: results.permissions,
    unresolved: results.decks.filter(d => !d.playableUnderEngine).map(d => ({
      rank: d.rank, deckSize: d.deckSize, problems: d.unresolved
    })),
    mapped: results.decks.map(d => ({
      rank: d.rank, resolved: d.playableUnderEngine,
      basicEnergyRowsRemapped: d.modifications.filter(m => m.reason === 'same-set-basic-energy-number-mismatch').length,
      prismGlyphRows: d.modifications.filter(m => m.reason === 'prism-glyph-name-alias').length,
      promoHooks: d.modifications.filter(m => m.reason === 'research-only-japanese-promo-implementation').length,
      verifiedAmbiguityFixes: d.modifications.filter(m => m.reason === 'verified-prc60-omega-barrier-disambiguation').length
    }))
  }, null, 2));
}

module.exports = { resolveManifest, resolveManifestFile };
