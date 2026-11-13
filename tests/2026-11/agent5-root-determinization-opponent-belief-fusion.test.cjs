'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createInformationSetMcts,
  observationSha256
} = require('../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs');

/**
 * Characterization test for a known limitation, not a strength assertion.
 *
 * The root player knows its private card. The opponent sees the same public
 * state and a 20% prior probability of a threat in both cases. The current
 * search samples once from the root information set, so the root's private
 * card remains fixed in every determinization and leaks into the opponent's
 * simulated best response through terminal values.
 */
function runRootSearch(rootPrivateCard, useFixedOpponentPolicy = false) {
  const opponentObservationHashes = [];
  const search = createInformationSetMcts({
    iterations: 400,
    maxPlies: 2,
    seed: 123,
    cPuct: 1.4,
    observe: (state, seat) => {
      const observation = seat === 0 ? {
        seat,
        privateCard: state.privateCard,
        public: state.public,
        choice: state.choice
      } : {
        seat,
        public: state.public,
        choice: state.choice
      };
      if (seat === 1) {
        opponentObservationHashes.push(observationSha256(observation));
      }
      return observation;
    },
    activeSeat: state => state.seat,
    enumerateActions: state => state.seat === 0 ?
      [{name: 'commit'}] :
      [{name: 'block'}, {name: 'pass'}],
    actionKey: action => action.name,
    sampleDeterminization: state => ({...state}),
    applyAction: (state, action) => {
      if (state.seat === 0) {
        return {...state, choice: action.name, seat: 1};
      }
      // The opponent wins by blocking a real threat or passing a bluff.
      const opponentWins = state.privateCard === 'threat' ?
        action.name === 'block' :
        action.name === 'pass';
      return {
        ...state,
        terminal: true,
        winner: opponentWins ? 1 : 0
      };
    },
    isTerminal: state => state.terminal === true,
    terminalValue: (state, seat) => state.winner === seat ? 1 : -1,
    evaluateObservation: () => 0,
    ...(useFixedOpponentPolicy ? {
      opponentPolicyId: 'synthetic-belief-optimal-v1',
      opponentActionPolicy: (observation, actionKeys, seat) => {
        assert.equal(seat, 1);
        assert.equal(Object.hasOwn(observation, 'privateCard'), false);
        assert.deepEqual(actionKeys, ['block', 'pass']);
        const p = observation.public.opponentThreatPrior;
        const blockValue = p - (1 - p);
        const passValue = (1 - p) - p;
        return passValue > blockValue ? 'pass' : 'block';
      }
    } : {})
  });

  const result = search.search({
    seat: 0,
    privateCard: rootPrivateCard,
    public: {opponentThreatPrior: 0.2},
    choice: null,
    terminal: false
  }, 0);

  const opponentActions = {block: 0, pass: 0};
  for (const rollout of result.audit.rolloutPaths) {
    for (const action of rollout.actions) {
      if (action.seat === 1) opponentActions[action.actionKey]++;
    }
  }
  return {
    result,
    opponentActions,
    opponentObservationHashes
  };
}

test('characterizes root-determinization strategy fusion across the same opponent information set', () => {
  const threat = runRootSearch('threat');
  const bluff = runRootSearch('bluff');

  // The opponent's public observation is identical; only the root's private
  // hand differs. The root information set correctly differs.
  assert.equal(threat.opponentObservationHashes.length > 0, true);
  assert.equal(bluff.opponentObservationHashes.length > 0, true);
  assert.equal(
    threat.opponentObservationHashes.every(
      hash => hash === threat.opponentObservationHashes[0]
    ),
    true
  );
  assert.equal(
    bluff.opponentObservationHashes.every(
      hash => hash === bluff.opponentObservationHashes[0]
    ),
    true
  );
  assert.equal(
    threat.opponentObservationHashes[0],
    bluff.opponentObservationHashes[0],
    'Opponent information set must be identical across root-private cards'
  );
  assert.notEqual(
    threat.result.audit.rootObservationSha256,
    bluff.result.audit.rootObservationSha256,
    'Root information sets should distinguish the private card'
  );

  // Under the opponent's public prior P(threat)=0.2:
  // E[block] = 0.2*(+1) + 0.8*(-1) = -0.6
  // E[pass]  = 0.2*(-1) + 0.8*(+1) = +0.6
  // Thus pass is the unique belief-optimal response in both worlds.
  const priorThreat = 0.2;
  const expectedBlock = priorThreat - (1 - priorThreat);
  const expectedPass = (1 - priorThreat) - priorThreat;
  assert.ok(expectedPass > expectedBlock);

  // Current root-only determinization instead acts as if the opponent knows
  // the actual root-private card, producing different responses.
  assert.ok(threat.opponentActions.block > 350);
  assert.ok(bluff.opponentActions.pass > 350);
  assert.ok(threat.opponentActions.block > threat.opponentActions.pass);
  assert.ok(bluff.opponentActions.pass > bluff.opponentActions.block);
});

test('fixed opponent policy uses only its observation and avoids root-private strategy fusion', () => {
  const threat = runRootSearch('threat', true);
  const bluff = runRootSearch('bluff', true);

  assert.equal(
    threat.result.audit.opponentModel,
    'fixed-actor-observation-policy'
  );
  assert.equal(
    threat.result.audit.opponentPolicyId,
    'synthetic-belief-optimal-v1'
  );
  assert.equal(threat.result.audit.opponentPolicyCalls, 400);
  assert.equal(bluff.result.audit.opponentPolicyCalls, 400);
  assert.equal(threat.result.audit.opponentInformationSetCount, 1);
  assert.equal(bluff.result.audit.opponentInformationSetCount, 1);
  assert.equal(threat.result.audit.maxActionTransitions, 2);
  assert.equal(bluff.result.audit.maxActionTransitions, 2);
  assert.deepEqual(threat.opponentActions, {block: 0, pass: 400});
  assert.deepEqual(bluff.opponentActions, {block: 0, pass: 400});
  assert.equal(
    threat.opponentObservationHashes[0],
    bluff.opponentObservationHashes[0]
  );
  assert.equal(threat.result.audit.rootActions[0].meanValue, 1);
  assert.equal(bluff.result.audit.rootActions[0].meanValue, -1);
});

test('rejects a fixed opponent policy action outside its visible frontier', () => {
  const search = createInformationSetMcts({
    iterations: 1,
    maxPlies: 2,
    observe: (state, seat) => ({seat, public: state.public}),
    activeSeat: state => state.seat,
    enumerateActions: state => state.seat === 0 ?
      [{name: 'commit'}] :
      [{name: 'block'}, {name: 'pass'}],
    actionKey: action => action.name,
    sampleDeterminization: state => ({...state}),
    applyAction: (state, action) => state.seat === 0 ?
      ({...state, seat: 1}) :
      ({...state, terminal: true, winner: 0}),
    isTerminal: state => state.terminal === true,
    terminalValue: (state, seat) => state.winner === seat ? 1 : -1,
    evaluateObservation: () => 0,
    opponentPolicyId: 'invalid-action-policy',
    opponentActionPolicy: () => 'hidden-illegal-action'
  });
  assert.throws(
    () => search.search({
      seat: 0,
      public: {opponentThreatPrior: 0.2},
      terminal: false
    }, 0),
    /outside its observation-safe frontier/
  );
});
