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


const echo = { token: 'echo', publicMetadata: { sourceAttack: 'Dominating Echo', attackCostPayable: true } };
const ryuno = { token: 'ryuno', publicMetadata: { sourceAttack: 'Ryuno Glide', attackCostPayable: true } };

function megaView(seat = 0) {
  const obs = view('Mega Absol ex MEG 86', {
    seat,
    prizeCount: 3,
    bench: [{
      hp: 280,
      damage: 230,
      printing: 'Mega Absol ex MEG 86',
      printed: { subtypes: ['Basic', 'MEGA', 'ex'] }
    }]
  });
  obs.opponentPublic.active.hp = 280;
  obs.opponentPublic.active.printed.subtypes = ['Basic', 'MEGA', 'ex'];
  obs.ownPublic.stadium = ['Sky Field ROS 89'];
  return obs;
}

test('modern three-Prize Mega ex Bench KO switches Apex from Echo to final Phantom Dive', () => {
  for (const seat of [0, 1]) {
    const obs = megaView(seat);
    const e = evaluateApexAttackChoice(phantom, obs);
    assert.equal(e.activeKnockout, false);
    assert.equal(e.benchPrizeValue, 3);
    assert.equal(e.immediateWin, true);
    assert.equal(e.score, 300);
    assert.equal(evaluateApexAttackChoice(echo, obs).score, 260);
    assert.deepEqual(chooseApexAttack([echo, phantom], obs), { kind: 'select-choice', token: 'phantom' });
  }
});

test('Mega Evolution ex Rule text is sufficient even without the MEGA subtype', () => {
  const obs = megaView();
  obs.opponentPublic.bench[0].printed = {
    subtypes: ['Basic'],
    rules: ['Mega Evolution ex Rule: When your Mega Evolution Pokémon ex is Knocked Out, your opponent takes 3 Prize cards.']
  };
  assert.equal(evaluateApexAttackChoice(phantom, obs).benchPrizeValue, 3);
  assert.equal(evaluateApexAttackChoice(phantom, obs).immediateWin, true);
});

test('older uppercase-EX Mega and ordinary lower-case ex remain two-Prize targets', () => {
  const obs = megaView();
  obs.opponentPublic.bench[0] = {
    hp: 230, damage: 180, printing: 'M Charizard-EX FLF 13',
    printed: { subtypes: ['MEGA', 'EX'], rules: ['Pokémon-EX rule: When a Pokémon-EX is Knocked Out, your opponent takes 2 Prize cards.'] }
  };
  assert.equal(evaluateApexAttackChoice(phantom, obs).benchPrizeValue, 2);
  assert.equal(evaluateApexAttackChoice(phantom, obs).immediateWin, false);
  obs.opponentPublic.bench[0] = {
    hp: 320, damage: 270, printing: 'Dragapult ex TWM 130',
    printed: { subtypes: ['Stage 2', 'ex'] }
  };
  assert.equal(evaluateApexAttackChoice(phantom, obs).benchPrizeValue, 2);
  assert.equal(evaluateApexAttackChoice(phantom, obs).immediateWin, false);

  const activeObs = megaView();
  activeObs.opponentPublic.active.damage = 0;
  activeObs.opponentPublic.bench = [];
  assert.equal(evaluateApexAttackChoice(ryuno, activeObs).immediateWin, true);
});


const laser = { token: 'laser', publicMetadata: { sourceAttack: 'Dragon Laser', attackCostPayable: true } };
const timeless = { token: 'timeless', publicMetadata: { sourceAttack: 'Timeless-GX', attackCostPayable: true } };
const frost = { token: 'frost', publicMetadata: { sourceAttack: 'Frost Spear', attackCostPayable: true } };

test('single-target Dragon Laser ranks a lethal three-Prize Mega bench KO above Timeless-GX', () => {
  for (const seat of [0, 1]) {
    const obs = megaView(seat);
    obs.ownPublic.prizeCount = 3;
    obs.opponentPublic.bench[0].damage = 260; // 20 HP remaining
    const laserEval = evaluateApexAttackChoice(laser, obs);
    const timelessEval = evaluateApexAttackChoice(timeless, obs);
    assert.equal(laserEval.activeKnockout, false);
    assert.equal(laserEval.benchKnockoutPotential, true);
    assert.equal(laserEval.benchPrizeValue, 3);
    assert.equal(laserEval.immediateWin, true);
    assert.equal(timelessEval.immediateWin, false);
    assert.deepEqual(chooseApexAttack([laser, timeless], obs), { kind: 'select-choice', token: 'laser' });
  }
});

test('single-target Bench attacks select exactly one target and count zero-Prize Items as zero', () => {
  const obs = megaView();
  obs.opponentPublic.bench = [
    { hp: 30, damage: 10, printing: "Lillie's Poké Doll CEC 197", printed: { subtypes: ['Item'] } },
    { hp: 280, damage: 260, printing: 'Mega Absol ex MEG 86', printed: { subtypes: ['Basic', 'MEGA', 'ex'] } },
    { hp: 280, damage: 260, printing: 'Mega Absol ex MEG 86', printed: { subtypes: ['Basic', 'MEGA', 'ex'] } }
  ];
  obs.ownPublic.prizeCount = 4;
  const l = evaluateApexAttackChoice(laser, obs);
  const f = evaluateApexAttackChoice(frost, obs);
  assert.equal(l.benchPrizeValue, 3);
  assert.equal(f.benchPrizeValue, 3);
  assert.equal(l.immediateWin, false);
  assert.equal(f.immediateWin, false);

  obs.opponentPublic.bench = [
    { hp: 30, damage: 10, printing: 'Robo Substitute PHF 102', printed: { subtypes: ['Item'] } }
  ];
  const dollLaser = evaluateApexAttackChoice(laser, obs);
  const dollFrost = evaluateApexAttackChoice(frost, obs);
  assert.equal(dollLaser.benchKnockoutPotential, true);
  assert.equal(dollFrost.benchKnockoutPotential, true);
  assert.equal(dollLaser.benchPrizeValue, 0);
  assert.equal(dollFrost.benchPrizeValue, 0);
  assert.equal(dollLaser.immediateWin, false);
  assert.equal(dollFrost.immediateWin, false);
});
