'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,preflight,withRegisteredGuzma,firstDivergence,
  compactNativeWitness
}=require('../simulation/evaluation/agent13-rank5-guzma-t46-retro-20261103.cjs');

test('preregistered exact source 60, native engine pin, runner code and fixed deal',()=>{
  const {registration,base,trials}=preflight();
  assert.equal(VERSION,'agent13-rank5-t46-guzma-retro-twoarm-native-v1');
  assert.equal(registration.expectedNativeAttempts,2);
  assert.equal(registration.commonSettings.rootActionCap,340);
  assert.equal(base.policyOptions.nativeRootActionLimit,260);
  assert.deepEqual(trials,[{
    rank:5,candidateSlot:'B',repeat:1,seed:561933954,
    candidateId:'new-moon-lockbreaker-v1',
    id:'5:1:B:new-moon-lockbreaker-v1'
  }]);
  assert.equal(registration.resultsAdmittedAsCompetitiveGames,false);
});

test('dev-only env toggle restores on success and thrown failure',()=>{
  const before=process.env.AGENT13_DCE_FUSION_GUZMA_RETRO_DEV;
  delete process.env.AGENT13_DCE_FUSION_GUZMA_RETRO_DEV;
  try{
    assert.equal(withRegisteredGuzma(false,()=>
      process.env.AGENT13_DCE_FUSION_GUZMA_RETRO_DEV),undefined);
    assert.equal(withRegisteredGuzma(true,()=>
      process.env.AGENT13_DCE_FUSION_GUZMA_RETRO_DEV),'true');
    assert.equal(process.env.AGENT13_DCE_FUSION_GUZMA_RETRO_DEV,undefined);
    assert.throws(()=>withRegisteredGuzma(true,()=>{throw Error('boom');}),
      /boom/);
    assert.equal(process.env.AGENT13_DCE_FUSION_GUZMA_RETRO_DEV,undefined);
  }finally{
    if(before===undefined)
      delete process.env.AGENT13_DCE_FUSION_GUZMA_RETRO_DEV;
    else process.env.AGENT13_DCE_FUSION_GUZMA_RETRO_DEV=before;
  }
});

test('first divergence compares full public original root prefixes',()=>{
  const control={rootActionLedger:[
    {actionOrdinal:1,turnBefore:1,playerSlot:0,action:'PassTurnAction'},
    {actionOrdinal:254,turnBefore:46,playerSlot:0,action:'PassTurnAction'}
  ]};
  const treatment={rootActionLedger:[
    control.rootActionLedger[0],
    {actionOrdinal:254,turnBefore:46,playerSlot:0,
      action:'PlayCardAction',card:'Guzma'}
  ]};
  const got=firstDivergence(control,treatment);
  assert.equal(got.exactMatchingPublicRootPrefixEvents,1);
  assert.equal(got.controlFirstDifferentRoot.action,'PassTurnAction');
  assert.equal(got.treatmentFirstDifferentRoot.card,'Guzma');
  assert.equal(got.entirePublicRootLedgerIdentical,false);
  assert.equal(firstDivergence(control,control)
    .entirePublicRootLedgerIdentical,true);
});

test('native row witness separates source seat, DCE and confirmed attacks',()=>{
  const row={
    trial:{candidateSlot:'B'},nativeEndReason:'action-limit',
    actionCount:340,status:'capped',
    sourceDealFingerprint:'source-identical',
    fullPhysicalDealFingerprint:'two-identical',
    rootActionLedger:[
      {playerSlot:0,action:'PlayCardAction',card:'Guzma'},
      {playerSlot:1,action:'PlayCardAction',card:'Guzma'},
      {playerSlot:0,action:'PlayCardAction',card:'Double Colorless Energy'},
      {playerSlot:0,action:'AttackAction',attack:'Cross Fusion Strike'}
    ],
    actorOnlyDecisionCoverage:{detailedComponentAudits:{root:{
      dceFusionCopyGuzmaOptIn:true
    }}}
  };
  const x=compactNativeWitness(row);
  assert.equal(x.sourceSeat,0);
  assert.equal(x.sourceGuzmaRoots.length,1);
  assert.equal(x.sourceDceRootAttachments.length,1);
  assert.equal(x.sourceAttackRoots.length,1);
  assert.equal(x.rootGuzmaProposalOptIn,true);
  assert.equal(x.competitiveGameQualified,false);
});
