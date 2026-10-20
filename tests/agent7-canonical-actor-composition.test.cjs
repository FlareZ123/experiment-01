'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION, withCanonicalActorOnlyPolicy
} = require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');

/** @param {string} name @param {object} audit @param {string[]} order */
function fakeAdapter(name, audit, order) {
  return execute => {
    order.push('install:' + name);
    const result = execute();
    order.push('restore:' + name);
    return {result, audit: {version: name, ...audit}};
  };
}

test('canonical composition dispatch order preserves the exact execution result', () => {
  const order = [];
  const expected = {rows: [{trial: 'rank6'}], competitiveQualifiedGames: 0};
  const adapters = {
    root: fakeAdapter('root', {
      selectedRootDecisions: 5, acceptedActorRoots: 5,
      rejectedActorRoots: 0, unsupportedPromptFallbacks: 3
    }, order),
    fog: fakeAdapter('fog', {
      fogItemRootNativeAccepted: 2, fogPromptNativeAccepted: 2,
      unsupportedPrompts: 5
    }, order),
    select: fakeAdapter('select', {selected: 2, accepted: 2,
      unsupportedPromptFallbacks: 4
    }, order),
    option: fakeAdapter('option', {
      acceptedPromptActions: 1, unsupportedPromptDelegations: 6
    }, order),
    attack: fakeAdapter('attack', {
      accepted: 1, nativeFallbacks: 7
    }, order)
  };
  const observed = withCanonicalActorOnlyPolicy(() => {
    order.push('native:canonical');
    return expected;
  }, adapters);
  assert.strictEqual(observed.result, expected);
  assert.deepEqual(order, [
    'install:root', 'install:fog', 'install:select', 'install:option', 'install:attack',
    'native:canonical',
    'restore:attack', 'restore:option', 'restore:select', 'restore:fog', 'restore:root'
  ]);
  assert.equal(observed.audit.version, VERSION);
  assert.deepEqual(observed.audit.selectedHandlerPriority, [
    'ChooseAttackPrompt', 'SelectOptionPrompt', 'SelectPrompt',
    'FogCrystalRootAndOwnerDeckSearch', 'ActorOnlyRoot'
  ]);
  assert.equal(observed.audit.nativeDecisionCounts.actorRootsAccepted, 5);
  assert.equal(observed.audit.nativeDecisionCounts.fogOwnerPromptAccepted, 2);
  assert.equal(observed.audit.nativeDecisionCounts.chooseAttackAccepted, 1);
  assert.equal(observed.audit.nativeDecisionCounts.selectOptionAccepted, 1);
  assert.equal(observed.audit.nativeDecisionCounts.selectAccepted, 2);
});

test('nested prompt delegates are overlapping observations, not extra successes', () => {
  const order = [];
  const make = (name, audit) => fakeAdapter(name, audit, order);
  const observed = withCanonicalActorOnlyPolicy(() => 'native',
    {
      root: make('root', {unsupportedPromptFallbacks: 2}),
      fog: make('fog', {unsupportedPrompts: 4}),
      select: make('select', {unsupportedPromptFallbacks: 6}),
      option: make('option', {unsupportedPromptDelegations: 5}),
      attack: make('attack', {nativeFallbacks: 9})
    });
  assert.equal(observed.audit.nativeDecisionCounts.lastChanceGenericPromptFallbacks, 2);
  assert.deepEqual(observed.audit.overlappingDelegationObservations, {
    chooseAttack: 9, selectOption: 5, select: 6, fog: 4, lastChanceRoot: 2,
    warning: 'Nested delegation counters overlap. The root is the final fallback.'
  });
  assert.equal(observed.audit.qualification.fullyActorOnly, false);
  assert.equal(observed.audit.qualification.competitiveGames, 0);
  assert.equal(observed.audit.qualification.paperClockQualified, false);
});

test('composing a partially implemented actor policy cannot self-certify games', () => {
  const wrap = name => fakeAdapter(name, {}, []);
  const observed = withCanonicalActorOnlyPolicy(
    () => ({rows: [{finished: true, winner: 0}], competitiveQualifiedGames: 0}),
    {root: wrap('root'), fog: wrap('fog'), select: wrap('select'),
      option: wrap('option'), attack: wrap('attack')}
  );
  assert.equal(observed.audit.nativeDecisionCounts.lastChanceGenericPromptFallbacks,
    null);
  assert.equal(observed.audit.qualification.competitiveGames, 0);
  assert.equal(observed.audit.qualification.sourcePolicyCompetenceEstablished, false);
  assert.equal(observed.result.rows[0].finished, true);
});
