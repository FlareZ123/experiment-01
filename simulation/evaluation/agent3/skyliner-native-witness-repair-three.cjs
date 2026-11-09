'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const reg=require('../../../results/aichi-2026/registrations/2026-11/agent3-skyliner-public-free-native-20261109.json');
const candidate=require('../../../results/aichi-2026/candidate-hood-consistency-v2.json');
const frozen=require('../agent41-frozen-bilateral-development-v2.json');
const {SOURCE_POLICY}=require('./hood-consistency-v2-targeted-native.cjs');
const {nativeReceipt}=require('./skyliner-public-free-native-prospective.cjs');
const {saveAtomic}=require('./hood-v2-flexible-paid-retreat-native.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1,PINNED_TWINLEAF}=
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const VERSION='agent3-skyliner-witness-native-three-posthoc-repair-v1';
const OUTPUT=process.env.AGENT3_SKYLINER_REPAIR_OUTPUT??
  path.join(ROOT,'artifacts/agent3-skyliner-witness-repair-three.json');
const TARGETS=Object.freeze([
  {
    id:'7:9601:A:skyliner-public',
    full:'cf94eb3fb9c9df8e4344fae8ccfcc302c60fca60d0fd08732378e064031ff576',
    source:'3b6a00feba38646d3aaea742175818226f2b9c25a63e5cc08d047ac2ec9829c8',
    first:1
  },
  {
    id:'7:9602:B:skyliner-public',
    full:'cb140ea706332be85108b46e048ad8c5834eb9c9e0e2836f51de7a0514bfbca4',
    source:'fa65762301a3ca87ea2a85a67bc8e1a1f7849c5d7f9fec103195b7a58de3f154',
    first:1
  },
  {
    id:'11:9601:B:skyliner-public',
    full:'a6b684de02b9234a8e265e468ad5b50f936391b0245620ef55ce91b392ddf370',
    source:'02297118245c7ebb03176fbc0860698ea1521706efe246e3b37899e17024457e',
    first:1
  }
]);

/** Posthoc replay of three actual pre-repair Store aborts, no inference. */
function run({runner=runDevelopment,profile=withPaperSemanticsProfileV1}={}){
  assert.equal(candidate.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(frozen.pinnedVendorRevision,PINNED_TWINLEAF);
  const trials=TARGETS.map(w=>{
    const t=reg.registeredTrials.find(t=>t.id===w.id);
    assert.ok(t,'Missing preregistered historical witness '+w.id);
    return t;
  });
  const old=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let wrapped;
  try {
    wrapped=profile(()=>runner({...frozen.policyOptions,...SOURCE_POLICY,
      actorSkylinerFundedBenchRetreatRoot:true,
      registeredCandidateDecks:{
        'skyliner-public':{
          label:'skyliner-public',cards:candidate.cards
        }
      },
      registeredTrials:trials,
      registeredFrameName:
        'agent3-skyliner-public-native-prospective-v1:skyliner-public',
      allowSingleCandidatePerGroup:true,
      allowAdditionalOriginalSourceRanks:true,
      nativeRootActionLimit:260,
      isolatePolicyRandomness:true,
      isolatePhysicalShuffleRandomnessAfterSetup:true
    }),{celestialRoar:true,mewEnergyMix:true,attachEnergyTarget:true});
  }finally{
    if(old===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=old;
  }
  const rows=wrapped.result.rows;
  assert.equal(wrapped.result.attempted,3);
  assert.equal(rows.length,3);
  const receipts=TARGETS.map(w=>{
    const game=rows.find(g=>g.trial.id===w.id);
    assert.ok(game,'Missing historical source deal '+w.id);
    const r=nativeReceipt(game);
    return {id:w.id,sameOriginalEntirePhysicalDeal:
      r.fullPhysicalDealFingerprint===w.full,
      sameOriginalSourceDeal:r.sourceDealFingerprint===w.source,
      sameOriginalStarter:r.actualStarterSeat===w.first,
      status:r.status,nativeTerminal:r.terminal,
      candidateRetreatRoots:r.candidatePaidRetreats,
      sourceRetreatRoots:r.sourceRetreatRoots,
      candidateMaxGeistDeclarations:r.candidateMaxGeist,
      candidateNightWatchDeclarations:r.candidateNightWatch,
      actorSkylinerSelected:r.skylinerRootSelected,
      candidateNativeWin:r.candidateNativeWin,
      error:r.error,
      rootActionLedger:r.roots};
  });
  const summary={
    fixedPrintedSixtyUnchanged:true,posthocDiagnosticNotProspective:true,
    attempted:3,
    nativeEngineAborts:receipts.filter(r=>r.status==='NATIVE_ABORT').length,
    root260Caps:receipts.filter(r=>r.status==='ACTION_CAP').length,
    nativeTerminals:receipts.filter(r=>r.nativeTerminal).length,
    genuineRetreatRoots:receipts.reduce((n,r)=>
      n+r.candidateRetreatRoots+r.sourceRetreatRoots,0),
    matchedOriginalFullPhysicalDeal:receipts.filter(r=>
      r.sameOriginalEntirePhysicalDeal&&r.sameOriginalSourceDeal&&
      r.sameOriginalStarter).length,
    independentPaperQualifiedGames:0
  };
  return {schema:VERSION,summary,receipts,
    nativeRows:rows,paperProfileAudit:wrapped.audit,
    historicAbortedRun:42642746284,
    nativeEngineRevision:PINNED_TWINLEAF,
    codeRevision:process.env.GITHUB_SHA??null};
}

if(require.main===module){
  const result=run();
  saveAtomic(OUTPUT,result);
  process.stdout.write('AGENT3_SKYLINER_WITNESS_REPAIR '+
    JSON.stringify({summary:result.summary,artifact:OUTPUT})+'\\n');
  if(result.summary.nativeEngineAborts>0||
     result.summary.matchedOriginalFullPhysicalDeal!==3)process.exitCode=1;
}
module.exports={VERSION,TARGETS,run};
