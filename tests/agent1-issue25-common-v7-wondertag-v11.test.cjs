'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,withCommonOwnerWonderTagV11,trialActorRoles,
  runAgent1CommonWonderTagV11
}=require('../simulation/evaluation/agent1-issue25-common-v7-wondertag-v11.cjs');
const {registeredTrials}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');

test('common owner wrapper composes trial witness, printed prompt and shuffle',()=>{
  const sequence=[];
  const wrap=(name,audit)=>(next,options)=>{
    sequence.push(name+':start');
    assert.ok(options===undefined||typeof options==='object');
    const result=next();
    sequence.push(name+':finish');
    return {result,audit};
  };
  const witness={audit:{decisions:[]},
    run:next=>{sequence.push('registered');return next();},
    selectSupporterIndex:()=>0,currentTrialId:()=> '11:203:B:champion-reference'};
  const output=withCommonOwnerWonderTagV11(()=>{
    sequence.push('native');return 'actual-native-result';
  },{
    owner:wrap('owner',{steps:3}),
    wonder:wrap('wonder',{selectedSupporters:1}),
    shuffle:wrap('shuffle',{validShuffleCallbacksCompleted:1}),
    witnessFactory:()=>witness
  });
  assert.equal(output.result,'actual-native-result');
  assert.deepEqual(sequence,[
    'shuffle:start','wonder:start','registered',
    'owner:start','native','owner:finish','wonder:finish',
    'shuffle:finish'
  ]);
  assert.equal(output.audit.ownerWonderTag.selectedSupporters,1);
  assert.equal(output.audit.ownerNativeShuffle.validShuffleCallbacksCompleted,1);
  assert.equal(output.audit.inheritedOwnerPrizeAndPokemon.steps,3);
  assert.equal(output.audit.completePaperAbilityCertified,false);
});

test('exact frozen v6/v7 registered actor seats distinguish original sources',()=>{
  const reg=registeredTrials();
  const a=reg.find(x=>x.rank===11&&x.candidateSlot==='A');
  const b=reg.find(x=>x.rank===11&&x.candidateSlot==='B');
  const c=reg.find(x=>x.rank===6&&x.candidateSlot==='B');
  const o=trialActorRoles([
    {id:a.id,actorSeat:1,answerCardinality:1,globalTurn:2},
    {id:b.id,actorSeat:0,answerCardinality:1,globalTurn:3},
    {id:c.id,actorSeat:1,answerCardinality:0,globalTurn:4}
  ]);
  assert.deepEqual(o.map(x=>x.role),
    ['original-source','original-source','contender']);
  assert.deepEqual(o.map(x=>x.sourceRank),[11,11,6]);
  assert.ok(o.every(x=>x.ownerDeckPrintingsOmitted));
  assert.throws(()=>trialActorRoles([{
    id:'outside-native-registration',actorSeat:0,
    answerCardinality:1,globalTurn:1
  }]),/no original v6\/v7 registration/);
});

function baseline(overrides={}){
  const id='11:203:B:champion-reference';
  const audit={
    currentRegisteredActorWitness:{
      decisions:[{id,actorSeat:0,answerCardinality:1,globalTurn:3}]
    },
    ownerWonderTag:{
      selectedSupporters:1,settledSupporterTransfers:1,
      nativeRejected:0,nativeUnsettled:0,nativeCustodyFailures:0
    },
    ownerNativeShuffle:{
      offeredTrialSeats:[{id,seat:0}],
      completedTrialSeats:[{id,seat:0}],
      nativeTrialAttributionAvailable:true,
      shufflePromptsOffered:1,validShuffleCallbacksCompleted:1,
      allOfferedShufflesCompleted:true
    },
    inheritedOwnerPrizeAndPokemon:{eligible:true}
  };
  Object.assign(audit,overrides);
  const rows=registeredTrials().map(x=>({
    id:x.id,sourceSeat:x.candidateSlot==='A'?1:0,
    status:'returned-unqualified',rootCount:96,
    sourcePhysicalDealFingerprint:'audited-native-only',
    fullPhysicalDealFingerprint:'audited-native-only',
    settledSourceAttacks:0
  }));
  const ownerLayer=()=>({result:null,audit});
  const base=options=>{
    assert.strictEqual(options.baseOwnerPromptLayer,ownerLayer);
    return {
      manifest:{version:'inherited-v7',
        resolvedSourceAndPolicyHashes:[]},
      diagnostic:{
        registered:rows.map(x=>x.id),
        attemptedRows:rows,
        innerNativeOwnerPromptAudit:{
          preexistingPrizeAndPromotion:audit
        },
        actualNativeAttempts:rows
      },
      rawDevelopment:{rows:[]}
    };
  };
  return {ownerLayer,base,audit};
}

test('native completed same-trial shuffle joins one source search but never games',()=>{
  const deps=baseline();
  const r=runAgent1CommonWonderTagV11(deps);
  assert.equal(r.manifest.version,VERSION);
  assert.equal(r.diagnostic.nativePrintedShuffleCompletionCertified,true);
  assert.equal(r.diagnostic.registeredNativeShuffleTrialSeatJoin,true);
  assert.equal(r.diagnostic.registeredActorDecisions.length,1);
  assert.equal(r.diagnostic.registeredActorDecisions[0].role,'original-source');
  assert.equal(r.diagnostic.nativeEight.length,8);
  assert.equal(r.manifest.competitiveGamesQualified,0);
  assert.equal(r.diagnostic.estimatedWinRate,null);
  assert.equal(r.manifest.originalPolicySelected,undefined);
  assert.equal(r.diagnostic.originalPolicySelected,false);
});

test('wrong trial, absent shuffle and missing paper settlement each veto admission',()=>{
  for(const kind of ['wrong-trial','unresolved','no-transfer']){
    const deps=baseline();
    const n=deps.audit.ownerNativeShuffle;
    if(kind==='wrong-trial')
      n.completedTrialSeats=[{id:'11:202:A:champion-reference',seat:0}];
    if(kind==='unresolved')n.allOfferedShufflesCompleted=false;
    if(kind==='no-transfer')
      deps.audit.ownerWonderTag.settledSupporterTransfers=0;
    const r=runAgent1CommonWonderTagV11(deps);
    assert.equal(r.diagnostic.nativePrintedShuffleCompletionCertified,false,kind);
    assert.equal(r.diagnostic.competitiveGamesQualified,0,kind);
  }
});

test('zero actual printed Supporter searches is an unmet witness, not vacuous success',()=>{
  const deps=baseline();
  deps.audit.currentRegisteredActorWitness.decisions=[];
  deps.audit.ownerWonderTag.selectedSupporters=0;
  deps.audit.ownerWonderTag.settledSupporterTransfers=0;
  deps.audit.ownerNativeShuffle.offeredTrialSeats=[];
  deps.audit.ownerNativeShuffle.completedTrialSeats=[];
  deps.audit.ownerNativeShuffle.shufflePromptsOffered=0;
  deps.audit.ownerNativeShuffle.validShuffleCallbacksCompleted=0;
  const r=runAgent1CommonWonderTagV11(deps);
  assert.equal(r.diagnostic.registeredNativeShuffleTrialSeatJoin,true);
  assert.equal(r.diagnostic.registeredActorDecisions.length,0);
  assert.equal(r.diagnostic.nativePrintedShuffleCompletionCertified,false);
  assert.equal(r.diagnostic.competitiveGamesQualified,0);
});
