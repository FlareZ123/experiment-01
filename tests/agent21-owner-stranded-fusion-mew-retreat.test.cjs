'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION, DCE, MEW_VMAX, GENESECT_V, chooseStrandedFusionMewRetreat
} = require('../simulation/twinleaf/agent21-owner-stranded-fusion-mew-retreat.cjs');

function fixture(activePrinting = 'Dedenne-GX UNB', printedCost = 1) {
  const types = {colorlessEnergyType: 9,
    specialConditions: {ASLEEP: 1, PARALYZED: 2}};
  const view = {
    decisionKind: 'owner-root', globalTurn: 70,
    ownTurnResources: {retreatedTurn: 0},
    ownPublic: {
      active: {printing: activePrinting,
        printed: {retreatCost: Array(printedCost).fill(9)},
        energies: [DCE], publicRestrictions: {}, specialConditions: []},
      bench: [{
        printing: MEW_VMAX, energies: [DCE],
        attacks: [{name: 'Cross Fusion Strike', cost: [9, 9]}],
        specialConditions: [], publicRestrictions: {}
      }, {printing: GENESECT_V, energies: [],
        attacks: [{name: 'Techno Blast', cost: [8, 8, 9]}],
        publicRestrictions: {}, specialConditions: []}],
      stadium: [], publicTurnRestrictions: {attackLockTurnsRemaining: 0}
    },
    opponentPublic: {stadium: [], active: {printing: 'Latias ex SSP'}}
  };
  Object.defineProperty(view, 'opponentHidden', {
    get() { throw new Error('Do not inspect opponent private data'); }
  });
  Object.defineProperty(view, 'ownDeck', {
    get() { throw new Error('Do not inspect undisclosed own deck order'); }
  });
  return {view, types};
}

test('exact printed Dedenne-GX one-Colorless Active can pay DCE to attack with Benched Mew VMAX', () => {
  const {view, types} = fixture();
  const before = JSON.stringify(view);
  const result = chooseStrandedFusionMewRetreat(view, types);
  assert.match(VERSION, /agent21-owner-stranded-mew-dce/);
  assert.deepEqual(result, {
    kind: 'paid-retreat', benchIndex: 0,
    activePrinting: 'Dedenne-GX UNB', printing: MEW_VMAX,
    attackName: 'Cross Fusion Strike', retreatCostUnits: 1,
    paymentPrinting: DCE, source: VERSION,
    nativePlayability: 'requires-original-Store-acceptance'
  });
  assert.equal(JSON.stringify(view), before);
});

test('actual capped rank5 Clefairy printing also has one printed Colorless retreat', () => {
  const {view, types} = fixture("Lillie's Clefairy ex JTG");
  assert.equal(chooseStrandedFusionMewRetreat(view, types)?.retreatCostUnits, 1);
  const wrong = fixture("Lillie's Clefairy ex JTG", 2);
  assert.equal(chooseStrandedFusionMewRetreat(wrong.view, wrong.types), null);
});

test('one DCE can pay two printed Colorless retreat units on a Genesect V Active', () => {
  const {view, types} = fixture(GENESECT_V, 2);
  assert.equal(chooseStrandedFusionMewRetreat(view, types)?.retreatCostUnits, 2);
  view.ownPublic.active.printed.retreatCost = [9, 9, 9];
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
});

test('requires distinct correctly funded exact Mew donor and recipient', () => {
  const {view, types} = fixture();
  view.ownPublic.bench[0].energies = [];
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
  view.ownPublic.bench[0].energies = [DCE];
  view.ownPublic.bench[1] = null;
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
  view.ownPublic.bench[1] = {printing: GENESECT_V};
  view.ownPublic.bench[0].attacks[0].cost = [5, 5];
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
  view.ownPublic.bench[0].attacks[0].cost = [9, 9];
  view.ownPublic.active.energies = ['Psychic Energy MEE'];
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
});

test('turn quota, statuses, attack blocks and Temple of Sinnoh veto proposed mobility', () => {
  const {view, types} = fixture();
  view.ownTurnResources.retreatedTurn = 70;
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
  view.ownTurnResources.retreatedTurn = 0;
  view.ownPublic.active.specialConditions = [types.specialConditions.PARALYZED];
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
  view.ownPublic.active.specialConditions = [];
  view.ownPublic.active.publicRestrictions.cannotRetreatWhileActive = true;
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
  view.ownPublic.active.publicRestrictions.cannotRetreatWhileActive = false;
  view.opponentPublic.stadium = ['Temple of Sinnoh ASR'];
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
  view.opponentPublic.stadium = [];
  view.ownPublic.bench[0].publicRestrictions.cannotAttackNextTurn = true;
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
});

test('fail closed for first turn, uncertain Active printings and disallowed owner-prompt views', () => {
  const {view, types} = fixture();
  view.globalTurn = 1;
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
  view.globalTurn = 70;
  view.ownPublic.active.printing = 'Crobat V DAA';
  assert.equal(chooseStrandedFusionMewRetreat(view, types), null);
  view.decisionKind = 'owner-prompt';
  assert.throws(() => chooseStrandedFusionMewRetreat(view, types),
    /owner-root/);
});
