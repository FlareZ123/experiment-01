'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { probe } = require('../simulation/twinleaf/agent12-thorton-hp-collapse-native.cjs');

for (const seat of [0, 1]) {
  test('Paper Thorton ADP to RegV has live 220HP boundary and two Prize cost, native seat ' + seat, () => {
    const below = probe(seat, 210);
    const exact = probe(seat, 220);
    const high = probe(seat, 270);
    for (const result of [below, exact, high]) {
      assert.equal(result.error, null, 'Native Store transaction must settle: ' + result.error);
      assert.equal(result.qualifiedGames, 0);
      assert.deepEqual(result.after.pending, []);
      assert.equal(result.after.supporterTurn, 1);
      console.log('AGENT12_HP_THRESHOLD ' + JSON.stringify({
        seat, initialDamage: result.damage, before: result.before,
        after: result.after, replies: result.steps.filter(s => s.reply).map(s => s.reply)
      }));
    }
    assert.equal(below.after.active, 'Regidrago V SIT');
    assert.equal(below.after.damage, 210);
    assert.deepEqual(below.after.energy, ['Double Dragon Energy ROS']);
    assert.equal(below.after.opponentPrizes, 6);
    assert.equal(below.after.discard.includes('Double Dragon Energy ROS'), false);
    for (const victim of [exact, high]) {
      assert.equal(victim.after.active, 'Regidrago V SIT',
        'Distinct original Bench Regidrago must be promoted after donated RegV KO');
      assert.equal(victim.after.damage, 0);
      assert.deepEqual(victim.after.energy, []);
      assert.equal(victim.after.opponentPrizes, 4,
        'Immediate knockout of a Pokémon V awards exactly two Prize cards');
      assert.ok(victim.after.discard.includes('Double Dragon Energy ROS'));
      assert.ok(victim.after.discard.includes('Regidrago V SIT'));
      assert.ok(victim.steps.some(step => step.reply === 'ChoosePrizePrompt'));
      assert.ok(victim.steps.some(step => step.reply === 'ChoosePokemonPrompt'));
    }
  });
}
