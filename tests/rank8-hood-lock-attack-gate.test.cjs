'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {assessRank8HoodSource} = require('../simulation/twinleaf/rank8-hood-lock-attack-gate.cjs');

/** @param {number} turn @param {number} damage @param {string[]} energy @param {string[]} tools */
function terminal(turn, damage, energy, tools = []) {
  return {
    turn, actingSeat: 0, action: 'AttackAction', declaredName: 'Terminal Period',
    opponentDarknessDiscardBefore: 0,
    attackBefore: {name: 'Mega Absol ex', energy},
    targetBefore: {name: 'Shadow Rider Calyrex VMAX', damage},
    visibleBefore: {
      actor: {active: {name: 'Mega Absol ex', tools: ['Float Stone']},
        bench: [{name: 'Garbodor', tools}]},
      other: {active: {name: 'Shadow Rider Calyrex VMAX',
        tools: ['Stealthy Hood']}, bench: []}
    }
  };
}

/** @param {object[]} events */
function audit(events) {
  return {
    seed: 1260748957, physicalCandidateSeat: 'B',
    actualCandidateTurn: 'second',
    exactFullActionStreamNoninterference: true,
    actionStreamSha256: 'fixed-test-source',
    chronologicalBoardEvents: events
  };
}

/** @param {string[]} opponentGarbodorTools */
function door(opponentGarbodorTools) {
  return {
    turn: 8, actingSeat: 1, action: 'UseAbilityAction',
    declaredName: 'Underworld Door',
    visibleBefore: {
      actor: {active: {name: 'Shadow Rider Calyrex VMAX',
        tools: ['Stealthy Hood']}, bench: []},
      other: {active: {name: 'Mega Absol ex', tools: ['Float Stone']},
        bench: [{name: 'Garbodor', tools: opponentGarbodorTools}]}
    }
  };
}

test('observed 4 Terminal Period attacks are paid but cannot KO, no equipped lock', () => {
  const events = [door([]), door([]),
    ...[9, 11, 13, 15].map(turn =>
      terminal(turn, 0, ['Darkness Energy', 'Lightning Energy']))];
  const result = assessRank8HoodSource(audit(events));
  assert.equal(result.observedUnderworldDoorCount, 2);
  assert.equal(result.protectedUnderworldDoorAgainstEquippedGarbodor, 0);
  assert.deepEqual(result.equippedGarbodorObservedTurns, []);
  assert.equal(result.terminalPeriod.length, 4);
  assert.equal(result.terminalPeriodKnockoutConditionsMet, 0);
  assert.equal(result.terminalTurnsWithClawEnergy, 0);
  assert.equal(result.terminalTurnsWithDiscardDarknessForPatch, 0);
  assert.ok(result.terminalPeriod.every(x => x.terminalPeriodEnergySatisfied));
  console.log('Observed-source derived gate:', JSON.stringify(result));
});

test('positive controls expose payability, exact damage and equipped Garbodor', () => {
  const event = terminal(9, 60, [
    'Darkness Energy', 'Darkness Energy', 'Lightning Energy'
  ], ['Float Stone']);
  event.opponentDarknessDiscardBefore = 1;
  const result = assessRank8HoodSource(audit([event, door(['Float Stone'])]));
  assert.equal(result.terminalPeriodKnockoutConditionsMet, 1);
  assert.equal(result.terminalTurnsWithClawEnergy, 1);
  assert.equal(result.terminalTurnsWithDiscardDarknessForPatch, 1);
  assert.equal(result.protectedUnderworldDoorAgainstEquippedGarbodor, 1);
  assert.deepEqual(result.equippedGarbodorObservedTurns, [8, 9]);
  console.log('Positive-control derived gate:', JSON.stringify(result));
});

test('wrong seed, seat, or missing replay proof fail closed', () => {
  assert.throws(() => assessRank8HoodSource({...audit([]), seed: 2}));
  assert.throws(() => assessRank8HoodSource({...audit([]),
    actualCandidateTurn: 'first'}));
  assert.throws(() => assessRank8HoodSource({...audit([]),
    exactFullActionStreamNoninterference: false}));
});
