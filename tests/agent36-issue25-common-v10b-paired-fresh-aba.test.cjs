'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,ROOT_LIMIT,PHASES,trials,withVipFlag,nativeVipOutcome,
  rootLedger,ledgerSha256,firstRootDifference,summarizeNativeAttempt,
  compare,phaseSummary,run
}=require('../simulation/evaluation/agent36-issue25-common-v10b-paired-fresh-aba.cjs');

function nativeRow(trial,action,overrides={}){
  const sourceSeat=trial.candidateSlot==='B'?0:1;
  const candidateSeat=1-sourceSeat;
  return {
    id:trial.id,trial,sourceSeat,candidateSeat,
    actualStarterSeat:trial.seed%2,
    sourceDealFingerprint:'source-opening-'+trial.rank+'-'+trial.repeat+'-'+trial.candidateSlot,
    fullPhysicalDealFingerprint:'full-opening-'+trial.id,
    rootActionLedger:[action],
    rootActionCount:1,actionCount:1,finished:false,winner:null,
    actorOnlyDecisionCoverage:{
      detailedComponentAudits:{
        ownerVipAfterPass:{
          originalPassRoots:2,eligiblePassRoots:1,
          acceptedItems:action.card==='Battle VIP Pass FST'?1:0,
          rejectedItems:0,
          acceptedSearches:action.card==='Battle VIP Pass FST'?1:0,
          rejectedSearches:0,
          nativeBenchConfirmed:action.card==='Battle VIP Pass FST'?1:0,
          nativeBenchUnconfirmed:0,
          selectedBasics:action.card==='Battle VIP Pass FST'?1:0,
          unresolvedOwnerSearches:0,
          bySeat:{[candidateSeat]:{
            acceptedItems:action.card==='Battle VIP Pass FST'?1:0
          }},
          examples:action.card==='Battle VIP Pass FST'?[{
            kind:'vip-item',seat:candidateSeat,turn:1,
            printing:'Battle VIP Pass FST',accepted:true
          },{
            kind:'vip-search',seat:candidateSeat,turn:1,
            printings:['Duskull VIV'],accepted:true,nativeBenchConfirmed:true
          }]:[]
        }
      }
    },
    ...overrides
  };
}

function fakePhase(phase){
  const rows=trials().map(trial=>{
    const candidateSeat=trial.candidateSlot==='A'?0:1;
    const action=phase==='B'?{
      action:'PlayCardAction',card:'Battle VIP Pass FST',
      playerSlot:candidateSeat,turnBefore:1,actionOrdinal:0
    }:{
      action:'PassTurnAction',
      playerSlot:candidateSeat,turnBefore:1,actionOrdinal:0
    };
    return nativeRow(trial,action);
  });
  return {
    phase,vipAfterPassEnabled:phase==='B',
    rawDevelopment:{rows},
    diagnostic:{
      nativeAttempts:rows.map(row=>summarizeNativeAttempt(row)),
      nativeVipRows:rows.map(nativeVipOutcome)
    }
  };
}

test('registration pairs both candidate IDs across four ranks with a balanced physical source-seat cohort',()=>{
  assert.equal(VERSION,'agent36-issue25-common-v10b-paired-fresh-aba-260root-v1');
  assert.equal(ROOT_LIMIT,260);
  assert.deepEqual(PHASES,['A','B','A2']);
  const rows=trials();
  assert.equal(rows.length,8);
  assert.deepEqual([...new Set(rows.map(x=>x.rank))],[1,3,6,11]);
  assert.deepEqual([...new Set(rows.map(x=>x.candidateId))].sort(),[
    'champion-reference','new-moon-lockbreaker-v1'
  ]);
  assert.equal(new Set(rows.map(x=>x.id)).size,8);
  assert.equal(new Set(rows.map(x=>x.seed)).size,4);
  for(const rank of [1,3,6,11]){
    const pair=rows.filter(x=>x.rank===rank);
    assert.equal(pair.length,2);
    assert.deepEqual(pair.map(x=>x.candidateId).sort(),[
      'champion-reference','new-moon-lockbreaker-v1'
    ]);
    assert.equal(new Set(pair.map(x=>x.seed)).size,1);
  }
  assert.deepEqual([...new Set(rows.map(x=>x.candidateSlot))].sort(),['A','B']);
});

