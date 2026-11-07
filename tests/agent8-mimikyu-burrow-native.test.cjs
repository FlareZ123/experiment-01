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
    assert.equal(result.sourceDeckDelta,-2);
    assert.equal(result.sourceDiscardDelta,1);
    assert.equal(result.sourceHandDelta,1);
    assert.equal(result.sourceTopMovedToDiscard,true);
    assert.equal(result.sourceNextTopMovedToHand,true);
    assert.equal(result.candidateDeckDelta,-2);
    assert.equal(result.candidateDiscardDelta,1);
    assert.equal(result.candidateHandDelta,1);
    assert.deepEqual(result.unresolvedPrompts,[]);
    assert.equal(result.ownerActiveEnergyCount,2);
    assert.equal(result.ownerUsedGX,false);
    assert.equal(result.competitiveQualifiedGames,0);
    console.log('AGENT8_MIMIKYU_BURROW_COPYCAT_NATIVE',JSON.stringify(result));
  });
}

for(const sourceSeat of [0,1]){
  test('native Store retains first attack after Rototiller then Burrow; Copycat uses Rototiller, seat '+sourceSeat,()=>{
    const result=probeAttackOrder(sourceSeat,'Rototiller','Burrow');
    assert.equal(result.recordedPreviousAttack,'Rototiller');
    assert.deepEqual(result.paperRuleEligibleAttacks,['Rototiller','Burrow']);
    assert.equal(result.engineRecordedAttackCount,1);
    assert.equal(result.paperRuleMismatch,true);
    assert.equal(result.sourceTurnMimikyuDeckDelta,-2);
    assert.equal(result.sourceTurnMimikyuDiscardDelta,1);
    assert.equal(result.sourceTurnMimikyuHandDelta,1);
    assert.ok(result.sourcePrompts.includes('ConfirmPrompt'));
    assert.ok(result.sourcePrompts.includes('ChooseAttackPrompt'));
    assert.ok(result.sourcePrompts.includes('ChooseCardsPrompt'));
    assert.ok(result.sourcePrompts.includes('ShuffleDeckPrompt'));
    assert.equal(result.sourceDeckDelta,-1);
    assert.equal(result.sourceDiscardDelta,0);
    assert.equal(result.sourceHandDelta,1);
    assert.equal(result.sourceTopMovedToDiscard,false);
    assert.equal(result.sourceTopMovedToHand,true);
    assert.equal(result.mimikyuDeckDelta,1);
    assert.equal(result.mimikyuDiscardDelta,-1);
    assert.equal(result.mimikyuRecoveryReturnedToDeck,true);
    assert.ok(result.copycatPrompts.includes('ChooseCardsPrompt'));
    assert.ok(result.copycatPrompts.includes('ShuffleDeckPrompt'));
    assert.equal(result.competitiveQualifiedGames,0);
    console.log('AGENT8_COPYCAT_FIRST_ATTACK_ROTOTILLER_BURROW',JSON.stringify(result));
  });

  test('native Store retains first attack after Burrow then Rototiller; Copycat uses Burrow, seat '+sourceSeat,()=>{
    const result=probeAttackOrder(sourceSeat,'Burrow','Rototiller');
    assert.equal(result.recordedPreviousAttack,'Burrow');
    assert.deepEqual(result.paperRuleEligibleAttacks,['Burrow','Rototiller']);
    assert.equal(result.engineRecordedAttackCount,1);
    assert.equal(result.paperRuleMismatch,true);
    assert.equal(result.sourceTurnMimikyuDeckDelta,-2);
    assert.equal(result.sourceTurnMimikyuDiscardDelta,1);
    assert.equal(result.sourceTurnMimikyuHandDelta,1);
    assert.ok(result.sourcePrompts.includes('ConfirmPrompt'));
    assert.ok(result.sourcePrompts.includes('ChooseAttackPrompt'));
    assert.ok(result.sourcePrompts.includes('ChooseCardsPrompt'));
    assert.ok(result.sourcePrompts.includes('ShuffleDeckPrompt'));
    assert.equal(result.sourceDeckDelta,-2);
    assert.equal(result.sourceDiscardDelta,1);
    assert.equal(result.sourceHandDelta,1);
    assert.equal(result.sourceTopMovedToDiscard,true);
    assert.equal(result.sourceNextTopMovedToHand,true);
    assert.equal(result.mimikyuDeckDelta,0);
    assert.equal(result.mimikyuRecoverySelected,false);
    assert.ok(!result.copycatPrompts.includes('ChooseCardsPrompt'));
    assert.ok(!result.copycatPrompts.includes('ShuffleDeckPrompt'));
    assert.equal(result.competitiveQualifiedGames,0);
    console.log('AGENT8_COPYCAT_FIRST_ATTACK_BURROW_ROTOTILLER',JSON.stringify(result));
  });
}
