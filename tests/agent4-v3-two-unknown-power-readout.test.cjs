'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {manifestWithDriftAudit,selectedTrials,summarize,run}=
  require('../simulation/evaluation/agent4-v3-two-unknown-power-readout.cjs');
const registration=require('../results/aichi-2026/registrations/agent4-v3-two-unknown-power-readout-20261106.json');

function manifest(){
  return {
    nativeActionCap:180,
    commonPolicy:{actorOnlyComposition:true,nativeRootActionLimit:180},
    registeredTrials:registration.contexts.flatMap(x=>[x,{...x,
      candidateId:'new-moon-lockbreaker-v1',
      id:x.id.replace(':champion-reference',':new-moon-lockbreaker-v1')}]),
    modes:registration.modes.map((id,i)=>({
      id,ownerGenericTrainerFrontier:i===1,
      actorFundedShadowRiderFloatStoneRoot:i===1
    }))
  };
}
test('frozen manifest and exact printed source roster verified with drift reported',()=>{
  const {manifest,audit}=manifestWithDriftAudit();
  assert.equal(manifest.nativeActionCap,180);
  assert.equal(audit.currentFilesComparedWithFrozenHistoricalV3.length,6);
  assert.equal(audit.sourceAndRosterVerified,true);
  assert.ok(audit.currentFilesComparedWithFrozenHistoricalV3.every(x=>
    /^[a-f0-9]{40}$/.test(x.actual)&&/^[a-f0-9]{40}$/.test(x.expected)));
  assert.equal(audit.historicalCodeParityNotAssumed,true);
});
test('only exact two historical source IDs and seeds enter the native diagnostic',()=>{
  const m=manifest(),trials=selectedTrials(m);
  assert.deepEqual(trials.map(x=>x.id),manifest().registeredTrials.map(x=>x.id));
  m.registeredTrials[0].seed=123;
  assert.throws(()=>selectedTrials(m),/seed drift/);
});
test('typed Store witness cannot be attributed when live game index is ambiguous',()=>{
  const row={trial:{id:registration.contexts[0].id},
    status:'engine-error',
    rootActionLedgerSha256:'abc',
    nativeAbortEvidence:{failureStage:'bot-decoder',
      actionOrdinal:141,actingSeat:0,turnBefore:32}};
  const action={abilityName:'Unknown Ability',rejection:'UNKNOWN_POWER'};
  const unaligned=summarize(row,[action],false);
  assert.equal(unaligned.typedStoreAbilityAttributionReliable,false);
  assert.equal(unaligned.rejectedUnknownPowerActions.length,0);
  assert.equal(unaligned.acceptedRootLedgerSha256,'abc');
  assert.equal(unaligned.competitiveGameQualified,false);
  const aligned=summarize(row,[action],true);
  assert.equal(aligned.rejectedUnknownPowerActions[0].abilityName,
    'Unknown Ability');
});
test('twelve exact live trials retain both target errors and companion contexts',()=>{
  const m=manifest(),callOptions=[];
  const simulated=run({
    manifest:()=>m,runtime:fn=>fn(),
    native:options=>{
      callOptions.push(options);
      return {attempted:4,rows:options.registeredTrials.map((trial,i)=>({
        trial,status:'engine-error',finished:false,
        sourceDealFingerprint:'source'+i,
        fullPhysicalDealFingerprint:'whole'+i,
        rootActionLedgerSha256:'prefix'+i,
        nativeAbortEvidence:{actionOrdinal:i===0?141:69}
      }))};
    },
    witness:fn=>({
      result:fn(),
      audit:{liveGameCount:4,auxiliaryAbilityDispatchCount:0,
        abilityActions:[
          {liveGameIndex:0,abilityName:'A',rejection:'UNKNOWN_POWER'},
          {liveGameIndex:1,abilityName:'B',rejection:'UNKNOWN_POWER'}
        ]}
    })
  });
  assert.equal(callOptions.length,3);
  assert.ok(callOptions.every(x=>x.registeredTrials.length===4));
  assert.equal(simulated.actualNativeAttemptCount,12);
  assert.equal(simulated.paired.length,4);
  assert.ok(simulated.paired.every(x=>
    x.sourceFingerprintMatchedAllThree&&
    x.fullPhysicalDealMatchedAllThree&&
    x.aRepeatExactAcceptedPrefixAndDisposition));
  assert.deepEqual(simulated.paired[0].unknownPowerRejectionsByMode,[1,1,1]);
  assert.equal(simulated.competitiveQualifiedGames,0);
  assert.equal(simulated.fieldWinRate,null);
});
test('read-only public root window begins at historical abort ordinal',()=>{
  const {summarize}=require('../simulation/evaluation/agent4-v3-two-unknown-power-readout.cjs');
  const trace=Array.from({length:180},(_,i)=>({
    actionOrdinal:i,turnBefore:i<141?32:33,
    playerSlot:i%2,action:i===141?'AttackAction':'PassTurnAction',
    card:null,attack:i===141?'Trinity Nova':null,
    privateFieldShouldNeverLeak:'secret'
  }));
  const row={trial:{id:registration.contexts[0].id},
    status:null,finished:false,rootActionLedger:trace,
    rootActionCount:trace.length,endReason:'max-actions',
    turns:40};
  const x=summarize(row,[],true);
  assert.equal(x.acceptedRootCount,180);
  assert.equal(x.historicalOriginalAbortOrdinal,141);
  assert.equal(x.nativeFirst28AcceptedPublicRootsAfterOriginalAbort.length,28);
  assert.equal(x.nativeFirst28AcceptedPublicRootsAfterOriginalAbort[0].action,'AttackAction');
  assert.equal(x.nativeFirst28AcceptedPublicRootsAfterOriginalAbort[0].actionOrdinal,141);
  assert.equal(x.nativeFirst28AcceptedPublicRootsAfterOriginalAbort[0].
    privateFieldShouldNeverLeak,undefined);
  assert.equal(x.nativeFinished,false);
});
test('native accepted physical target is linked only at old public root ordinal',()=>{
  const {summarize}=require('../simulation/evaluation/agent4-v3-two-unknown-power-readout.cjs');
  const row={trial:{id:registration.contexts[0].id},status:null,
    rootActionLedger:Array.from({length:180},(_,i)=>({
      actionOrdinal:i,action:i===141?'PlayCardAction':'PassTurnAction',
      card:i===141?'Psychic Energy':null,turnBefore:32,playerSlot:0
    })),
    nativeAcceptedTargetSidecar:{
      rootOrdinalLinked:true,events:[
        {rootActionOrdinal:9,action:'PlayCardAction',
          declared:{status:'captured',ownerHandPrinting:'Item',
            target:{player:1,slot:2,index:1}},storeAccepted:true},
        {rootActionOrdinal:141,playerSlot:0,
          action:'PlayCardAction',
          declared:{status:'captured',ownerHandPrinting:'Psychic Energy',
            target:{player:1,slot:2,index:0},
            secretOwnerHandIndex:8},
          visibility:'public-after-dispatch',storeAccepted:true,
          publicBoardChanges:[{seat:0,position:'bench',index:0,
            after:{energy:['Psychic Energy']}}]}
      ]
    }
  };
  const x=summarize(row,[],true);
  const p=x.nativeFirstAcceptedPhysicalTargetAtOriginalAbort;
  assert.equal(x.nativePhysicalTargetLedgerLinked,true);
  assert.equal(p.length,1);
  assert.equal(p[0].ownerPublicCardPrinting,'Psychic Energy');
  assert.equal(p[0].declaredTarget.index,0);
  assert.equal(p[0].secretOwnerHandIndex,undefined);
  const bad=summarize({...row,nativeAcceptedTargetSidecar:{
    ...row.nativeAcceptedTargetSidecar,rootOrdinalLinked:false
  }},[],true);
  assert.equal(bad.nativeFirstAcceptedPhysicalTargetAtOriginalAbort.length,0);
});
test('native mismatched or missing source ID fails rather than being reported',()=>{
  assert.throws(()=>run({
    manifest,runtime:fn=>fn(),
    witness:fn=>({result:fn(),audit:{liveGameCount:4,
      auxiliaryAbilityDispatchCount:0,abilityActions:[]}}),
    native:()=>({attempted:4,rows:[
      {trial:{id:'wrong'}},
      ...manifest().registeredTrials.slice(1).map(trial=>({trial}))
    ]})
  }),/deep-equal/);
});
