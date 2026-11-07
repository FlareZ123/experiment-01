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

function assertSourceHistory(result,firstAttack,secondAttack){
  assert.equal(result.recordedPreviousAttack,firstAttack);
  assert.deepEqual(result.paperRuleEligibleAttacks,[firstAttack,secondAttack]);
  assert.deepEqual(result.historyAttackNames,[firstAttack,secondAttack]);
  assert.deepEqual(result.eligibleHistoryAttackNames,[firstAttack,secondAttack]);
  assert.equal(result.engineRecordedAttackCount,1);
  assert.equal(result.historyRecordedAttackCount,2);
  const burrowWasFirst=result.historyAttackNames[0]==='Burrow';
  assert.equal(result.sourceTurnMimikyuDeckDelta,burrowWasFirst?-2:-1);
  assert.equal(result.sourceTurnMimikyuDiscardDelta,burrowWasFirst?1:0);
  assert.equal(result.sourceTurnMimikyuHandDelta,burrowWasFirst?1:0);
  assert.ok(result.sourcePrompts.includes('ConfirmPrompt'));
  assert.ok(result.sourcePrompts.includes('ChooseAttackPrompt'));
  assert.ok(result.sourcePrompts.includes('ChooseCardsPrompt'));
  assert.ok(result.sourcePrompts.includes('ShuffleDeckPrompt'));
  assert.deepEqual(result.unresolvedPrompts,[]);
  assert.equal(result.competitiveQualifiedGames,0);
}

function assertCopycatBurrow(result){
  assert.equal(result.copycatExecutedAttack,'Burrow');
  assert.equal(result.sourceDeckDelta,-2);
  assert.equal(result.sourceDiscardDelta,1);
  assert.equal(result.sourceHandDelta,1);
  assert.equal(result.sourceTopMovedToDiscard,true);
  assert.equal(result.sourceNextTopMovedToHand,true);
  assert.equal(result.mimikyuDeckDelta,0);
  assert.equal(result.mimikyuRecoverySelected,false);
  assert.ok(!result.copycatPrompts.includes('ChooseCardsPrompt'));
  assert.ok(!result.copycatPrompts.includes('ShuffleDeckPrompt'));
}

function assertCopycatRototiller(result){
  assert.equal(result.copycatExecutedAttack,'Rototiller');
  assert.equal(result.sourceDeckDelta,-1);
  assert.equal(result.sourceDiscardDelta,0);
  assert.equal(result.sourceHandDelta,1);
  assert.equal(result.sourceTopMovedToDiscard,false);
  assert.equal(result.sourceTopMovedToHand,true);
  assert.equal(result.mimikyuDeckDelta,1);
  assert.equal(result.mimikyuDiscardDelta,-1);
  assert.equal(result.mimikyuRecoveryReturnedToDeck,true);
  assert.equal(result.mimikyuRecoverySelected,true);
  assert.ok(result.copycatPrompts.includes('ChooseCardsPrompt'));
  assert.ok(result.copycatPrompts.includes('ShuffleDeckPrompt'));
}

for(const sourceSeat of [0,1]){
  test('native Store baseline retains first attack after Rototiller then Burrow; Copycat uses Rototiller, seat '+sourceSeat,()=>{
    const result=probeAttackOrder(sourceSeat,'Rototiller','Burrow','engine');
    assertSourceHistory(result,'Rototiller','Burrow');
    assert.equal(result.adapterOverrideApplied,false);
    assertCopycatRototiller(result);
    console.log('AGENT8_COPYCAT_ENGINE_FIRST_ROTOTILLER_BURROW',JSON.stringify(result));
  });

  test('native Store baseline retains first attack after Burrow then Rototiller; Copycat uses Burrow, seat '+sourceSeat,()=>{
    const result=probeAttackOrder(sourceSeat,'Burrow','Rototiller','engine');
    assertSourceHistory(result,'Burrow','Rototiller');
    assert.equal(result.adapterOverrideApplied,false);
    assertCopycatBurrow(result);
    console.log('AGENT8_COPYCAT_ENGINE_FIRST_BURROW_ROTOTILLER',JSON.stringify(result));
  });

  test('adapter can select second Burrow after Rototiller then Burrow, seat '+sourceSeat,()=>{
    const result=probeAttackOrder(sourceSeat,'Rototiller','Burrow','second');
    assertSourceHistory(result,'Rototiller','Burrow');
    assert.equal(result.adapterOverrideApplied,true);
    assertCopycatBurrow(result);
    console.log('AGENT8_COPYCAT_ADAPTER_SECOND_BURROW',JSON.stringify(result));
  });

  test('adapter can select second Rototiller after Burrow then Rototiller, seat '+sourceSeat,()=>{
    const result=probeAttackOrder(sourceSeat,'Burrow','Rototiller','second');
    assertSourceHistory(result,'Burrow','Rototiller');
    assert.equal(result.adapterOverrideApplied,true);
    assertCopycatRototiller(result);
    console.log('AGENT8_COPYCAT_ADAPTER_SECOND_ROTOTILLER',JSON.stringify(result));
  });
}


const {installCopycatMultiAttackHistory}=
  require('../simulation/twinleaf/copycat-multiattack-history.cjs');

test('history distinguishes unavailable from a completed empty previous turn',()=>{
  const store={
    state:{players:[{id:10},{id:20}],activePlayer:0,turn:1},
    dispatch(){
      this.state={
        ...this.state,
        activePlayer:1-this.state.activePlayer,
        turn:this.state.turn+1
      };
    }
  };
  const history=installCopycatMultiAttackHistory(store);
  try{
    assert.equal(history.hasPreviousTurn(10),false);
    assert.equal(history.getPreviousTurnSnapshot(10),null);
    assert.equal(history.hasPreviousTurn(20),false);

    // Player 10 completes a turn without an attack. This is known-empty.
    store.dispatch({kind:'pass'});
    assert.equal(history.hasPreviousTurn(10),true);
    assert.deepEqual(history.getPreviousTurnSnapshot(10),
      {turn:1,attacks:[]});
    assert.deepEqual(history.getPreviousTurnAttacks(10),[]);
    assert.equal(history.hasPreviousTurn(20),false);

    // Player 20 has still not completed a turn at this point.
    assert.equal(history.getPreviousTurnSnapshot(20),null);
    store.dispatch({kind:'pass'});
    assert.deepEqual(history.getPreviousTurnSnapshot(20),
      {turn:2,attacks:[]});
  }finally{
    history.restore();
  }
});
