'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const profile=require('../evaluation/agent41-frozen-bilateral-development-v2.json');
const registration=require('../../results/aichi-2026/registrations/agent16-balanced-native-rank6-rank11-coins-20261101.json');
const {runDevelopment}=require('../evaluation/agent41-bilateral-v2-development.cjs');
const {
  withUniformNightWatchOpponentSelection
}=require('./agent12-nightwatch-paper-random-chooser.cjs');
const {digestNativePromptChoices}=
  require('../evaluation/agent12-native-prompt-choice-digest.cjs');
const {reconcileNightWatchNonceRoots}=
  require('../evaluation/agent12-nightwatch-native-nonce-reconcile.cjs');

const VERSION='agent12-native-rank11-nightwatch-printed-root-store-development-v4';
const selectionRegistration=require(
  '../../results/aichi-2026/registrations/agent12-nightwatch-independent-rng-20261101.json');
const GROUPS=[
  {rank:11,repeat:2,candidateSlot:'A'},
  {rank:11,repeat:0,candidateSlot:'B'}
];

/** @param {object} g Frozen historical physical source group identity. */
function registeredGroup(g){
  const row=registration.flatPredictions.find(x=>
    x.rank===g.rank&&x.repeat===g.repeat&&
    x.candidateSlot===g.candidateSlot);
  assert.ok(row,'Exact prior balanced-coin seed registration missing');
  return registration.candidateIds.map(candidateId=>({
    rank:row.rank,repeat:row.repeat,candidateSlot:row.candidateSlot,
    seed:row.seed,candidateId,
    id:[row.rank,row.repeat,row.candidateSlot,candidateId].join(':')
  }));
}

/** @param {object} row True native Game row after end/cap, no synthetic scores. */
function extract(row){
  const byOrdinal=new Map(row.rootActionLedger.map(e=>
    [e.actionOrdinal,e]));
  const choices=new Map((row.nativePromptChoices?.events??[])
    .map(e=>[e.ordinal,e]));
  const nights=row.rootActionLedger.filter(r=>
    r.action==='ResolvePromptAction'&&
    r.pendingPrompt==='ChooseCardsPrompt'&&
    byOrdinal.get(r.initiatingRootActionOrdinal)?.attack==='Night Watch')
    .map(e=>{
      const c=choices.get(e.actionOrdinal);
      return {ordinal:e.actionOrdinal,turn:e.turnBefore,
        actorSeat:e.playerSlot,ownerSeat:c?.sourcePlayerSlot??null,
        opponentHandSizeBefore:c?.sourceZoneCardCountBefore??null,
        selectedNames:c?.selectedCards??null,
        selectedCount:c?.selectedCards?.length??null,
        nativePromptMin:c?.nativePromptMin??null,
        nativePromptMax:c?.nativePromptMax??null};
    });
  return {
    trial:row.trial,status:row.status??null,
    finished:row.finished,winner:row.winner,
    actionCount:row.actionCount,turns:row.turns,
    sourceDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    rootActionLedgerSha256:row.rootActionLedgerSha256,
    nativePromptPhysicalChoiceDigest:
      digestNativePromptChoices(row.nativePromptChoices),
    nativeNightWatchPromptCount:nights.length,
    nightWatchPromptReceipts:nights,
    qualifiesForCompetitiveInference:false
  };
}

