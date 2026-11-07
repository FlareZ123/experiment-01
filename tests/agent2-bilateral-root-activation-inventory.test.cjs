'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const RUNNER = path.resolve(__dirname, '../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const CANONICAL = path.resolve(__dirname, '../simulation/evaluation/agent7-canonical-actor-composition.cjs');

/**
 * Check that every independent conditional root option actually activates the
 * scoped wrapper. This is a static preflight, not an executed Store receipt.
 * Nested modifiers are exempt only when their parent activation is enforced.
 *
 * @param {string} runner Current bilateral development adapter source.
 * @param {string} canonical Current canonical actor composition source.
 * @returns {{guards:number,conditionalOptions:number,nested:string[]}}
 */
function auditScopedRootActivation(runner, canonical) {
  const start = runner.indexOf('const scopedRoot=');
  const end = runner.indexOf(
    'paidRetreatWrapperActivation=paidRetreatRootWrapperActivationReceipt', start);
  assert.ok(start >= 0 && end > start, 'Scoped root boundaries changed');
  const block = runner.slice(start, end);
  const cut = block.indexOf(')?{}:');
  assert.ok(cut > 0 && block.includes('.withActorOnlyRootPolicy(work,{'),
    'Default-off ternary and live root implementation must be present');

  const guards = new Set(
    [...block.slice(0, cut).matchAll(/!(\w+)(?:\.enabled)?/g)]
      .map(match => match[1]));
  const conditionalOptions = [...new Set(
    [...block.matchAll(/\.\.\.\((\w+)\?\{/g)].map(match => match[1]))];

  // These select root helpers rather than appearing as conditional spreads.
  const helperActivators = [
    'energyProfile', 'bilateralJetBenchSwitchRoot',
    'bilateralConservativeShuffleRoot',
    'actorTwoUnitPaidRetreatRoot', 'actorTwoUnitPaidRetreatRootV2'
  ];
  const nested = {
    actorUnderworldActiveFundingPriority: 'actorUnderworldDoorRoot',
    registeredToolEnergyCeiling: 'sameRootProposalChoice',
    nativeOwnerTrainerFallback: 'canonical fallback'
  };
  const missing = [...new Set([...conditionalOptions, ...helperActivators])]
    .filter(flag => !guards.has(flag) && !Object.hasOwn(nested, flag));
  assert.deepEqual(missing, [], 'Requested root options silently lack activation');

  const observedNested = conditionalOptions.filter(
    flag => !guards.has(flag) && Object.hasOwn(nested, flag));
  assert.deepEqual(observedNested, [
    'actorUnderworldActiveFundingPriority',
    'nativeOwnerTrainerFallback',
    'registeredToolEnergyCeiling'
  ], 'Reaudit newly dependent root options before allowing a silent exception');

  assert.match(runner,
    /assert\.ok\(!actorUnderworldActiveFundingPriority\|\|\s*\(actorUnderworldDoorRoot&&actorOnlyComposition\)/);
  assert.match(runner,
    /assert\.ok\(!registeredToolEnergyCeiling\|\|\s*\(nativeToolAttachRoot&&sameRootChoiceApply&&actorOnlyComposition\)/);
  assert.match(canonical,
    /options\.nativeOwnerTrainerFallback===true[\s\S]{0,80}work=>defaultRoot\(work,/);
  assert.match(runner,
    /paidRetreatRootOptions=actorPaidRetreatRootOptions\(\{[\s\S]{0,170}actorTwoUnitPaidRetreatRootV2/);
  assert.ok(block.includes('...paidRetreatRootOptions,'),
    'Paid-retreat flags must reach the actual native root wrapper');
  assert.match(runner,
    /enabled:bilateralConservativeShuffleRoot,actorOnlyComposition/);
  assert.ok(block.includes('...bilateralJetBenchRootOptions(bilateralJetBenchSwitchRoot)'));

  return {guards: guards.size, conditionalOptions: conditionalOptions.length,
    nested: observedNested};
}

test('bilateral scoped root has an activation route for all currently registered root options', () => {
  const runner = fs.readFileSync(RUNNER, 'utf8');
  const canonical = fs.readFileSync(CANONICAL, 'utf8');
  const result = auditScopedRootActivation(runner, canonical);
  assert.ok(result.guards >= 28);
  assert.ok(result.conditionalOptions >= 23);
});

test('the historical paid-retreat v9 omission is caught by a negative mutation', () => {
  const runner = fs.readFileSync(RUNNER, 'utf8');
  const canonical = fs.readFileSync(CANONICAL, 'utf8');
  const mutated = runner.replace(
    '!actorTwoUnitPaidRetreatRoot&&!actorTwoUnitPaidRetreatRootV2',
    '!actorTwoUnitPaidRetreatRootV2');
  assert.notEqual(mutated, runner);
  assert.throws(() => auditScopedRootActivation(mutated, canonical),
    /actorTwoUnitPaidRetreatRoot/);
});

test('an independently added conditional root option fails closed until audited', () => {
  const runner = fs.readFileSync(RUNNER, 'utf8');
  const canonical = fs.readFileSync(CANONICAL, 'utf8');
  const needle = '...(actorNaturalEvolutionRoot?{';
  assert.ok(runner.includes(needle));
  const mutated = runner.replace(needle,
    '...(hypotheticalUncoveredRoot?{},: {}),'+needle);
  // The synthetic source is deliberately not executable; only the option
  // discovery layer is being mutation-tested.
  assert.throws(() => auditScopedRootActivation(mutated, canonical),
    /hypotheticalUncoveredRoot/);
});

module.exports = {auditScopedRootActivation};
