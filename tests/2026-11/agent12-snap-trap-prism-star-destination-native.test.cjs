'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  runSnapTrapPrismStarDestinationContract
} = require('../../simulation/twinleaf/agent12/snap-trap-prism-star-destination-native-v1.cjs');

test('Snap Trap routes the same physical Beast Energy Prism Star to Lost Zone', () => {
  const result = runSnapTrapPrismStarDestinationContract();

  assert.equal(result.schema, 'agent12-snap-trap-prism-star-destination-v1');
  assert.ok(result.scenario.selectedEnergy.includes('Beast Energy'));
  assert.equal(result.prompt.promptResultIsSamePhysicalEnergy, true);
  assert.equal(result.prompt.unresolvedPromptCountAfterResponse, 0);
  assert.equal(result.moveCardsEffect.requestedDestinationIsDiscard, true);
  assert.equal(result.moveCardsEffect.sameSelectedEnergyReference, true);
  assert.equal(result.resolution.selectedEnergyInLostZone, true);
  assert.equal(result.resolution.selectedEnergyAbsentFromDiscard, true);
  assert.equal(result.resolution.unselectedPsychicEnergyRemains, true);
  assert.equal(result.competitiveGamesQualified, 0);
  assert.equal(result.winRateEstimate, null);
});
