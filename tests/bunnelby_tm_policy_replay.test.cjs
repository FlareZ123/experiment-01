'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {replayBunnelbyTmBot} =
  require('../simulation/twinleaf/bunnelby-tm-policy-replay.cjs');

test('rank-2 Bunnelby executes both TM Evolution attacks with bot prompts', () => {
  const result = replayBunnelbyTmBot();
  assert.equal(result.firstAttack, 'Evolution');
  assert.equal(result.secondAttack, 'Evolution');
  assert.deepEqual(result.finalBench, ['Vileplume','Pidgeot ex']);
  assert.ok(result.prompts.some(p => p.kind === 'ChooseAttackPrompt'));
  assert.equal(result.sourceRanks.opponent, 1);
});
