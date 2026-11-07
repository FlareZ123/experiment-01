'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  runSnapTrapPrismStarDestinationContract
} = require('../../simulation/twinleaf/agent12/snap-trap-prism-star-destination-native-v1.cjs');

test('Snap Trap routes the same physical Beast Energy Prism Star to Lost Zone', () => {
  const result = runSnapTrapPrismStarDestinationContract();
  const artifactDirectory = path.resolve(process.cwd(), 'artifacts');
  const artifactPath = path.join(artifactDirectory,
    'agent12-snap-trap-prism-star-destination-v1.json');
  const temporaryPath = artifactPath + '.tmp';
  fs.mkdirSync(artifactDirectory, {recursive: true});
  fs.writeFileSync(temporaryPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
  fs.renameSync(temporaryPath, artifactPath);

  assert.equal(result.schema, 'agent12-snap-trap-prism-star-destination-v1');
  assert.ok(result.scenario.selectedEnergy.includes('Beast Energy'));
  assert.equal(result.prompt.promptResultIsSamePhysicalEnergy, true);
  assert.equal(result.prompt.unresolvedPromptCountAfterResponse, 0);
  assert.equal(result.prompt.otherPendingPromptCountAfterResponse, 1);
  assert.equal(result.prompt.postResponseWaitPromptType, 'WaitPrompt');
  assert.equal(result.prompt.postResponseWaitPromptResolvedWithNull, true);
  assert.equal(result.prompt.unresolvedPromptCountAfterFinalWait, 0);
  assert.equal(result.moveCardsEffect.requestedDestinationIsDiscard, true);
  assert.equal(result.moveCardsEffect.sameSelectedEnergyReference, true);
  assert.equal(result.resolution.selectedEnergyInLostZone, true);
  assert.equal(result.resolution.selectedEnergyAbsentFromDiscard, true);
  assert.equal(result.resolution.unselectedPsychicEnergyRemains, true);
  assert.equal(result.competitiveGamesQualified, 0);
  assert.equal(result.winRateEstimate, null);
});