test('VIP environment opt-in is scoped and restored after success and throw',()=>{
  const env={AGENT9_BATTLE_VIP_AFTER_PASS_DEV:'previous'};
  assert.equal(withVipFlag(true,()=>env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV,env),'true');
  assert.equal(env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV,'previous');
  assert.throws(()=>withVipFlag(false,()=>{
    assert.equal(Object.hasOwn(env,'AGENT9_BATTLE_VIP_AFTER_PASS_DEV'),false);
    throw new Error('injected failure');
  },env),/injected failure/);
  assert.equal(env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV,'previous');
});

test('native VIP audit is read from the canonical actor component and remains owner-scoped',()=>{
  const trial=trials()[0];
  const seat=trial.candidateSlot==='A'?0:1;
  const row=nativeRow(trial,{
    action:'PlayCardAction',card:'Battle VIP Pass FST',
    playerSlot:seat,turnBefore:1,actionOrdinal:0
  });
  const audit=nativeVipOutcome(row);
  assert.equal(audit.policyRecorded,true);
  assert.equal(audit.originalPassRoots,2);
  assert.equal(audit.acceptedItems,1);
  assert.equal(audit.acceptedSearches,1);
  assert.equal(audit.nativeBenchConfirmed,1);
  assert.equal(audit.bySeat[seat].acceptedItems,1);
  assert.equal(audit.examples[0].kind,'vip-item');
  assert.equal(audit.examples[0].accepted,true);
  assert.equal(audit.examples[1].nativeBenchConfirmed,true);
});

test('root ledger prefers nonempty public/archive evidence over an empty direct array',()=>{
  const archived=[{action:'AttackAction'}];
  assert.strictEqual(rootLedger({
    rootActionLedger:[],nativePublicRootArchive:{rootActionLedger:archived}
  }),archived);
  assert.equal(ledgerSha256(archived).length,64);
  assert.equal(rootLedger({rootActionLedger:[]}).length,0);
  assert.equal(rootLedger({}),null);
});

test('first divergence identifies a VIP play replacing a native Pass without publishing a hand',()=>{
  const before={rootActionLedger:[{action:'PassTurnAction',
    playerSlot:1,turnBefore:1,actionOrdinal:0}]};
  const after={rootActionLedger:[{
    action:'PlayCardAction',card:'Battle VIP Pass FST',
    playerSlot:1,turnBefore:1,actionOrdinal:0,handIndex:3
  }]};
  const diff=firstRootDifference(before,after);
  assert.equal(diff.index,1);
  assert.equal(diff.beforeKind,'PassTurnAction');
  assert.equal(diff.afterKind,'PlayCardAction');
  assert.equal(diff.beforeContainsPass,true);
  assert.equal(diff.afterContainsVip,true);
  assert.equal(Object.hasOwn(diff,'hand'),false);
});

test('A/B/A comparison requires matched physical deals and exact repeated controls across all eight paired arms',()=>{
  const phases=PHASES.map(fakePhase);
  const rows=compare(phases);
  assert.equal(rows.length,8);
  assert.ok(rows.every(x=>x.physicalOpeningMatchedAcrossABA));
  assert.ok(rows.every(x=>x.controlsRepeatedExactly));
  assert.ok(rows.every(x=>x.treatmentChanged));
  assert.ok(rows.every(x=>x.firstTreatmentDifferenceIsVip));
  assert.ok(rows.every(x=>x.treatmentVipAudit.acceptedItems===1));
  assert.ok(rows.every(x=>x.treatmentVipAudit.nativeBenchConfirmed===1));
  const broken=fakePhase('A2');
  broken.rawDevelopment.rows[0].rootActionLedger[0].action='AttackAction';
  assert.equal(compare([phases[0],phases[1],broken])[0].controlsRepeatedExactly,false);
});

