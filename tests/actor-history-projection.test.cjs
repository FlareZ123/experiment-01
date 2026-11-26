'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  projectActorVisibleHistory,
  createActorObservationWithHistory
} = require('../simulation/twinleaf/actor-history-projection.cjs');

function fixtureState() {
  return {
    players: [{ id: 10 }, { id: 20 }],
    logs: [
      { id: 1, client: 20, message: 'PUBLIC_OPPONENT_ACTION', params: { card: 'Quick Ball', timestamp: '10:01:00' } },
      { id: 2, client: 20, message: 'OPPONENT_PRIVATE', params: { private: 'true', secret: 'opponent-only', timestamp: '10:02:00' } },
      { id: 3, client: 10, message: 'ACTOR_PRIVATE', params: { private: true, choice: 'own-prize', timestamp: '10:03:00' } },
      { id: 4, client: 0, message: 'SYSTEM_PRIVATE', params: { private: 'true', result: true, timestamp: '10:04:00' } },
      { id: 5, message: 'PRIVATE_WITHOUT_CLIENT', params: { private: true, secret: 'must-not-be-visible' } }
    ]
  };
}

test('projects public, actor-private, and system logs with the UI visibility boundary', () => {
  const state = fixtureState();
  const projected = projectActorVisibleHistory(state, 0, {
    ownDecisionHistory: [{ kind: 'prompt-choice', key: 'choose-prize', result: 'prize-1' }],
    historySource: 'unsanitized-store-plus-own-trace',
    historyComplete: true,
    includeVisibleLogs: true,
    includeOwnDecisionHistory: true
  });

  assert.deepEqual(projected.visibleLogs.map(log => log.id), [1, 3, 4]);
  assert.equal(projected.visibleLogs[0].clientSeat, 1);
  assert.equal(projected.visibleLogs[1].clientSeat, 0);
  assert.equal(projected.visibleLogs[2].isSystem, true);
  assert.equal(Object.hasOwn(projected.visibleLogs[0].params, 'timestamp'), false);
  assert.deepEqual(projected.ownDecisionHistory, [
    { kind: 'prompt-choice', key: 'choose-prize', result: 'prize-1' }
  ]);
  assert.equal(projected.actorHistoryComplete, true);
  assert.match(projected.actorHistorySha256, /^[a-f0-9]{64}$/);
  assert.equal(state.logs[0].params.timestamp, '10:01:00',
    'projection must not mutate the Store log');
});

test('visibility is perspective-relative and wall-clock timestamps do not affect the digest', () => {
  const state = fixtureState();
  const seat0 = projectActorVisibleHistory(state, 0);
  const seat1 = projectActorVisibleHistory(state, 1);

  assert.notEqual(seat0.actorHistorySha256, seat1.actorHistorySha256);
  assert.equal(seat0.visibleLogCount, 3);
  assert.equal(seat1.visibleLogCount, 3);

  const changedClock = fixtureState();
  for (const log of changedClock.logs) {
    if (log.params) log.params.timestamp = '23:59:59';
  }
  const sameHistory = projectActorVisibleHistory(changedClock, 0);
  assert.equal(seat0.actorHistorySha256, sameHistory.actorHistorySha256);

  const changedDecision = projectActorVisibleHistory(state, 0, {
    ownDecisionHistory: [{ kind: 'prompt-choice', key: 'choose-prize', result: 'prize-2' }]
  });
  assert.notEqual(seat0.actorHistorySha256, changedDecision.actorHistorySha256);
});

test('wraps a base actor observation with a per-seat history key', () => {
  const state = fixtureState();
  const baseActorObservation = (currentState, seat) => ({
    actorSeat: seat,
    publicTurn: 4
  });
  const withHistory = createActorObservationWithHistory(
    baseActorObservation,
    (currentState, seat) => ({
      ownDecisionHistory: [{ kind: 'action', key: seat === 0 ? 'play-supporter' : 'pass' }],
      historySource: 'unsanitized-store-plus-seat-trace',
      historyComplete: false,
      includeVisibleLogs: true,
      includeOwnDecisionHistory: true
    })
  );
  const view = withHistory(state, 0);
  assert.equal(view.actorSeat, 0);
  assert.equal(view.publicTurn, 4);
  assert.match(view.actorHistorySha256, /^[a-f0-9]{64}$/);
  assert.equal(view.actorHistoryComplete, false);
  assert.equal(view.actorHistorySource, 'unsanitized-store-plus-seat-trace');
  assert.ok(Array.isArray(view.actorVisibleHistory));
  assert.deepEqual(view.actorOwnDecisionHistory, [{ kind: 'action', key: 'play-supporter' }]);
  assert.equal(Object.isFrozen(view), true);
  assert.equal(Object.isFrozen(view.actorVisibleHistory), true);
});

test('does not certify complete history without an explicit source', () => {
  assert.throws(
    () => projectActorVisibleHistory(fixtureState(), 0, { historyComplete: true }),
    /ACTOR_HISTORY_COMPLETE_REQUIRES_EXPLICIT_SOURCE/
  );
});

test('rejects an empty history source attestation', () => {
  assert.throws(
    () => projectActorVisibleHistory(fixtureState(), 0, { historyComplete: true, historySource: '   ' }),
    /ACTOR_HISTORY_SOURCE_MUST_BE_NONEMPTY/
  );
});

test('strictly rejects accessor log data without invoking getters', () => {
  let getterCalls = 0;
  const params = { private: false };
  Object.defineProperty(params, 'card', {
    enumerable: true,
    get() {
      getterCalls += 1;
      return 'Hidden';
    }
  });
  const state = {
    players: [{ id: 10 }, { id: 20 }],
    logs: [{ id: 1, client: 20, message: 'PUBLIC', params }]
  };

  assert.throws(() => projectActorVisibleHistory(state, 0), /ACTOR_HISTORY_NON_JSON/);
  assert.equal(getterCalls, 0);
});

test('does not inspect the payload of an opponent-private log', () => {
  let getterCalls = 0;
  const params = { private: true };
  Object.defineProperty(params, 'secret', {
    enumerable: true,
    get() {
      getterCalls += 1;
      return 'must-not-be-read';
    }
  });
  const state = {
    players: [{ id: 10 }, { id: 20 }],
    logs: [{ id: 1, client: 20, message: 'PRIVATE', params }]
  };

  const projected = projectActorVisibleHistory(state, 0, { includeVisibleLogs: true });
  assert.deepEqual(projected.visibleLogs, []);
  assert.equal(getterCalls, 0);
});

test('fails closed on a private-flag accessor', () => {
  let getterCalls = 0;
  const params = {};
  Object.defineProperty(params, 'private', {
    enumerable: true,
    get() {
      getterCalls += 1;
      return true;
    }
  });
  const state = {
    players: [{ id: 10 }, { id: 20 }],
    logs: [{ id: 1, client: 20, message: 'PRIVATE', params }]
  };

  assert.throws(() => projectActorVisibleHistory(state, 0), /ACTOR_HISTORY_ACCESSOR_PRIVATE_FLAG/);
  assert.equal(getterCalls, 0);
});
