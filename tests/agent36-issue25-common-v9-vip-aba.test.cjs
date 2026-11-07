'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,ROOT_LIMIT,PHASES,trials,withVipFlag,nativeVipOutcome,
  rootLedger,ledgerSha256,firstRootDifference,summarizeNativeAttempt,
  compare,phaseSummary,run
}=require('../simulation/evaluation/agent36-issue25-common-v9-vip-aba.cjs');

function nativeRow(id,action,overrides={}){
  return {
    id,trial:{id},sourceSeat:0,candidateSeat:1,
    sourceDealFingerprint:'source-opening-'+id,
    fullPhysicalDealFingerprint:'full-opening-'+id,
    rootActionLedger:[action],
    rootActionCount:1,actionCount:1,finished:false,winner:null,
    actorOnlyDecisionCoverage:{
      detailedComponentAudits:{
        ownerVipAfterPass:{
          originalPassRoots:2,eligiblePassRoots:1,
          acceptedItems:action.printing==='Battle VIP Pass FST'?1:0,
          rejectedItems:0,acceptedSearches:action.printing==='Battle VIP Pass FST'?1:0,
          rejectedSearches:0,nativeBenchConfirmed:action.printing==='Battle VIP Pass FST'?1:0,
          nativeBenchUnconfirmed:0,selectedBasics:action.printing==='Battle VIP Pass FST'?1:0,
          unresolvedOwnerSearches:0,bySeat:{0:{acceptedItems:0},1:{acceptedItems:1}}
        }
      }
    },
    ...overrides
  };
}

function fakePhase(phase){
  const rows=trials().map(t=>nativeRow(t.id,
    phase==='B'?{
      actionType:'PlayCardAction',printing:'Battle VIP Pass FST',
      seat:t.candidateSlot==='A'?0:1,turn:1
    }:{
      actionType:'PassTurnAction',
      seat:t.candidateSlot==='A'?0:1,turn:1
    }));
  return {
    phase,vipAfterPassEnabled:phase==='B',
    rawDevelopment:{rows},
    diagnostic:{
      nativeAttempts:rows.map(row=>summarizeNativeAttempt(row)),
      nativeVipRows:rows.map(nativeVipOutcome)
    }
  };
}

test('registration is a four-context two-rank A/B/A cohort at 240 roots',()=>{
  assert.equal(VERSION,'agent36-issue25-common-v9-vip-aba-240root-v1');
  assert.equal(ROOT_LIMIT,240);
  assert.deepEqual(PHASES,['A','B','A2']);
  const rows=trials();
  assert.equal(rows.length,4);
  assert.deepEqual([...new Set(rows.map(x=>x.rank))],[6,11]);
  assert.deepEqual([...new Set(rows.map(x=>x.candidateId))],[
    'champion-reference','new-moon-lockbreaker-v1'
  ]);
  assert.equal(new Set(rows.map(x=>x.id)).size,4);
  assert.equal(rows.find(x=>x.rank===6).candidateSlot,'B');
  assert.equal(rows.find(x=>x.rank===11).candidateSlot,'A');
});

test('VIP environment opt-in is scoped and restored after success and throw',()=>{
  const env={[ 'AGENT9_BATTLE_VIP_AFTER_PASS_DEV']:'previous'};
  assert.equal(withVipFlag(true,()=>env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV,env),'true');
  assert.equal(env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV,'previous');
  assert.throws(()=>withVipFlag(false,()=>{
    assert.equal(Object.hasOwn(env,'AGENT9_BATTLE_VIP_AFTER_PASS_DEV'),false);
    throw new Error('injected failure');
  },env),/injected failure/);
  assert.equal(env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV,'previous');
});

test('native VIP audit is read from the canonical actor component and remains owner-scoped',()=>{
  const row=nativeRow('fixture',{
    actionType:'PlayCardAction',printing:'Battle VIP Pass FST'
  });
  const audit=nativeVipOutcome(row);
  assert.equal(audit.policyRecorded,true);
  assert.equal(audit.originalPassRoots,2);
  assert.equal(audit.acceptedItems,1);
  assert.equal(audit.acceptedSearches,1);
  assert.equal(audit.nativeBenchConfirmed,1);
  assert.deepEqual(audit.bySeat,{0:{acceptedItems:0},1:{acceptedItems:1}});
});