test('native reciprocal screen preserves first-player and source-attack sequence evidence',()=>{
  const trial=trials().find(x=>x.candidateSlot==='B');
  const row=nativeRow(trial,{action:'AttackAction',playerSlot:0,
    turnBefore:4,actionOrdinal:0});
  const before={active:{printing:'Dialga-GX UPR',damage:20,
    energyCards:['Psychic Energy']},bench:[]};
  const after={active:{printing:'Dialga-GX UPR',damage:20,
    energyCards:['Psychic Energy','Psychic Energy']},bench:[]};
  row.rootActionLedger=[
    {actionOrdinal:0,turnBefore:4,playerSlot:0,action:'AttackAction',attack:'Motivate'},
    {actionOrdinal:1,turnBefore:5,playerSlot:1,action:'PlayCardAction',card:'Psychic Energy'},
    {actionOrdinal:2,turnBefore:6,playerSlot:0,action:'AttackAction',attack:'Motivate'}
  ];
  const first={actionOrdinal:0,settledPromptChain:true,completionRootOrdinal:0,
    prizesBefore:[6,6],prizesAfter:[6,6],
    publicBoardBefore:[{active:{printing:'Source',damage:0}},
      {active:{printing:'Dialga-GX UPR',damage:0}}],
    publicBoardAfter:[{active:{printing:'Source',damage:0}},before]};
  const second={actionOrdinal:2,settledPromptChain:true,completionRootOrdinal:2,
    prizesBefore:[6,6],prizesAfter:[6,6],
    publicBoardBefore:[{active:{printing:'Source',damage:0}},after],
    publicBoardAfter:[{active:{printing:'Source',damage:0}},
      {active:{printing:'Dialga-GX UPR',damage:40}}]};
  row.sourceAttackSettlement={attacks:[first,second]};
  const summary=summarizeNativeAttempt(row);
  assert.equal(summary.sourceSeat,0);
  assert.equal(summary.actualFirstPlayerSeat,trial.seed%2);
  assert.ok(summary.generalSequence);
  assert.ok(summary.sourceAttackSequence);
  assert.equal(summary.settledSourceAttackBeforeObservedReply,true);
  assert.ok(summary.nativeMaterialExchange);
  assert.equal(summary.nativeMaterialExchange.paperQualified,false);
});

test('native attempt summary distinguishes engine errors, terminals and 260-root caps',()=>{
  const trial=trials()[0];
  const cap=nativeRow(trial,{action:'PassTurnAction'},{
    rootActionCount:ROOT_LIMIT,actionCount:ROOT_LIMIT,finished:false
  });
  const terminal=nativeRow(trial,{action:'AttackAction'},{
    rootActionCount:42,actionCount:42,finished:true,winner:1
  });
  const error=nativeRow(trial,{action:'PassTurnAction'},{finished:false});
  assert.equal(summarizeNativeAttempt(cap).nativeOutcome,'action-cap');
  assert.equal(summarizeNativeAttempt(terminal).nativeOutcome,'native-terminal');
  assert.equal(summarizeNativeAttempt(error,{status:'engine-error'}).nativeOutcome,'engine-error');
});

test('phase summary and injected runner preserve A/B/A order, both seats and all 24 attempts',()=>{
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
  assert.equal(result.summary.attempts,24);
  assert.equal(result.summary.allRegisteredTrialsReturned,true);
  assert.equal(result.summary.allPhysicalOpeningsMatchedAcrossABA,true);
  assert.equal(result.summary.controlsRepeatedExactly,true);
  assert.equal(result.summary.firstTreatmentDifferenceIsVipCount,8);
  assert.equal(result.summary.competitiveGamesQualified,0);
  assert.deepEqual(result.cohortCoverage.sourceRanksObserved,[1,3,6,11]);
  assert.equal(result.cohortCoverage.bothPhysicalSourceSeatsObserved,true);
  assert.equal(result.cohortCoverage.sourceSeatsBalancedAcrossCohort,true);
  assert.equal(result.cohortCoverage.allSourceRanksRepresented,true);
  assert.equal(result.cohortCoverage.bothFirstPlayerSeatsObserved,true);
  assert.equal(result.cohortCoverage.uniqueSourceDealFingerprints,4);
  assert.equal(result.cohortCoverage.uniqueFullPhysicalDealFingerprints,8);
  assert.equal(result.cohortCoverage.allSourceDealsUnique,true);
  assert.equal(result.cohortCoverage.allPhysicalDealsUnique,true);
  assert.equal(phaseSummary(fakePhase('B')).acceptedVipItems,8);
});

test('runner refuses a phase that returns no registered native rows',()=>{
  assert.throws(()=>run({
    phaseRunner:phase=>{
      const result=fakePhase(phase);
      result.rawDevelopment.rows=[];
      return result;
    }
  }),/did not return all registered native rows/);
});
