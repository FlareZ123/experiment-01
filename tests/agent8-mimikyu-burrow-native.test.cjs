'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {probe,probeAttackOrder}=require('../simulation/twinleaf/agent8-mimikyu-burrow-native.cjs');

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

for(const sourceSeat of [0,1]){
  test('native Copycat follows Rototiller then Burrow and mills source deck, seat '+sourceSeat,()=>{
    const result=probeAttackOrder(sourceSeat,'Rototiller','Burrow');
    assert.equal(result.finalPreviousAttack,'Burrow');
    assert.ok(result.sourcePrompts.includes('ConfirmPrompt'));
    assert.ok(result.sourcePrompts.includes('ChooseAttackPrompt'));
    assert.ok(result.sourcePrompts.includes('ChooseCardsPrompt'));
    assert.ok(result.sourcePrompts.includes('ShowCardsPrompt'));
    assert.equal(result.sourceDeckDelta,-1);
    assert.equal(result.sourceDiscardDelta,1);
    assert.equal(result.sourceTopMovedToDiscard,true);
    assert.equal(result.mimikyuDeckDelta,0);
    assert.ok(result.copycatPrompts.includes('ShowCardsPrompt'));
    assert.equal(result.competitiveQualifiedGames,0);
    console.log('AGENT8_COPYCAT_ROTOTILLER_BURROW',JSON.stringify(result));
  });

  test('native Copycat follows Burrow then Rototiller and recycles its own discard, seat '+sourceSeat,()=>{
    const result=probeAttackOrder(sourceSeat,'Burrow','Rototiller');
    assert.equal(result.finalPreviousAttack,'Rototiller');
    assert.ok(result.sourcePrompts.includes('ConfirmPrompt'));
    assert.ok(result.sourcePrompts.includes('ChooseAttackPrompt'));
    assert.ok(result.sourcePrompts.includes('ChooseCardsPrompt'));
    assert.ok(result.sourcePrompts.includes('ShowCardsPrompt'));
    assert.equal(result.sourceDeckDelta,0);
    assert.equal(result.sourceDiscardDelta,0);
    assert.equal(result.sourceTopMovedToDiscard,false);
    assert.equal(result.mimikyuDeckDelta,1);
    assert.equal(result.mimikyuDiscardDelta,-1);
    assert.equal(result.mimikyuRecoveryReturnedToDeck,true);
    assert.ok(result.copycatPrompts.includes('ChooseCardsPrompt'));
    assert.equal(result.competitiveQualifiedGames,0);
    console.log('AGENT8_COPYCAT_BURROW_ROTOTILLER',JSON.stringify(result));
  });
}
