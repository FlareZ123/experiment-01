'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const roster = require('../results/aichi-2026/full-decklists.json');
const manifest = require('../simulation/evaluation/agent23-selected-joint-v2-manifest.json');
const {
  sourceEnergyEntry, originalSourceEnergyAdmission
} = require('../simulation/evaluation/agent49-original-source-energy-admission.cjs');

/**
 * A small self-contained synthetic original 60 for a source-policy gate test.
 * @param {number} rank
 * @param {Array<{name:string,count:number,set:string}>} energyRows
 * @returns {object}
 */
function source(rank, energyRows) {
  const energyCount = energyRows.reduce((sum, card) => sum + card.count, 0);
  return {
    rank, player: 'Fixture ' + rank, archetype: 'Fixture',
    cards: [
      {category: 'Pokémon', name: 'Dummy', count: 60 - energyCount},
      ...energyRows.map(card => ({
        category: 'Energy', name: card.name, count: card.count,
        printing: {set: card.set, number: '1', language: 'en'}
      }))
    ]
  };
}

test('favorable nominal model does not certify conditional Energy legality', () => {
  const counter = sourceEnergyEntry({
    category: 'Energy', name: 'Counter Energy', count: 4,
    printing: {set: 'CIN', number: '100', language: 'en'}
  });
  assert.equal(counter.kind, 'special');
  assert.equal(counter.nominalUnitsKnown, true);
  assert.equal(counter.uncertainContextUnitsKnown, false);
  const dragon = sourceEnergyEntry({
    category: 'Energy', name: 'Double Dragon Energy', count: 4,
    printing: {set: 'ROS', number: '97', language: 'en'}
  });
  assert.equal(dragon.uncertainContextUnitsKnown, false);
  assert.equal(dragon.nominalUnitsKnown, true);
});

test('configuration concern stays separate from actual attachment proof', () => {
  const fixture = {decks: [
    source(1, [{name: 'Psychic Energy', count: 11, set: 'MEE'}]),
    source(17, [
      {name: 'Reversal Energy', count: 4, set: 'PAL'},
      {name: 'Counter Energy', count: 4, set: 'CIN'},
      {name: 'Unit Energy LPM', count: 4, set: 'UPR'}
    ])
  ], missing_full_lists: [{rank: 23}]};
  const unsupported = originalSourceEnergyAdmission(fixture, {
    actorOnlyComposition: true,
    bilateralPublicContextSpecialEnergy: false
  });
  assert.deepEqual(unsupported.zeroBasicRanks, [17]);
  assert.equal(unsupported.sources[0].policyGate,
    'mixed-or-basic-energy-source');
  assert.equal(unsupported.sources[1].policyGate,
    'no-declared-generic-special-owner-root');
  assert.equal(unsupported.sources[1].selectedNativeEnergyAttachCount, null);
  assert.equal(unsupported.sources[1].competitivelyQualified, false);
  assert.equal(unsupported.policyOptionProvesAttachment, false);
  const tentative = originalSourceEnergyAdmission(fixture, {
    actorOnlyComposition: true, bilateralPublicContextSpecialEnergy: true
  });
  assert.equal(tentative.sources[1].policyGate,
    'generic-special-option-present-native-proof-required');
  assert.equal(tentative.sources[1].acceptedPaperPayment, 'not-tested');
  const narrow = originalSourceEnergyAdmission(fixture, {
    actorOnlyComposition: true, bilateralSpecialEnergyRoot: true
  });
  assert.equal(narrow.sources[1].policyGate,
    'narrow-special-only-exact-print-proof-required');
});

test('original roster: seven of 29 authenticated sixties have zero Basic Energy', () => {
  const audited = originalSourceEnergyAdmission(roster, manifest.policyOptions);
  assert.equal(audited.originalSources, 29);
  assert.deepEqual(audited.missingFullLists, [23, 25, 28]);
  assert.deepEqual(audited.zeroBasicRanks, [4, 5, 6, 7, 17, 24, 29]);
  assert.equal(audited.distinctEnergyPrintings, 21);
  assert.deepEqual(audited.nominalUnitUnknownPrintings, []);
  assert.deepEqual(audited.conditionalOrUncertainPrintings,
    ['Counter Energy CIN', 'Double Dragon Energy ROS']);
  assert.equal(audited.registeredProfile.bilateralPublicContextSpecialEnergy,
    true);
  assert.equal(audited.sources.filter(x => x.specialOnly).every(x =>
    x.policyGate ===
      'generic-special-option-present-native-proof-required'), true);
  assert.equal(audited.competitivelyQualifiedGames, 0);
});

test('exact original sixty is required; duplicate rank is rejected', () => {
  const good = source(17, [{name: 'Counter Energy', count: 4, set: 'CIN'}]);
  const broken = structuredClone(good);
  broken.cards[0].count--;
  assert.throws(() => originalSourceEnergyAdmission({decks: [broken]}),
    /not 60/);
  assert.throws(() => originalSourceEnergyAdmission({decks: [good, good]}),
    /Duplicate original source rank/);
});
