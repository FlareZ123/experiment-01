'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  segmentNativeClockEpisodes, requireOneEpisode
} = require('../simulation/evaluation/native-clock-episodes.cjs');
const {
  ROOT_PROTOCOL, RESET_PROTOCOL
} = require('../simulation/evaluation/native-clock-trace-adapter.cjs');

/** @returns {object} */
function source() {
  return {
    rootActionLedgerProtocol: ROOT_PROTOCOL,
    suddenDeathClockResetProtocol: RESET_PROTOCOL,
    actions: 5,
    rootActionLedger: [
      {actionOrdinal: 0, turnBefore: 0, turnAfter: 1, playerSlot: 0, action: 'SetupAction'},
      {actionOrdinal: 1, turnBefore: 1, turnAfter: 2, playerSlot: 1, action: 'PlayCardAction'},
      {actionOrdinal: 2, turnBefore: 2, turnAfter: 0, playerSlot: 1, action: 'ResolvePromptAction'},
      {actionOrdinal: 3, turnBefore: 0, turnAfter: 1, playerSlot: 0, action: 'SetupAction'},
      {actionOrdinal: 4, turnBefore: 1, turnAfter: 2, playerSlot: 1, action: 'PlayCardAction'}
    ],
    suddenDeathClockResets: [
      {actionOrdinal: 2, actingSeat: 1, action: 'ResolvePromptAction',
        fromTurn: 2, toTurn: 0, fromPhase: 3, toPhase: 0,
        beforeSuddenDeath: false, afterSuddenDeath: true, enteredSetup: true}
    ]
  };
}

test('partitions legitimate-shape native clock reversal as boundary, not two trials', () => {
  const partition = segmentNativeClockEpisodes(source());
  assert.equal(partition.observedEpisodeCount, 2);
  assert.equal(partition.outerRegisteredTrials, 1);
  assert.equal(partition.boundaries.length, 1);
  assert.equal(partition.boundaries[0].actionOrdinal, 2);
  assert.equal(partition.rootEpisodes[2].boundary, true);
  assert.equal(partition.rootEpisodes[2].episodeBefore, 0);
  assert.equal(partition.rootEpisodes[2].episodeAfter, 1);
  assert.equal(requireOneEpisode(partition, [0, 1]), 0);
  assert.equal(requireOneEpisode(partition, [3, 4]), 1);
  assert.equal(partition.competitiveQualified, false);
  assert.equal(partition.requiresPerEpisodeDealAndTiebreakCertification, true);
});

test('rejects source pressure and candidate reply crossing native restart', () => {
  const partition = segmentNativeClockEpisodes(source());
  assert.throws(() => requireOneEpisode(partition, [1, 3]),
    /crosses native game episodes/);
  assert.throws(() => requireOneEpisode(partition, [1, 2]), /reset action/);
  assert.throws(() => requireOneEpisode(partition, [3, 3]), /increasing/);
  assert.throws(() => requireOneEpisode(partition, [1, 8]), /Unknown root/);
});

test('rejects unreported reversal and falsely declared reset on no reversal', () => {
  const first = source();
  first.suddenDeathClockResets = [];
  assert.throws(() => segmentNativeClockEpisodes(first), /does not match/);
  const second = source();
  second.rootActionLedger[2].turnAfter = 2;
  second.rootActionLedger[3].turnBefore = 2;
  assert.throws(() => segmentNativeClockEpisodes(second), /does not match/);
});

test('rejects discontinuity, duplicate reset ordinal and forged event identity', () => {
  const first = source();
  first.rootActionLedger[3].turnBefore = 3;
  assert.throws(() => segmentNativeClockEpisodes(first), /gap between Store roots/);
  const second = source();
  second.suddenDeathClockResets.push({
    ...second.suddenDeathClockResets[0]
  });
  assert.throws(() => segmentNativeClockEpisodes(second), /must be unique/);
  const third = source();
  third.suddenDeathClockResets[0].actingSeat = 0;
  assert.throws(() => segmentNativeClockEpisodes(third));
});

test('requires reset evidence for new setup and keeps terminal unqualified', () => {
  const a = source();
  a.suddenDeathClockResets[0].enteredSetup = false;
  assert.throws(() => segmentNativeClockEpisodes(a), /fresh native setup/);
  const b = source();
  b.suddenDeathClockResets[0].toPhase = undefined;
  assert.throws(() => segmentNativeClockEpisodes(b), /phase evidence/);
  const c = source();
  c.suddenDeathClockResets[0].afterSuddenDeath = false;
  assert.throws(() => segmentNativeClockEpisodes(c), /sudden-death state/);
});

test('single-epoch native trace remains structurally valid and inconclusive', () => {
  const one = source();
  one.rootActionLedger = one.rootActionLedger.slice(0, 2);
  one.actions = 2;
  one.suddenDeathClockResets = [];
  const partition = segmentNativeClockEpisodes(one);
  assert.equal(partition.observedEpisodeCount, 1);
  assert.equal(partition.outerRegisteredTrials, 1);
  assert.equal(partition.boundaries.length, 0);
  assert.equal(requireOneEpisode(partition, [0, 1]), 0);
  assert.equal(partition.competitiveQualified, false);
  assert.equal(partition.requiresPerEpisodeDealAndTiebreakCertification, false);
});
