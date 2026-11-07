'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {probe}=require('../simulation/twinleaf/agent8-mimikyu-burrow-native.cjs');

for(const sourceSeat of [0,1]){
  test('native Mimikyu GRI Copycat executes immediately preceding Bunnelby PRC Burrow, source seat '+sourceSeat,()=>{
    const result=probe(sourceSeat);
    assert.equal(result.copiedAttack.previousSource,'Bunnelby PRC');
    assert.equal(result.copiedAttack.previousName,'Burrow');
    assert.equal(result.copiedAttack.previousGx,false);
    assert.equal(result.copiedAttack.activePrinting,'Mimikyu GRI');
    assert.ok(result.sourceAttackPrompts.includes('ConfirmPrompt'),
      'Bunnelby Ω Barrage must ask whether to take its optional second attack');
    assert.ok(!result.copiedAttackPrompts.includes('ConfirmPrompt'),
      'Mimikyu Copycat must not inherit Bunnelby Ω Barrage');
    assert.equal(result.sourceDeckDelta,-1);
    assert.equal(result.sourceDiscardDelta,1);
    assert.equal(result.sourceTopMovedToDiscard,true);
    assert.equal(result.candidateDeckDelta,-1);
    assert.deepEqual(result.unresolvedPrompts,[]);
    assert.equal(result.ownerActiveEnergyCount,2);
    assert.equal(result.ownerUsedGX,false);
    assert.equal(result.competitiveQualifiedGames,0);
    console.log('AGENT8_MIMIKYU_BURROW_COPYCAT_NATIVE',JSON.stringify(result));
  });
}
