'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {latiasKoraidonResponseContract} =
  require('../simulation/twinleaf/latias-koraidon-adversarial-sequence.cjs');

test('pinned Store Eon Blade into Koraidon leaves 30 HP and retaliation KOs Latias', () => {
  const result=latiasKoraidonResponseContract();
  assert.equal(result.firstAttack.directDamageToKoraidon,200);
  assert.equal(result.firstAttack.KoraidonHpAfter,30);
  assert.equal(result.secondAttack.damageToLatiasBeforeKo,240);
  assert.equal(result.secondAttack.latiasKnockedOut,true);
  assert.equal(result.secondAttack.opponentPrizesTaken,2);
  assert.equal(result.secondAttack.candidatePromoted,'Tapu Lele-GX');
  assert.ok(result.firstAttack.deferredPrompts.length>0);
  assert.ok(result.secondAttack.deferredPrompts.includes('ChoosePrizePrompt'));
  assert.ok(result.secondAttack.deferredPrompts.includes('ChoosePokemonPrompt'));
});