test('root ledger prefers nonempty public/archive evidence over an empty direct array',()=>{
  const archived=[{actionType:'AttackAction'}];
  assert.strictEqual(rootLedger({
    rootActionLedger:[],nativePublicRootArchive:{rootActionLedger:archived}
  }),archived);
  assert.equal(ledgerSha256(archived).length,64);
  assert.equal(rootLedger({rootActionLedger:[]}).length,0);
  assert.equal(rootLedger({}),null);
});

test('first divergence identifies a VIP play replacing a native Pass without publishing a hand',()=>{
  const before={rootActionLedger:[{actionType:'PassTurnAction',seat:1,turn:1}]};
  const after={rootActionLedger:[{
    actionType:'PlayCardAction',printing:'Battle VIP Pass FST',
    seat:1,turn:1,handIndex:3
  }]};
  const diff=firstRootDifference(before,after);
  assert.equal(diff.index,1);
  assert.equal(diff.beforeKind,'PassTurnAction');
  assert.equal(diff.afterKind,'PlayCardAction');
  assert.equal(diff.beforeContainsPass,true);
  assert.equal(diff.afterContainsVip,true);
  assert.equal(Object.hasOwn(diff,'hand'),false);
});

test('A/B/A comparison requires matched physical deals and exact repeated controls',()=>{
  const phases=PHASES.map(fakePhase);
  const rows=compare(phases);
  assert.equal(rows.length,4);
  assert.ok(rows.every(x=>x.physicalOpeningMatchedAcrossABA));
  assert.ok(rows.every(x=>x.controlsRepeatedExactly));
  assert.ok(rows.every(x=>x.treatmentChanged));
  assert.ok(rows.every(x=>x.firstTreatmentDifferenceIsVip));
  assert.ok(rows.every(x=>x.treatmentVipAudit.acceptedItems===1));
  assert.ok(rows.every(x=>x.treatmentVipAudit.nativeBenchConfirmed===1));
  const broken=fakePhase('A2');
  broken.rawDevelopment.rows[0].rootActionLedger[0].actionType='AttackAction';
  assert.equal(compare([phases[0],phases[1],broken])[0].controlsRepeatedExactly,false);
});


test('A/B/A opening match can use authenticated abort-provenance summaries',()=>{
  const phases=PHASES.map(fakePhase);
  for(const phase of phases){
    phase.diagnostic.nativeAttempts=phase.rawDevelopment.rows.map(row=>({
      ...summarizeNativeAttempt(row),
      sourceDealFingerprint:row.sourceDealFingerprint,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint
    }));
    for(const row of phase.rawDevelopment.rows){
      delete row.sourceDealFingerprint;
      delete row.fullPhysicalDealFingerprint;
    }
  }
  assert.ok(compare(phases).every(x=>x.physicalOpeningMatchedAcrossABA));
});

test('native attempt summary distinguishes engine errors, terminals and 240-root caps',()=>{
  const cap=nativeRow('cap',{actionType:'PassTurnAction'},{
    rootActionCount:ROOT_LIMIT,actionCount:ROOT_LIMIT,finished:false
  });
  const terminal=nativeRow('terminal',{actionType:'AttackAction'},{
    rootActionCount:42,actionCount:42,finished:true,winner:1
  });
  const error=nativeRow('error',{actionType:'PassTurnAction'},{
    finished:false
  });
  assert.equal(summarizeNativeAttempt(cap).nativeOutcome,'action-cap');
  assert.equal(summarizeNativeAttempt(terminal).nativeOutcome,'native-terminal');
  assert.equal(summarizeNativeAttempt(error,{status:'engine-error'}).nativeOutcome,'engine-error');
});

test('phase summary and injected runner preserve A/B/A order and all four registered attempts',()=>{
  const calls=[];
  const result=run({
    phaseRunner:phase=>{
      calls.push(phase);
      const row=fakePhase(phase);
      row.diagnostic.nativeAttempts=row.rawDevelopment.rows.map(x=>summarizeNativeAttempt(x));
      return row;
    }
  });
  assert.deepEqual(calls,['A','B','A2']);
  assert.equal(result.summary.attempts,12);
  assert.equal(result.summary.allRegisteredTrialsReturned,true);
  assert.equal(result.summary.allPhysicalOpeningsMatchedAcrossABA,true);
  assert.equal(result.summary.controlsRepeatedExactly,true);
  assert.equal(result.summary.firstTreatmentDifferenceIsVipCount,4);
  assert.equal(result.summary.competitiveGamesQualified,0);
  assert.equal(phaseSummary(fakePhase('B')).acceptedVipItems,4);
});
