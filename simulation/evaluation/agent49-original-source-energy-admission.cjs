'use strict';

const assert = require('node:assert/strict');
const {energyUnits} = require('../twinleaf/actor-energy-payability.cjs');

const VERSION = 'agent49-original-source-energy-admission-v1';
const BASIC_NAMES = new Set([
  'Grass Energy', 'Fire Energy', 'Water Energy', 'Lightning Energy',
  'Psychic Energy', 'Fighting Energy', 'Darkness Energy', 'Metal Energy',
  'Fairy Energy'
]);

// Deliberately artificial, publicly reproducible contexts for a *model
// coverage* probe. Neither context establishes recipient legality or a
// selected Energy attachment in a game.
const FAVORABLE = Object.freeze({
  isBasic: true, isEvolution: true, isDragon: true, hasRuleBox: false,
  behindOnPrizes: true, isPokemonGXorEX: false
});
const UNCERTAIN = Object.freeze({
  isBasic: false, isEvolution: false, isDragon: false, hasRuleBox: true,
  behindOnPrizes: true
});

/**
 * Classify the exact source energy printing without converting a print's
 * numeric collector ID into a different card. This checks lexical access,
 * never attachment/attack legal availability.
 * @param {{category:string,count:number,name:string,printing:{set:string,number:string,language:string}}} card
 * @returns {{printing:string,name:string,count:number,kind:'basic'|'special',
 *   nominalUnitsKnown:boolean,uncertainContextUnitsKnown:boolean}}
 */
function sourceEnergyEntry(card) {
  assert.equal(card.category, 'Energy');
  assert.ok(Number.isSafeInteger(card.count) && card.count > 0);
  assert.equal(typeof card.name, 'string');
  assert.equal(typeof card.printing?.set, 'string');
  assert.equal(typeof card.printing?.number, 'string');
  assert.equal(card.printing?.language, 'en');
  const printing = card.name + ' ' + card.printing.set;
  return {
    printing, name: card.name, count: card.count,
    kind: BASIC_NAMES.has(card.name) ? 'basic' : 'special',
    nominalUnitsKnown: energyUnits(printing, FAVORABLE) !== null,
    uncertainContextUnitsKnown: energyUnits(printing, UNCERTAIN) !== null
  };
}

/**
 * Necessary preflight for authentic original opponent Energy source coverage.
 * An enabled policy flag establishes *potential implementation reach only*;
 * it cannot establish that the selected owner root, native Store, or paper
 * game ever pays for and settles an Energy attachment or characteristic attack.
 *
 * @param {{decks:object[],missing_full_lists?:object[]}} roster
 * @param {object} [policyOptions] Actual registered runtime options, never
 *   defaults inferred from another experimental profile.
 * @returns {object}
 */
function originalSourceEnergyAdmission(roster, policyOptions = {}) {
  assert.ok(Array.isArray(roster?.decks));
  assert.ok(policyOptions && typeof policyOptions === 'object');
  const ranks = new Set();
  const inventory = new Map();
  const sources = [];
  const genericEnabled =
    policyOptions.bilateralPublicContextSpecialEnergy === true;
  const narrowEnabled = [
    'bilateralSpecialEnergyRoot', 'sourceScopedSpecialEnergyRoot',
    'candidateScopedSpecialEnergyRoot'
  ].some(key => policyOptions[key] === true);
  const actorOnly = policyOptions.actorOnlyComposition === true;

  for (const deck of roster.decks) {
    assert.ok(Number.isSafeInteger(deck.rank) && deck.rank > 0);
    assert.ok(!ranks.has(deck.rank), 'Duplicate original source rank');
    ranks.add(deck.rank);
    assert.ok(Array.isArray(deck.cards));
    const total = deck.cards.reduce((sum, card) => {
      assert.ok(Number.isSafeInteger(card.count) && card.count > 0);
      return sum + card.count;
    }, 0);
    assert.equal(total, 60, 'Original rank ' + deck.rank + ' is not 60');

    const energies = deck.cards.filter(card => card.category === 'Energy')
      .map(sourceEnergyEntry);
    const basic = energies.filter(card => card.kind === 'basic')
      .reduce((sum, card) => sum + card.count, 0);
    const special = energies.filter(card => card.kind === 'special')
      .reduce((sum, card) => sum + card.count, 0);
    for (const energy of energies) {
      const key = energy.printing;
      const registered = inventory.get(key) ?? {
        printing: key, name: energy.name, kind: energy.kind,
        nominalUnitsKnown: energy.nominalUnitsKnown,
        uncertainContextUnitsKnown: energy.uncertainContextUnitsKnown,
        totalCopies: 0, sourceRanks: []
      };
      assert.equal(registered.kind, energy.kind);
      registered.totalCopies += energy.count;
      registered.sourceRanks.push(deck.rank);
      inventory.set(key, registered);
    }
    const specialOnly = basic === 0 && special > 0;
    const gate = !specialOnly ? 'mixed-or-basic-energy-source' :
      !actorOnly ? 'actor-only-runtime-scope-unverified' :
      genericEnabled ? 'generic-special-option-present-native-proof-required' :
      narrowEnabled ? 'narrow-special-only-exact-print-proof-required' :
      'no-declared-generic-special-owner-root';
    sources.push({
      rank: deck.rank, player: deck.player, archetype: deck.archetype,
      basicEnergyCopies: basic, specialEnergyCopies: special, specialOnly,
      specialPrintings: energies.filter(card => card.kind === 'special')
        .map(card => ({printing: card.printing, count: card.count})),
      unmodeledNominalPrintings: energies
        .filter(card => !card.nominalUnitsKnown)
        .map(card => card.printing),
      policyGate: gate,
      selectedNativeEnergyAttachCount: null,
      acceptedPaperPayment: 'not-tested',
      characteristicAttackAndReply: 'not-tested',
      competitivelyQualified: false
    });
  }
  const printings = [...inventory.values()]
    .sort((a, b) => a.printing.localeCompare(b.printing));
  const zeroBasicRanks = sources.filter(row => row.specialOnly)
    .map(row => row.rank).sort((a, b) => a - b);
  return {
    version: VERSION,
    originalSources: sources.length,
    missingFullLists: (roster.missing_full_lists ?? [])
      .map(x => x.rank).sort((a, b) => a - b),
    registeredProfile: {
      actorOnlyComposition: actorOnly,
      bilateralPublicContextSpecialEnergy: genericEnabled,
      narrowerSpecialOptionsEnabled: narrowEnabled
    },
    zeroBasicRanks,
    distinctEnergyPrintings: printings.length,
    nominalUnitUnknownPrintings: printings.filter(x => !x.nominalUnitsKnown)
      .map(x => x.printing),
    conditionalOrUncertainPrintings: printings
      .filter(x => !x.uncertainContextUnitsKnown).map(x => x.printing),
    printings,
    sources: sources.sort((a, b) => a.rank - b.rank),
    policyOptionProvesAttachment: false,
    nominalUnitRecognitionProvesPaperLegality: false,
    competitivelyQualifiedGames: 0
  };
}

module.exports = {VERSION, BASIC_NAMES, sourceEnergyEntry,
  originalSourceEnergyAdmission};
