'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION, withBilateralOwnerMail
} = require('../../simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs');

class FakeAi {
  decodeNextAction() { return null; }
}

class FakeStore {
  dispatch(action) { return action; }
}

class PlayCardAction {}
class ResolvePromptAction {}

test('four registered original v8 trial IDs install and restore Mail wrapper', () => {
  const originalRun = function runMatch(request) {
    return {label: request.label};
  };
  const originalAi = Object.getOwnPropertyDescriptor(
    FakeAi.prototype, 'decodeNextAction');
  const originalDispatch = Object.getOwnPropertyDescriptor(
    FakeStore.prototype, 'dispatch');
  const headless = {runMatch: originalRun};
  const trialIds = [
    '3:312:B:champion-reference',
    '3:312:A:champion-reference',
    '3:213:A:champion-reference',
    '3:213:B:champion-reference'
  ];
  const {result, audit} = withBilateralOwnerMail(
    () => headless.runMatch({label: 'native:' + trialIds[0]}),
    {headless, SimpleTacticsAi: FakeAi, Store: FakeStore,
      PlayCardAction, ResolvePromptAction, types: {}, trialIds}
  );
  assert.equal(VERSION, 'agent38-v8-owner-mail-four-arm-native-v1');
  assert.equal(result.label, 'native:' + trialIds[0]);
  assert.deepEqual(audit.trialIds, trialIds);
  assert.equal(audit.attempts, 1);
  assert.deepEqual(audit.actualMailItemRootsBySeat, [0, 0]);
  assert.strictEqual(headless.runMatch, originalRun);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeAi.prototype, 'decodeNextAction'), originalAi);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeStore.prototype, 'dispatch'), originalDispatch);
});

test('reject duplicate or empty trial registrations without installing hooks', () => {
  const headless = {runMatch: () => null};
  const deps = {
    headless, SimpleTacticsAi: FakeAi, Store: FakeStore,
    PlayCardAction, ResolvePromptAction, types: {}
  };
  assert.throws(() => withBilateralOwnerMail(() => null, {
    ...deps, trialIds: ['duplicate', 'duplicate']
  }), /must be unique/);
  assert.throws(() => withBilateralOwnerMail(() => null, {
    ...deps, trialIds: []
  }), /at least one registered trial/);
  assert.strictEqual(headless.runMatch, deps.headless.runMatch);
});