function run(){
  assert.equal(profile.pinnedVendorRevision,registration.enginePin);
  const prior={};
  for(const [k,v] of Object.entries(profile.injectedResearchEnvironment)){
    prior[k]=process.env[k];process.env[k]=v;
  }
  try{
    const out=[];
    for(const group of GROUPS){
      const groupRows=registeredGroup(group);
      const runNative=()=>runDevelopment({
        ...profile.policyOptions,registeredTrials:groupRows,
        registeredFrameName:VERSION+'-archived-exact-physical-seed'
      });
      const baseline=runNative();
      const committed=selectionRegistration.arms.find(x=>
        x.rank===group.rank&&x.repeat===group.repeat&&
        x.candidateSlot===group.candidateSlot);
      assert.ok(committed,'Independent RNG seed registration missing');
      assert.equal(committed.originalDealSeed,groupRows[0].seed,
        'Native physical deal seed must match the precommitted registration');
      assert.match(committed.independentSelectionSeedHex,/^[0-9a-f]{64}$/);
      const audit=withUniformNightWatchOpponentSelection(runNative,{
        committedSeed:committed.independentSelectionSeedHex,
        requirePrintedOrigin:true,
        requireNativeRootState:true,
        capturePostGamePhysicalNames:true
      });
      assert.equal(baseline.rows.length,2);
      assert.equal(audit.result.rows.length,2);
      const base=baseline.rows.map(extract),
        treated=audit.result.rows.map(extract);
      for(let i=0;i<base.length;i++){
        assert.equal(base[i].trial.id,treated[i].trial.id);
        assert.equal(base[i].sourceDealFingerprint,
          treated[i].sourceDealFingerprint,
          'Source card deal changed under randomized opponent hand prompt');
        assert.equal(base[i].fullPhysicalDealFingerprint,
          treated[i].fullPhysicalDealFingerprint,
          'Full physical deal changed under RNG-only native prompt handling');
      }
      const namedNativeNightWatch=treated.reduce((n,r)=>
        n+r.nativeNightWatchPromptCount,0);
      assert.equal(audit.audit.nativeRootSetupDispatchesObserved,4,
        'Two original games per historical pair require exactly four native setup AddPlayer roots');
      assert.equal(audit.audit.skippedDetachedStorePrintedPrompts,0,
        'Unexpected printed Night Watch prompt on a detached speculative Store');
      assert.equal(audit.audit.printedNightWatchPromptMarks,namedNativeNightWatch,
        'Actual printed source reducer emitted a different count than genuine named Night Watch roots');
      assert.equal(audit.audit.skippedUnmarkedStructuralPrompts,0,
        'Source-origin gate skipped a structurally similar but unrelated native prompt');
      assert.equal(audit.audit.structuralCandidates,namedNativeNightWatch,
        'Narrow structural random sampler affected a non-Night Watch prompt');
      for(let i=0;i<base.length;i++){
        assert.equal(base[i].nativeNightWatchPromptCount,
          treated[i].nativeNightWatchPromptCount,
          'Native Night Watch prompt count changed under selection');
        if(base[i].trial.candidateId==='champion-reference'){
          assert.equal(base[i].rootActionLedgerSha256,
            treated[i].rootActionLedgerSha256,
            'Untargeted champion reference changed under random sampler');
          assert.equal(
            base[i].nativePromptPhysicalChoiceDigest.digestSha256,
            treated[i].nativePromptPhysicalChoiceDigest.digestSha256,
            'Untargeted champion prompt physical choices changed');
        }
        if(base[i].nativeNightWatchPromptCount>0)
          assert.notEqual(
            base[i].nativePromptPhysicalChoiceDigest.digestSha256,
            treated[i].nativePromptPhysicalChoiceDigest.digestSha256,
            'Uniform actual Night Watch physical choices must be recorded independently of root SHA');
      }
      const matchedNonceRoots=reconcileNightWatchNonceRoots({
        uniform:treated,randomHookAudit:audit.audit
      });
      assert.equal(matchedNonceRoots.matchedSourceRoots,namedNativeNightWatch);
      out.push({registration:group,seed:groupRows[0].seed,
        independentSelectionSeedHex:committed.independentSelectionSeedHex,
        independentlyPrecommittedPositionSeed:true,
        attemptedBaseline:base.length,attemptedUniform:treated.length,
        baseline:base,uniform:treated,
        randomHookAudit:audit.audit,
        nativeRootNonceReconciliation:matchedNonceRoots,
        exactNightWatchPromptCountMatchesIntercepts:true,
        championReferenceRootNoninterference:true,
        competitiveQualified:false});
    }
    return {version:VERSION,
      pinnedVendorRevision:profile.pinnedVendorRevision,
      profileSchema:profile.schema,
      profileOptions:profile.policyOptions,
      groups:out,
      externalRandomnessRegistration:selectionRegistration.schema,
      registeredGroups:GROUPS.length,
      gameArmsAttempted:GROUPS.length*2*2,
      independentPhysicalDeals:GROUPS.length,
      fullOriginalSourceSixtiesRetained:true,
      nativeValidCopyAttackSourcePaperVerification:false,
      printedNightWatchPromptAttributionRequired:true,
      competitiveQualifiedGameCount:0,
      winRateCertification:false};
  }finally{
    for(const [k,v] of Object.entries(prior)){
      if(v===undefined)delete process.env[k];
      else process.env[k]=v;
    }
  }
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,GROUPS,registeredGroup,extract,run};
