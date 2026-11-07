'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  runSnapTrapSourceToSettlementContract
} = require('../../simulation/twinleaf/agent12/snap-trap-source-to-settlement-native-v1.cjs');

test('Snap Trap source marker, public zone observer and Prism Star settlement join on one prompt', () => {
  const result = runSnapTrapSourceToSettlementContract();
  const artifactDirectory = path.resolve(process.cwd(), 'artifacts');
  const artifactPath = path.join(artifactDirectory,
    'agent12-snap-trap-source-to-settlement-native-v1.json');
  const temporaryPath = artifactPath + '.tmp';
  fs.mkdirSync(artifactDirectory, {recursive: true});
  fs.writeFileSync(temporaryPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
  fs.renameSync(temporaryPath, artifactPath);

  assert.equal(result.schema, 'agent12-snap-trap-source-to-settlement-native-v1');
  assert.equal(result.sourceMarkerAudit.printedSourceInvocations, 1);
  assert.equal(result.promptZoneObserverAudit.promptCount, 1);
  assert.equal(result.promptZoneObserverAudit.events[0].sourceMarkerSamePromptObject, true);
  assert.equal(result.settlement.prompt.promptResultIsSamePhysicalEnergy, true);
  assert.equal(result.settlement.resolution.selectedEnergyInLostZone, true);
  assert.equal(result.settlement.competitiveGamesQualified, 0);
  assert.equal(result.winRateEstimate, null);
});
