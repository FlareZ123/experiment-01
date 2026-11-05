'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {originalPublicAbortReadout,run}=
  require('../simulation/evaluation/agent4-96root-volt-abort-readout-v1.cjs');
const registration=require('../results/aichi-2026/registrations/agent4-96root-volt-abort-readout-20261105.json');
const ID=registration.registeredTrial;
const CHAMP=registration.pairedChampionTrial;
const root=(ordinal,turn,seat,action,attack=null)=>({
  actionOrdinal:ordinal,turnBefore:turn,playerSlot:seat,
  action,attack,pendingPrompt:null
});
test('accepted source attack and next genuinely accepted candidate reply',()=>{
  const rows=[
    root(87,17,1,'PlayCardAction'),
    root(88,17,1,'AttackAction','Volt Cyclone'),
    {...root(89,18,0,'ResolvePromptAction'),pendingPrompt:'WaitPrompt'},
    root(90,18,0,'PlayCardAction')
  ];
  const p=originalPublicAbortReadout({
    trial:{id:ID},status:'native-terminal-unqualified',rootActionLedger:rows
  });
  assert.equal(p.allVoltCycloneAcceptedPublicRoots.length,1);
  assert.equal(p.allVoltCycloneAcceptedPublicRoots[0].ordinal,88);
  assert.equal(p.firstCandidateMeaningfulResponseAfterVoltCyclone.ordinal,90);
  assert.equal(p.candidateResponseConfirmed,true);
  assert.equal(p.acceptedRootCount,4);
  assert.equal(p.physicalPaperDamageOrPaymentProven,false);
});
test('native error keeps stage, prompt and public board while hiding error text',()=>{
  const roots=[root(88,17,1,'AttackAction','Volt Cyclone')];
  const p=originalPublicAbortReadout({
    trial:{id:ID},status:'engine-error',
    nativeAbortEvidence:{
      failureStage:'bot-decoder',actionOrdinal:89,
      actionName:'BotDecodeFailure',turnBefore:17,
      actingSeat:1,pendingPrompt:'ChooseCardsPrompt',
      rootActionLedger:roots,
      preDispatchBoard:[{active:null,bench:[],stadium:[]},
        {active:{name:'Iron Thorns ex',damage:0,
          energyCards:['Double Colorless Energy'],toolCards:[]},
          bench:[],stadium:['Thunder Mountain']}],
      decoderFrameAttribution:{errorClass:'TypeError',
        frames:[{file:'choose-cards-tactic.js',line:42,column:9}]}
    },
    error:'hidden actual error'
  });
  assert.equal(p.nativeStatus,'engine-error');
  assert.equal(p.acceptedRootCount,1);
  assert.equal(p.failedActionOrdinal,89);
  assert.equal(p.failedPendingPrompt,'ChooseCardsPrompt');
  assert.equal(p.candidateResponseConfirmed,false);
  assert.equal(p.preFailurePublicBoard[1].active.name,'Iron Thorns ex');
  assert.equal(p.nativeErrorMessageSha256,
    createHash('sha256').update('hidden actual error').digest('hex'));
  assert.equal(JSON.stringify(p).includes('hidden actual error'),false);
});
test('all four phase readouts remain with source native error and zero qualified games',()=>{
  const base=()=>{
    const first=[ID,CHAMP].map(id=>({
      trial:{id},status:'engine-error',
      nativeAbortEvidence:{failureStage:'bot-decoder',
        actionOrdinal:89,
        rootActionLedger:[root(88,17,1,'AttackAction','Volt Cyclone')]}
    }));
    const rest=Array.from({length:6},(_,i)=>({
      trial:{id:'other'+i},status:'nonterminal-unqualified',
      rootActionLedger:[]
    }));
    return {rawDevelopment:{rows:[...first,...rest]}};
  };
  const r=run({
    incumbent:base,
    runner:({incumbent})=>{
      for(let i=0;i<4;i++)incumbent();
      return {gates:{original32:true},
        sourceAndCandidateOpportunitySummary:{
          sourceSelectedAttackDeclarationsTreatment:1
        }};
    }
  });
  assert.equal(r.allPhaseTargetAndChampionPublicAbortReadouts.length,4);
  assert.equal(r.targetNativeEvent.nativeStatus,'engine-error');
  assert.equal(r.targetNativeEvent.candidateResponseConfirmed,false);
  assert.equal(r.controlledNativeQualification,0);
  assert.equal(r.winRate,null);
});
