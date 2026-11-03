'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditOriginalEnergyMixShuffleLineages,auditSourceRows}=
  require('../simulation/evaluation/agent19-original-energy-mix-shuffle-lineage-audit.cjs');

function originalRoot({shuffle=false,seat=1,attack='Cross Fusion Strike'}={}){
  const owner=seat;
  const ordinal=20;
  const events=[
    {actionOrdinal:20,action:'AttackAction',attack,
      playerSlot:owner,initiatingRootActionOrdinal:ordinal},
    {actionOrdinal:21,action:'ResolvePromptAction',
      pendingPrompt:'ChooseAttackPrompt',attackChoice:{
        attackName:'Energy Mix',printing:'Mew V FST'
      },playerSlot:owner,initiatingRootActionOrdinal:ordinal},
    {actionOrdinal:22,action:'ResolvePromptAction',
      pendingPrompt:'AttachEnergyPrompt',
      playerSlot:owner,initiatingRootActionOrdinal:ordinal}
  ];
  if(shuffle)events.push({actionOrdinal:23,action:'ResolvePromptAction',
    pendingPrompt:'ShuffleDeckPrompt',playerSlot:owner,
    initiatingRootActionOrdinal:ordinal});
  events.push({actionOrdinal:shuffle?24:23,action:'ResolvePromptAction',
    pendingPrompt:'WaitPrompt',playerSlot:owner,
    initiatingRootActionOrdinal:ordinal});
  return {sourceSeat:seat,trial:{id:'5:0:A:champion-reference'},
    rootActionLedger:events};
}

test('original source Copy / Energy Mix has a complete attach yet missing mandatory shuffle',()=>{
  const audit=auditOriginalEnergyMixShuffleLineages(originalRoot());
  assert.equal(audit.status,'AUDITED_NATIVE_ROOTS');
  assert.equal(audit.observedChoices,1);
  assert.equal(audit.withPhysicalAttachPrompt,1);
  assert.equal(audit.missingPrintedShuffle,1);
  assert.equal(audit.withPrintedShuffleAfterAttach,0);
  assert.equal(audit.chains[0].originalAttack,'Cross Fusion Strike');
  assert.equal(audit.chains[0].status,'PRINTED_SHUFFLE_MISSING');
  assert.equal(audit.competitiveQualifiedGames,0);
});

test('native ShuffleDeckPrompt after source attach certifies prompt settlement only',()=>{
  const audit=auditOriginalEnergyMixShuffleLineages(originalRoot({shuffle:true}));
  assert.equal(audit.withPrintedShuffleAfterAttach,1);
  assert.equal(audit.missingPrintedShuffle,0);
  assert.deepEqual(audit.chains[0].sameRootPromptKinds,[
    'ChooseAttackPrompt','AttachEnergyPrompt','ShuffleDeckPrompt','WaitPrompt']);
  assert.equal(audit.chains[0].paperComplete,false);
});

test('wrong owner seat and unrelated attack cannot fabricate source shuffle',()=>{
  const seatMismatch=originalRoot({seat:1});
  seatMismatch.sourceSeat=0;
  assert.equal(auditOriginalEnergyMixShuffleLineages(seatMismatch).observedChoices,0);
  const unexpected=originalRoot({attack:'G-Max Rapid Flow'});
  const result=auditOriginalEnergyMixShuffleLineages(unexpected);
  assert.equal(result.observedChoices,1);
  assert.equal(result.unverifiedLineages,1);
  assert.equal(result.missingPrintedShuffle,0);
});

test('shuffles from another root and out-of-order shuffles cannot close an Energy Mix obligation',()=>{
  const row=originalRoot();
  row.rootActionLedger.splice(3,0,{actionOrdinal:23,
    action:'ResolvePromptAction',pendingPrompt:'ShuffleDeckPrompt',
    playerSlot:1,initiatingRootActionOrdinal:9});
  assert.equal(auditOriginalEnergyMixShuffleLineages(row).missingPrintedShuffle,1);
  const wrongOrder=originalRoot({shuffle:true});
  wrongOrder.rootActionLedger.find(x=>x.pendingPrompt==='ShuffleDeckPrompt').actionOrdinal=19;
  assert.equal(auditOriginalEnergyMixShuffleLineages(wrongOrder).missingPrintedShuffle,1);
});

test('aggregate retains missing native ledgers, zero-opportunity source trials and evidence count',()=>{
  const missing={trial:{id:'5:0:B:champion-reference'},sourceSeat:null};
  const noChance={sourceSeat:0,trial:{id:'5:1:A:champion-reference'},
    rootActionLedger:[]};
  const rows=[originalRoot(),originalRoot({shuffle:true}),missing,noChance];
  const result=auditSourceRows(rows);
  assert.equal(result.observedRows,4);
  assert.equal(result.unobservableRows,1);
  assert.equal(result.totalChoices,2);
  assert.equal(result.withAttach,2);
  assert.equal(result.withShuffle,1);
  assert.equal(result.missingShuffle,1);
  assert.equal(result.competitiveQualifiedGames,0);
});
