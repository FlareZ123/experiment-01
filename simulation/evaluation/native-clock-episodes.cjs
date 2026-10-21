'use strict';

const assert = require('node:assert/strict');
const {
  ROOT_PROTOCOL, RESET_PROTOCOL
} = require('./native-clock-trace-adapter.cjs');

const MODEL_VERSION = 'native-public-clock-episode-partition-v1';

/**
 * Validate observable Store turn chronology and partition one registered
 * match into restart episodes. A reset action itself is a boundary.
 *
 * A structurally valid restart still requires independently authenticated
 * same-run Store capture, a fresh deal proof, a paper tiebreak adjudicator,
 * and correct terminal attribution before use in competitive inference.
 *
 * @param {object} native Original headless result with root and reset ledgers.
 * @returns {object} Observational episode partition, never a win certificate.
 */
function segmentNativeClockEpisodes(native) {
  assert.equal(native.rootActionLedgerProtocol, ROOT_PROTOCOL);
  assert.equal(native.suddenDeathClockResetProtocol, RESET_PROTOCOL);
  assert.ok(Array.isArray(native.rootActionLedger));
  assert.ok(Array.isArray(native.suddenDeathClockResets));
  assert.equal(native.actions, native.rootActionLedger.length);
  assert.ok(Number.isSafeInteger(native.actions) && native.actions > 0);
  const resets = new Map();
  for (const reset of native.suddenDeathClockResets) {
    assert.ok(Number.isSafeInteger(reset.actionOrdinal));
    assert.ok(!resets.has(reset.actionOrdinal),
      'Native clock reset ordinal must be unique');
    resets.set(reset.actionOrdinal, reset);
  }

  let episode = 0;
  let previousAfter = null;
  const rootEpisodes = [];
  const boundaries = [];
  for (const [ordinal, root] of native.rootActionLedger.entries()) {
    assert.equal(root.actionOrdinal, ordinal, 'Root ordinals must be contiguous');
    assert.ok(Number.isSafeInteger(root.turnBefore) &&
      Number.isSafeInteger(root.turnAfter) &&
      root.turnBefore >= 0 && root.turnAfter >= 0,
      'Native root turns must be nonnegative exact integers');
    assert.ok(root.playerSlot === -1 || root.playerSlot === 0 ||
      root.playerSlot === 1, 'Unknown native player slot');
    assert.ok(typeof root.action === 'string' && root.action.length > 0,
      'Missing native root action');
    if (previousAfter !== null) assert.equal(root.turnBefore, previousAfter,
      'Native turn clock has a gap between Store roots');

    const reset = resets.get(ordinal);
    const reversesClock = root.turnAfter < root.turnBefore;
    assert.equal(Boolean(reset), reversesClock,
      'Native reset ledger does not match observed clock reversal');
    if (reset) {
      assert.equal(reset.fromTurn, root.turnBefore);
      assert.equal(reset.toTurn, root.turnAfter);
      assert.equal(reset.actingSeat, root.playerSlot);
      assert.equal(reset.action, root.action);
      assert.equal(reset.afterSuddenDeath, true,
        'Reset must show native sudden-death state');
      assert.equal(reset.enteredSetup, true,
        'Reset must have entered a fresh native setup phase');
      assert.ok(reset.fromPhase !== undefined && reset.toPhase !== undefined,
        'Reset requires before/after phase evidence');
      boundaries.push({
        actionOrdinal: ordinal,
        episodeBefore: episode,
        episodeAfter: episode + 1,
        fromTurn: reset.fromTurn,
        toTurn: reset.toTurn,
        actingSeat: root.playerSlot,
        action: root.action,
        fromPhase: reset.fromPhase,
        toPhase: reset.toPhase
      });
    }
    rootEpisodes.push({
      actionOrdinal: ordinal,
      episodeBefore: episode,
      episodeAfter: episode + Number(Boolean(reset)),
      boundary: Boolean(reset),
      turnBefore: root.turnBefore,
      turnAfter: root.turnAfter,
      playerSlot: root.playerSlot,
      action: root.action
    });
    if (reset) episode += 1;
    previousAfter = root.turnAfter;
  }
  assert.equal(boundaries.length, resets.size,
    'Unmatched native clock reset events');
  return {
    modelVersion: MODEL_VERSION,
    actionCount: native.actions,
    outerRegisteredTrials: 1,
    observedEpisodeCount: episode + 1,
    boundaries,
    rootEpisodes,
    competitiveQualified: false,
    requiresPerEpisodeDealAndTiebreakCertification: episode > 0
  };
}

/**
 * Return one episode index for an ordered pressure, reply and continuation
 * root sequence, or throw on a reset boundary or crossing.
 *
 * @param {object} partition segmentNativeClockEpisodes result.
 * @param {number[]} ordinals Native root action ordinals in expected order.
 * @returns {number}
 */
function requireOneEpisode(partition, ordinals) {
  assert.ok(Array.isArray(ordinals) && ordinals.length > 0);
  let previous = -1;
  let episode = null;
  for (const ordinal of ordinals) {
    assert.ok(Number.isSafeInteger(ordinal) && ordinal > previous,
      'Required roots must be in strictly increasing ordinal order');
    const root = partition.rootEpisodes[ordinal];
    assert.ok(root && root.actionOrdinal === ordinal, 'Unknown root ordinal');
    assert.equal(root.boundary, false,
      'A clock reset action cannot be a source pressure or reply');
    if (episode !== null) assert.equal(root.episodeBefore, episode,
      'Source pressure/reply/continuation crosses native game episodes');
    episode = root.episodeBefore;
    previous = ordinal;
  }
  return episode;
}

module.exports = {MODEL_VERSION, segmentNativeClockEpisodes, requireOneEpisode};
