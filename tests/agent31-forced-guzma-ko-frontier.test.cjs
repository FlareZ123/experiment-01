'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseForcedGuzmaNominalKo, fundedPlainAttacks} =
  require('../simulation/twinleaf/agent31-forced-guzma-ko-frontier.cjs');

const catalog = {
  basicEnergies: new Set(['Psychic Energy SVI']),
  basicEnergyTypes: {Psychic: 1}, colorlessEnergyType: 0,
  specialConditions: {ASLEEP: 5, PARALYZED: 6}
};
const move = (damage, opts={}) => ({
  name: 'Moon Press', damage, cost: [1,0], gxAttack: false,
  text: '', damageCalculation: null, ...opts
});
const actor = (overrides={}) => ({
  decisionKind: 'owner-root', globalTurn: 3, ownHand: ['Guzma BUS'],
  ownTurnResources: {supporterPlayedTurn: 0, supporterPlayLocked: false},
  ownPublic: {
    active: {attacks: [move(100)], energies: [], specialConditions: []},
    bench: [{attacks: [move(100)], energies: [
      'Psychic Energy SVI','Psychic Energy SVI'
    ], specialConditions: []}],
    publicTurnRestrictions: {
      supporterPlayLocked: false, attackLockTurnsRemaining: 0
    }, resolvingSupporter: []
  },
  opponentPublic: {
    active: {hp: 200, damage: 0},
    bench: [{hp: 90, damage: 0, tools: []}]
  },
  ...overrides
});

test('one Bench recipient on each side produces forced nominal KO intent', () => {
  const plan = chooseForcedGuzmaNominalKo(actor(), catalog);
  assert.equal(plan.kind, 'play-guzma-forced-nominal-ko');
  assert.equal(plan.benchIndex, 0);
  assert.equal(plan.opponentBenchIndex, 0);
  assert.equal(plan.nominalDamage, 100);
  assert.equal(plan.targetRemainingHp, 90);
  assert.equal(plan.predictedNativeTargetsForced, true);
  assert.equal(plan.actualKoAndTacticalBenefitUnverified, true);
});

test('do not spend Supporter when own Active already nominally KOs', () => {
  const view = actor();
  view.ownPublic.active.energies = [
    'Psychic Energy SVI','Psychic Energy SVI'
  ];
  view.opponentPublic.active.hp = 90;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog), null);
});

test('Guzma and Hala differs from Guzma; first-turn and quota excluded', () => {
  assert.equal(chooseForcedGuzmaNominalKo(
    actor({ownHand: ['Guzma & Hala CEC']}),catalog),null);
  assert.equal(chooseForcedGuzmaNominalKo(
    actor({globalTurn: 1}),catalog),null);
  assert.equal(chooseForcedGuzmaNominalKo(
    actor({ownTurnResources: {supporterPlayedTurn: 1}}),catalog),null);
});

test('multiple Bench destinations on either side disqualify forced choice', () => {
  const own = actor();
  own.ownPublic.bench.push({...own.ownPublic.bench[0]});
  assert.equal(chooseForcedGuzmaNominalKo(own,catalog),null);
  const opp = actor();
  opp.opponentPublic.bench.push({hp: 50,damage: 0,tools: []});
  assert.equal(chooseForcedGuzmaNominalKo(opp,catalog),null);
});

test('visible Eviolite and unknown Tool are conservatively screened', () => {
  const view=actor();
  view.opponentPublic.bench[0].tools=['Eviolite NVI'];
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.opponentPublic.bench[0].damage=20;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog).nominalDamage,80);
  view.opponentPublic.bench[0].tools=['Other Tool X'];
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
});

test('unpaid, status-blocked or text-effect attacks are excluded', () => {
  const view=actor();
  view.ownPublic.bench[0].energies=[];
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.ownPublic.bench[0].energies=[
    'Psychic Energy SVI','Psychic Energy SVI'
  ];
  view.ownPublic.bench[0].specialConditions=[5];
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.ownPublic.bench[0].specialConditions=[];
  view.ownPublic.bench[0].attacks[0].text='Discard an Energy.';
  assert.deepEqual(fundedPlainAttacks(view.ownPublic.bench[0],catalog),[]);
});

test('supporter or attack lock and KOed Bench target are excluded', () => {
  const view=actor();
  view.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=0;
  view.opponentPublic.bench[0].damage=90;
  assert.equal(chooseForcedGuzmaNominalKo(view,catalog),null);
});
