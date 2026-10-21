'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {chooseImmediateKoEnergyIntent} =
  require('../simulation/twinleaf/agent9-actor-immediate-ko-energy.cjs');
const {chooseActorEnergyRecipient} =
  require('../simulation/twinleaf/agent44-actor-energy-recipient.cjs');

const DARK = 7, COLORLESS = 9;
const DARK_NAME = 'Darkness Energy MEE';
const catalog = {
  basicEnergies: new Set([DARK_NAME]),
  basicEnergyTypes: {Darkness: DARK},
  colorlessEnergyType: COLORLESS,
  specialConditions: {ASLEEP: 2, PARALYZED: 0}
};

/** @returns {object} Reproduction of the visible rank-11 turn-42 decision features. */
function publicTurn42() {
  const pokemon = (name, energies, attacks) => ({
    name, energies, attacks, specialConditions: [], publicRestrictions: {}
  });
  return {
    decisionKind: 'owner-root', globalTurn: 42,
    ownHand: [DARK_NAME],
    ownPublic: {
      active: pokemon('Mega Absol ex', [DARK_NAME, DARK_NAME], [
        {name: 'Terminal Period', cost: [DARK, COLORLESS], damage: '', gxAttack: false},
        {name: 'Claw of Darkness', cost: [DARK, DARK, COLORLESS],
          damage: '200', gxAttack: false}
      ]),
      bench: [
        pokemon('Trubbish', [], [
          {name: 'Call for Family', cost: [DARK], damage: '', gxAttack: false}
        ]), null, null, null, null
      ],
      publicTurnRestrictions: {attackLockTurnsRemaining: 0, attackMaxEnergy: null}
    },
    opponentPublic: {active: pokemon('Girafarig', [], []),
      handCount: 15},
    opponentSecret: {hand: ['hidden'], prizes: ['hidden']}
  };
}

test('rank11 source: overriding cheap ready Terminal Period funds printed Claw', () => {
  const view = publicTurn42();
  view.ownPublic.bench = view.ownPublic.bench.map((slot, i) =>
    slot ?? {name: 'Benched ' + i, energies: [], attacks: []});
  view.opponentPublic.active.hp = 90;
  view.opponentPublic.active.damage = 0;
  const baseline = chooseActorEnergyRecipient(view, catalog);
  assert.equal(baseline.slot, 'bench');
  assert.equal(baseline.attackName, 'Call for Family');
  const proposed = chooseImmediateKoEnergyIntent(view, catalog);
  assert.deepEqual(proposed, {
    handIndex: 0, printing: DARK_NAME, slot: 'active', index: 0,
    attackName: 'Claw of Darkness', gapBefore: 1, gapAfter: 0,
    projectedBaseDamage: 200, opponentRemainingHP: 90,
    knownBasicEnergyOnly: true
  });
});

test('an insufficiently damaging move cannot override the energy frontier', () => {
  const view = publicTurn42();
  view.opponentPublic.active.hp = 280;
  view.opponentPublic.active.damage = 0;
  assert.equal(chooseImmediateKoEnergyIntent(view, catalog), null);
});

test('a still-two-Energy-short attack is excluded', () => {
  const view = publicTurn42();
  view.ownPublic.active.energies = [];
  view.opponentPublic.active.hp = 90;
  view.opponentPublic.active.damage = 0;
  assert.equal(chooseImmediateKoEnergyIntent(view, catalog), null);
});

test('read-only actor decision does not depend on hidden hand, Prize, deck', () => {
  const view = publicTurn42();
  view.opponentPublic.active.hp = 90;
  view.opponentPublic.active.damage = 0;
  const choice = chooseImmediateKoEnergyIntent(view, catalog);
  const duplicate = structuredClone(view);
  duplicate.opponentSecret = {hand: ['changed'], prizes: ['changed']};
  duplicate.ownHiddenDeck = ['known false'];
  assert.deepEqual(chooseImmediateKoEnergyIntent(duplicate, catalog), choice);
});

test('explicit attack restriction prevents tempting nominal KO', () => {
  const view = publicTurn42();
  view.opponentPublic.active.hp = 90;
  view.opponentPublic.active.damage = 0;
  view.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn = 'Claw of Darkness';
  assert.equal(chooseImmediateKoEnergyIntent(view, catalog), null);
});
