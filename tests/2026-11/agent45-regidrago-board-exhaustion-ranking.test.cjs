'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { chooseApexAttack, evaluateApexAttackChoice } =
  require('../../simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs');

function choice(name, token) {
  return { token, publicMetadata: { sourceAttack: name, attackCostPayable: true } };
}
const echo = choice('Dominating Echo', 'echo');
const phantom = choice('Phantom Dive', 'phantom');
const trifrost = choice('Trifrost', 'trifrost');
const laser = choice('Dragon Laser', 'laser');
const frost = choice('Frost Spear', 'frost');
const kaiser = choice('Kaiser Tackle', 'kaiser');

function pokemon(printing, hp, damage, subtypes = ['Basic']) {
  return { hp, damage, printing, printed: { subtypes } };
}
function view(seat, active, bench = [], options = {}) {
  return {
    physicalSeat: seat,
    ownPublic: {
      active: { hp: 280, damage: options.ownDamage ?? 0,
        printing: 'Regidrago VSTAR SIT 136', printed: { subtypes: ['VSTAR'] } },
      bench: options.ownBench ?? [], prizeCount: options.prizeCount ?? 6,
      publicTurnRestrictions: { gxUsed: false },
      stadium: ['Sky Field ROS 89']
    },
    opponentPublic: {
      active, bench, stadium: [],
      publicTurnRestrictions: {}
    },
    ownHand: []
  };
}

test('no Bench means a final-KO Phantom Dive beats nonlethal Echo even with 6 Prizes left', () => {
  for (const seat of [0, 1]) {
    const obs = view(seat, pokemon('Dedenne-GX UNB 57', 160, 0, ['Basic', 'GX']));
    const p = evaluateApexAttackChoice(phantom, obs);
    const e = evaluateApexAttackChoice(echo, obs);
    assert.equal(p.immediateWin, true);
    assert.equal(e.immediateWin, false);
    assert.deepEqual(chooseApexAttack([echo, phantom], obs),
      { kind: 'select-choice', token: 'phantom' });
  }
});

test('missing Bench observation never becomes a fabricated board-clear terminal', () => {
  const obs = view(0, pokemon('Dedenne-GX UNB 57', 160, 0, ['Basic', 'GX']));
  delete obs.opponentPublic.bench;
  assert.equal(evaluateApexAttackChoice(phantom, obs).immediateWin, false);
  assert.deepEqual(chooseApexAttack([echo, phantom], obs),
    { kind: 'select-choice', token: 'echo' });
});

test('living Bench prevents false active-only board-clear win', () => {
  for (const seat of [0, 1]) {
    const obs = view(seat, pokemon('Dedenne-GX UNB 57', 160, 0, ['GX']), [
      pokemon('Wobbuffet PHF 36', 110, 0)
    ]);
    assert.equal(evaluateApexAttackChoice(phantom, obs).immediateWin, false);
    assert.deepEqual(chooseApexAttack([echo, phantom], obs),
      { kind: 'select-choice', token: 'echo' });
  }
});

test('Phantom Dive board-clear counts six freely assigned counters, not only Prize depletion', () => {
  for (const seat of [0, 1]) {
    const obs = view(seat, pokemon('Dedenne-GX UNB 57', 160, 0, ['GX']), [
      pokemon('Girafarig LOT 94', 90, 50)
    ]);
    assert.equal(evaluateApexAttackChoice(phantom, obs).immediateWin, true);
    assert.deepEqual(chooseApexAttack([echo, phantom], obs),
      { kind: 'select-choice', token: 'phantom' });

    obs.opponentPublic.bench[0].damage = 20; // 70 HP > six counters
    assert.equal(evaluateApexAttackChoice(phantom, obs).immediateWin, false);
  }
});

test('Trifrost can win by clearing 1 Active plus exactly two small Bench Pokemon', () => {
  for (const seat of [0, 1]) {
    const obs = view(seat, pokemon('Dedenne-GX UNB 57', 160, 70, ['GX']), [
      pokemon('Wobbuffet PHF 36', 110, 40),
      pokemon('Girafarig LOT 94', 90, 10)
    ]);
    assert.equal(evaluateApexAttackChoice(trifrost, obs).immediateWin, true);
    assert.deepEqual(chooseApexAttack([echo, trifrost], obs),
      { kind: 'select-choice', token: 'trifrost' });

    obs.opponentPublic.bench.push(pokemon('Marshadow UNB 81', 80, 60));
    assert.equal(evaluateApexAttackChoice(trifrost, obs).immediateWin, false);
  }
});

test('Dragon Laser hits the one remaining Doll on Bench and can win by board exhaustion', () => {
  for (const seat of [0, 1]) {
    const obs = view(seat, pokemon('Dedenne-GX UNB 57', 160, 70, ['GX']), [
      pokemon("Lillie's Poké Doll CEC 197", 30, 0, ['Item'])
    ]);
    assert.equal(evaluateApexAttackChoice(laser, obs).benchPrizeValue, 0);
    assert.equal(evaluateApexAttackChoice(laser, obs).immediateWin, true);
    assert.deepEqual(chooseApexAttack([echo, laser], obs),
      { kind: 'select-choice', token: 'laser' });

    obs.opponentPublic.bench.push(pokemon('Girafarig LOT 94', 90, 0));
    assert.equal(evaluateApexAttackChoice(laser, obs).immediateWin, false);
  }
});

test('Frost Spear also wins if it KOs Active and exactly one 20-HP Bench target', () => {
  const obs = view(0, pokemon('Dedenne-GX UNB 57', 160, 80, ['GX']), [
    pokemon('Robo Substitute PHF 102', 30, 10, ['Item'])
  ]);
  assert.equal(evaluateApexAttackChoice(frost, obs).benchPrizeValue, 0);
  assert.equal(evaluateApexAttackChoice(frost, obs).immediateWin, true);
  obs.opponentPublic.bench[0].damage = 0;
  assert.equal(evaluateApexAttackChoice(frost, obs).immediateWin, false);
});

test('a self-KO with no surviving friendly Bench does not certify a simultaneous board-empty win', () => {
  const obs = view(0, pokemon('Dedenne-GX UNB 57', 160, 130, ['GX']), [], {
    ownDamage: 240
  });
  // Both active Pokemon would be KO'd by Kaiser Tackle's 60 self-damage.
  assert.equal(evaluateApexAttackChoice(kaiser, obs).selfKnockout, true);
  assert.equal(evaluateApexAttackChoice(kaiser, obs).immediateWin, false);
  assert.equal(evaluateApexAttackChoice(echo, obs).immediateWin, true);
  assert.deepEqual(chooseApexAttack([kaiser, echo], obs),
    { kind: 'select-choice', token: 'echo' });
  obs.ownPublic.bench = [pokemon('Regidrago V SIT 135', 220, 0, ['Basic', 'V'])];
  assert.equal(evaluateApexAttackChoice(kaiser, obs).immediateWin, true);
});
