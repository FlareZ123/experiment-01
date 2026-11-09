'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {registered,options,sourceNativeActions,run,PHASES}=
  require('../../simulation/evaluation/2026-11/agent8-source-challenger-2x2-v3.cjs');

test('new prospective original rank5 and rank13 have two different physical seeds per seat',()=>{
  const rows=registered();
  assert.equal(rows.length,8);
  assert.equal(new Set(rows.map(x=>x.seed)).size,8);
  for(const rank of [5,13])for(const seat of ['A','B'])
    assert.equal(rows.filter(x=>x.rank===rank&&x.candidateSlot===seat).length,2);
});

test('Genesect and normal evolution are original-source-only new opt-ins',()=>{
  const off=options(false),on=options(true);
  for(const name of [
    'actorNaturalEvolutionRoot','actorNaturalEvolutionSourceOnly',
    'actorGenesectFusionDrawRoot','actorGenesectFusionDrawSourceOnly',
    'sourceScopedQuickBallRoot','actorOwnerMailAfterPassSourceOnly']){
    assert.equal(off[name],false,name+' baseline disabled');
    assert.equal(on[name],true,name+' source-only enabled');
  }
  for(const name of ['actorHandDiscard','actorOnlySingleSearch',
    'actorGuzmaPromptContinuation'])
    assert.equal(off[name],on[name]);
  assert.equal(PHASES.length,4);
});

test('count original-owned native ability and evolution actions with exact source seat',()=>{
  const receipt=sourceNativeActions({
    trial:{candidateSlot:'B'},
    rootActionLedger:[
      {playerSlot:0,action:'UseAbilityAction',ability:'Fusion Strike System'},
      {playerSlot:1,action:'UseAbilityAction',ability:'Fusion Strike System'},
      {playerSlot:0,action:'PlayCardAction',card:'Mew VMAX'},
      {playerSlot:0,action:'PlayCardAction',card:'Quick Ball'},
      {playerSlot:0,action:'PlayCardAction',card:"Trainers' Mail"},
      {playerSlot:0,action:'PlayCardAction',card:'Regidrago VSTAR'}
    ]
  });
  assert.equal(receipt.seat,0);
  assert.equal(receipt.genesectDrawRoot,1);
  assert.equal(receipt.ordinaryEvolutionToPrimaryAttacker,2);
  assert.equal(receipt.quickBall,1);
  assert.equal(receipt.trainersMail,1);
});

test('new registration four phase pure comparison does not score error or cap as win',()=>{
  const groups=registered();
  const r=run({runPhase:phase=>({
    selected:{rawDevelopment:{rows:groups.map(group=>({
      trial:group,
      rootActionLedger:[],
      finished:phase.id==='P0S0',
      winner:phase.id==='P0S0'?1:null,
      error:phase.id==='P1S1'?'synthetic native abort':null,
      fullPhysicalDealFingerprint:{id:group.id},
      sourceDealFingerprint:{source:group.id}
    }))}}
  })});
  assert.equal(r.nativeAttempts,32);
  assert.equal(r.totals.nativeErrors,8);
  assert.equal(r.totals.sourceGenesectDrawInBothS1,0);
  assert.equal(r.totals.sourcePrimaryEvolutionsInBothS1,0);
  assert.equal(r.totals.fourWayNaturalTerminalGroups,0);
  assert.equal(r.qualifyingCompetitiveGames,0);
  assert.equal(r.status,'PHYSICAL-MATCHED-DEVELOPMENT-ONLY');
});
