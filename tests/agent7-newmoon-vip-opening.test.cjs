'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,firstEightItemGivenLegalSeven,run}=
  require('../scripts/agent7-newmoon-vip-opening.cjs');

test('integer combinatorics conserve 60-card categories',()=>{
  assert.equal(choose(60n,7n),386206920n);
  assert.equal(choose(60n,8n),2558620845n);
  assert.deepEqual(firstEightItemGivenLegalSeven(17,0),{n:0n,d:1n});
});

test('exact New Moon held VIP opportunity conditioned on legal starter',()=>{
  const result=run();
  assert.equal(result.newMoonBasics,17);
  assert.equal(result.newMoonBattleVipPassCopies,4);
  assert.equal(result.championBattleVipPassCopies,0);
  assert.equal(result.newMoonConditionalFirstEightVipFraction,
    '479458943/1103593454');
  assert.ok(Math.abs(result.newMoonConditionalFirstEightVipPercent-
    43.44525071820515)<1e-11);
  assert.equal(result.competitiveQualifiedGames,0);
});

test('at least one VIP is monotonic in card copy count',()=>{
  const rows=[0,1,2,3,4].map(n=>firstEightItemGivenLegalSeven(17,n));
  for(let i=1;i<rows.length;i++){
    assert.ok(Number(rows[i].n)/Number(rows[i].d)>
      Number(rows[i-1].n)/Number(rows[i-1].d));
  }
});
