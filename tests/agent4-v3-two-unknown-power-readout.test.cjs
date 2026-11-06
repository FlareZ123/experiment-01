'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {selectedTrials,summarize,run}=
  require('../simulation/evaluation/agent4-v3-two-unknown-power-readout.cjs');
const registration=require('../results/aichi-2026/registrations/agent4-v3-two-unknown-power-readout-20261106.json');

function manifest(){
  return {
    nativeActionCap:180,
    commonPolicy:{actorOnlyComposition:true,nativeRootActionLimit:180},
    registeredTrials:registration.contexts.map(x=>({...x})),
    modes:registration.modes.map((id,i)=>({
      id,ownerGenericTrainerFrontier:i===1,
      actorFundedShadowRiderFloatStoneRoot:i===1
    }))
  };
}
test('only exact two historical source IDs and seeds enter the native diagnostic',()=>{
  const m=manifest(),trials=selectedTrials(m);
  assert.deepEqual(trials.map(x=>x.id),registration.contexts.map(x=>x.id));
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
test('all six exact live trials and three unchanged modes retain both errors',()=>{
  const m=manifest(),callOptions=[];
  const simulated=run({
    manifest:()=>m,runtime:fn=>fn(),
    native:options=>{
      callOptions.push(options);
      return {attempted:2,rows:options.registeredTrials.map((trial,i)=>({
        trial,status:'engine-error',finished:false,
        sourceDealFingerprint:'source'+i,
        fullPhysicalDealFingerprint:'whole'+i,
        rootActionLedgerSha256:'prefix'+i,
        nativeAbortEvidence:{actionOrdinal:i===0?141:69}
      }))};
    },
    witness:fn=>({
      result:fn(),
      audit:{liveGameCount:2,auxiliaryAbilityDispatchCount:0,
        abilityActions:[
          {liveGameIndex:0,abilityName:'A',rejection:'UNKNOWN_POWER'},
          {liveGameIndex:1,abilityName:'B',rejection:'UNKNOWN_POWER'}
        ]}
    })
  });
  assert.equal(callOptions.length,3);
  assert.ok(callOptions.every(x=>x.registeredTrials.length===2));
  assert.equal(simulated.actualNativeAttemptCount,6);
  assert.equal(simulated.paired.length,2);
  assert.ok(simulated.paired.every(x=>
    x.sourceFingerprintMatchedAllThree&&
    x.fullPhysicalDealMatchedAllThree&&
    x.aRepeatExactAcceptedPrefixAndDisposition));
  assert.deepEqual(simulated.paired[0].unknownPowerRejectionsByMode,[1,1,1]);
  assert.equal(simulated.competitiveQualifiedGames,0);
  assert.equal(simulated.fieldWinRate,null);
});
test('native mismatched or missing source ID fails rather than being reported',()=>{
  assert.throws(()=>run({
    manifest,runtime:fn=>fn(),
    witness:fn=>({result:fn(),audit:{liveGameCount:2,
      auxiliaryAbilityDispatchCount:0,abilityActions:[]}}),
    native:()=>({attempted:2,rows:[
      {trial:{id:'wrong'}},{trial:{id:registration.contexts[1].id}}
    ]})
  }),/deep-equal/);
});
