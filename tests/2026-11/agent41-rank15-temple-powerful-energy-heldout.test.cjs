'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION, createPolicy, printedDamage
} = require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');

const MEGA = 'Mega Lopunny ex PFL 84';
const SHADOW_RIDER = 'Shadow Rider Calyrex V CRE 74';
const TEMPLE = 'Temple of Sinnoh ASR 155';
const POWERFUL = 'Powerful Colorless Energy DAA 176';

function request(seat) {
  const mega = {
    printing: MEGA, hp: 320, damage: 120,
    // One Powerful and at least three other cards: offered attacks remain
    // authoritative on their native Energy-payment legality.
    energies: [POWERFUL, 'Grass Energy BLW 105', 'Grass Energy BLW 105', 'Jet Energy PAL 190'],
    tools: [], printed: { stage: 'STAGE_1' }
  };
  const defender = {
    printing: SHADOW_RIDER, hp: 210, damage: 40,
    energies: ['Psychic Energy CRE 232'], tools: [],
    printed: {
      stage: 'BASIC',
      weakness: [{ type: 'Darkness', value: '×2' }],
      resistance: []
    }
  };
  return {
    role: 'opponent', seat, prompt: null,
    observation: {
      actorSeat: seat, globalTurn: 6, ownHand: [],
      ownPublic: {
        active: mega, bench: [{ printing: 'Gloom UNB 7' }],
        stadium: [], prizeCount: 2
      },
      opponentPublic: {
        active: defender, bench: [{ printing: 'Shadow Rider Calyrex VMAX CRE 75' }],
        stadium: [TEMPLE], prizeCount: 3
      }
    },
    publicEventReceipt: {
      actorSeat: seat, turn: 6,
      ownerActive: {
        printing: MEGA, movedFromBenchToActiveThisTurn: true
      }
    },
    actionFrontier: {
      items: [
        { token: 'spiky', kind: 'attack', actorPrinting: MEGA, attackName: 'Spiky Hopper' },
        { token: 'gale', kind: 'attack', actorPrinting: MEGA, attackName: 'Gale Thrust' }
      ]
    }
  };
}
function assess(r) {
  const worker = createPolicy({
    role: 'opponent', seat: r.seat, policyVersion: POLICY_VERSION, config: {}
  });
  return {
    damages: r.actionFrontier.items.map(item => printedDamage(item, r)),
    decision: worker.decide(r)
  };
}

for (const seat of [0, 1]) {
  test('seat ' + seat + ': Lockbridge Temple prevents a false Spiky terminal and leaves Gale lethal', () => {
    const r = request(seat);
    assert.deepEqual(assess(r), {
      damages: [160, 230], decision: { kind: 'select-action', token: 'gale' }
    });
  });
  test('seat ' + seat + ': without Temple the +20 bonus returns', () => {
    const r = request(seat);
    r.observation.opponentPublic.stadium = [];
    assert.deepEqual(assess(r), {
      damages: [180, 250], decision: { kind: 'select-action', token: 'spiky' }
    });
  });
  test('seat ' + seat + ': Temple on actor Stadium projection is equally recognized', () => {
    const r = request(seat);
    r.observation.opponentPublic.stadium = [];
    r.observation.ownPublic.stadium = [{ printing: TEMPLE }];
    assert.deepEqual(assess(r), {
      damages: [160, 230], decision: { kind: 'select-action', token: 'gale' }
    });
  });
  test('seat ' + seat + ': no Powerful card means no bonus even without Temple', () => {
    const r = request(seat);
    r.observation.opponentPublic.stadium = [];
    r.observation.ownPublic.active.energies =
      ['Grass Energy BLW 105', 'Grass Energy BLW 105', 'Jet Energy PAL 190'];
    assert.deepEqual(assess(r), {
      damages: [160, 230], decision: { kind: 'select-action', token: 'gale' }
    });
  });
  test('seat ' + seat + ': unrelated Stadium does not suppress Powerful bonus', () => {
    const r = request(seat);
    r.observation.opponentPublic.stadium = ['Artazon PAL 171'];
    assert.deepEqual(assess(r), {
      damages: [180, 250], decision: { kind: 'select-action', token: 'spiky' }
    });
  });
}
