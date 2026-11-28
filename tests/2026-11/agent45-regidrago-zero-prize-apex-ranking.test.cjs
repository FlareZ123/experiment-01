'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { chooseApexAttack, evaluateApexAttackChoice, rankApexChoices } =
  require('../../simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs');

const phantom = { token: 'phantom', publicMetadata: { sourceAttack: 'Phantom Dive', attackCostPayable: true } };
const trifrost = { token: 'trifrost', publicMetadata: { sourceAttack: 'Trifrost', attackCostPayable: true } };
const choices = [phantom, trifrost];
const rank7Bench = [
  { hp: 150, damage: 110, printing: 'Snorlax PGO 55', printed: { subtypes: ['Basic'] } },
  { hp: 90, damage: 0, printing: 'Girafarig LOT 94', printed: { subtypes: ['Basic'] } }
];

function view(activePrinting, { seat = 0, prizeCount = 2, activeRules = [], bench = rank7Bench } = {}) {
  return {
    physicalSeat: seat,
    ownPublic: {
      active: { hp: 280, damage: 0, printing: 'Regidrago VSTAR SIT 136', printed: { subtypes: ['VSTAR'] } },
      prizeCount,
      publicTurnRestrictions: { gxUsed: false }
    },
    opponentPublic: {
      active: { hp: 30, damage: 0, printing: activePrinting, printed: { subtypes: ['Item'], rules: activeRules } },
      bench
    },
    ownHand: []
  };
}

for (const printing of [
  "Lillie's Poké Doll CEC 197",
  'Robo Substitute PHF 102',
  'Robo Substitute Team Flare Gear PHF 102',
  'Snorlax Doll PAR 175'
]) {
  test('no false final-Prize Phantom Dive with Active ' + printing, () => {
    for (const seat of [0, 1]) {
      const obs = view(printing, { seat });
      const rows = rankApexChoices(choices, obs);
      const phantomEval = rows.find(row => row.choice.token === 'phantom').evaluation;
      const trifrostEval = rows.find(row => row.choice.token === 'trifrost').evaluation;

      // Phantom Dive KOs Active virtual (zero Prizes) and 40-HP remaining
      // Snorlax (one Prize); Trifrost KOs both one-Prize Benched basics.
      assert.equal(phantomEval.benchPrizeValue, 1);
      assert.equal(phantomEval.immediateWin, false);
      assert.equal(trifrostEval.targetPrizeValue, 2);
      assert.equal(trifrostEval.immediateWin, true);
      assert.deepEqual(chooseApexAttack(choices, obs), { kind: 'select-choice', token: 'trifrost' });
    }
  });
}

test('no-Prize rule text is honoured even for an unfamiliar printing', () => {
  const obs = view('Actor-only proxy printing', {
    activeRules: ["If this card is Knocked Out, your opponent can't take any Prize cards for it."]
  });
  assert.equal(evaluateApexAttackChoice(phantom, obs).immediateWin, false);
  assert.equal(evaluateApexAttackChoice(trifrost, obs).targetPrizeValue, 2);
});

test('ordinary Basic remains Prize-bearing; unknown-set lookalike is not auto-certified', () => {
  const ordinary = view('Ordinary Basic PGO 55');
  ordinary.opponentPublic.active.printed.subtypes = ['Basic'];
  assert.equal(evaluateApexAttackChoice(phantom, ordinary).immediateWin, true);
  assert.deepEqual(chooseApexAttack(choices, ordinary), { kind: 'select-choice', token: 'phantom' });

  // With no authenticated set or rules, do not silently treat similarly
  // named but unverified printings as zero-Prize source cards.
  const unknown = view("Lillie's Poké Doll UNKNOWN 999");
  assert.equal(evaluateApexAttackChoice(phantom, unknown).immediateWin, true);
});

test('Benched zero-Prize Doll cannot complete an otherwise one-Prize Phantom Dive', () => {
  const obs = view('Ordinary Basic PGO 55', {
    bench: [
      { hp: 30, damage: 0, printing: "Lillie's Poké Doll CEC 197", printed: { subtypes: ['Item'] } },
      { hp: 90, damage: 0, printing: 'Girafarig LOT 94', printed: { subtypes: ['Basic'] } }
    ]
  });
  obs.opponentPublic.active.printed.subtypes = ['Basic'];
  const phantomEval = evaluateApexAttackChoice(phantom, obs);
  const trifrostEval = evaluateApexAttackChoice(trifrost, obs);
  assert.equal(phantomEval.benchPrizeValue, 0);
  assert.equal(phantomEval.immediateWin, false);
  assert.equal(trifrostEval.targetPrizeValue, 2);
  assert.equal(trifrostEval.immediateWin, true);
  assert.deepEqual(chooseApexAttack(choices, obs), { kind: 'select-choice', token: 'trifrost' });
});
