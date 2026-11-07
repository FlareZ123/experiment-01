'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { chooseOwnerPreAttackAceTrainer } =
  require('../simulation/twinleaf/agent20-owner-pre-attack-ace-trainer.cjs');

function fixture() {
  return {
    decisionKind: 'owner-root',
    ownHand: [
      'Lillie AOR',
      'Powerglass SFA',
      'Ace Trainer AOR',
      'Sky Field ROS',
      'Rescue Carrier SIT',
      'Mysterious Treasure FLI',
      'Forest Seal Stone SIT'
    ],
    ownTurnResources: {
      supporterPlayedTurn: 0,
      supporterPlayLocked: false
    },
    ownPublic: {
      prizeCount: 6,
      stadium: [],
      active: {
        printing: 'Unown AOR',
        hp: 60,
        damage: 0,
        energies: ['Psychic Energy SVE'],
        tools: [],
        abilities: [],
        printed: { types: ['Psychic'] },
        attacks: [{
          name: 'Hidden Power',
          cost: ['Colorless'],
          damage: '10',
          damageCalculation: null,
          text: ''
        }]
      }
    },
    opponentPublic: {
      prizeCount: 5,
      handCount: 10,
      stadium: [],
      active: {
        printing: 'Trubbish FST',
        hp: 70,
        damage: 60,
        tools: [],
        abilities: [],
        printed: { resistance: [] }
      }
    }
  };
}

test('selects Ace Trainer before a public one-energy lethal attack', () => {
  const view = fixture();
  const result = chooseOwnerPreAttackAceTrainer(view, { index: 0 });
  assert.equal(result.kind, 'play-ace-trainer');
  assert.equal(result.handIndex, 2);
  assert.equal(result.attackName, 'Hidden Power');
  assert.equal(result.targetRemainingHp, 10);
  assert.equal(result.opponentHandCount, 10);
  assert.equal(result.opponentHiddenHandRead, undefined);
});

test('does not play Ace Trainer when the Prize condition is false', () => {
  const view = fixture();
  view.ownPublic.prizeCount = 5;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not play a second Supporter in the same turn', () => {
  const view = fixture();
  view.ownTurnResources.supporterPlayedTurn = 1;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not play when the opponent hand is small or not larger', () => {
  const view = fixture();
  view.opponentPublic.handCount = 6;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.opponentPublic.handCount = 4;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not play when the active attack cannot Knock Out the target', () => {
  const view = fixture();
  view.opponentPublic.active.damage = 50;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not infer a lethal attack from dynamic damage or attack text', () => {
  const view = fixture();
  view.ownPublic.active.attacks[0].damage = '10+';
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.ownPublic.active.attacks[0].damage = '10';
  view.ownPublic.active.attacks[0].text = 'Flip a coin.';
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not use an unpowered or ambiguous attack', () => {
  const view = fixture();
  view.ownPublic.active.energies = [];
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.ownPublic.active.energies = ['Psychic Energy SVE'];
  view.ownPublic.active.attacks.push({
    name: 'Other attack',
    cost: ['Colorless'],
    damage: '20',
    damageCalculation: null,
    text: ''
  });
  assert.equal(chooseOwnerPreAttackAceTrainer(view, {}), null);
});

test('declines when public protection or resistance makes the KO uncertain', () => {
  const view = fixture();
  view.opponentPublic.active.tools = ['Big Charm'];
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.opponentPublic.active.tools = [];
  view.opponentPublic.active.printed.resistance = [{ type: 'Psychic', value: -20 }];
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('declines when the Supporter is absent or locked', () => {
  const view = fixture();
  view.ownHand = view.ownHand.filter(x => !x.includes('Ace Trainer'));
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
  view.ownHand.push('Ace Trainer AOR');
  view.ownTurnResources.supporterPlayLocked = true;
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('does not inspect opponent hand identities', () => {
  const view = fixture();
  Object.defineProperty(view, 'opponentHand', {
    get() { throw new Error('opponent hidden hand was accessed'); }
  });
  Object.defineProperty(view.opponentPublic, 'hand', {
    get() { throw new Error('opponent public wrapper exposed hidden hand'); }
  });
  assert.equal(
    chooseOwnerPreAttackAceTrainer(view, { index: 0 }).kind,
    'play-ace-trainer'
  );
});

test('requires an owner-root observation', () => {
  const view = fixture();
  view.decisionKind = 'opponent-root';
  assert.equal(chooseOwnerPreAttackAceTrainer(view, { index: 0 }), null);
});

test('resolves a multi-attack Pokémon by the AttackAction attackName', () => {
  const view = fixture();
  view.ownPublic.active.attacks.push({
    name: 'Other attack',
    cost: ['Colorless'],
    damage: '20',
    damageCalculation: null,
    text: ''
  });
  const result = chooseOwnerPreAttackAceTrainer(view, {
    attackName: 'Hidden Power'
  });
  assert.equal(result.attackIndex, 0);
  assert.equal(result.attackName, 'Hidden Power');
});
