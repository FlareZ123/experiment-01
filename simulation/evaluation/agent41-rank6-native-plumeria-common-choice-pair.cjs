'use strict';

const assert=require('node:assert/strict');
const {readRegistration}=require('./agent41-rank6-grouped-denial-source-panel.cjs');

const VERSION='agent41-original-rank6-native-common-plumeria-bridge-retrospective-v1';
const ENGINE='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SOURCE_SHA=
  '29db5b5feaf15b2eec86b19e7d1bbe46738f63ef8e479da9a22ecb46970a1dab';

/** Read a genuine native outcome with all nonterminal and native failure arms. */
function auditNativeArm(row){
  const coverage=row.actorOnlyDecisionCoverage?.detailedComponentAudits??{};
  const root=coverage.root??{};
  const chooser=root.sameRootProposalChoice??{};
  const plumeria=coverage.ownerPlumeriaAfterPass??{};
  const selected=(chooser.changedSamples??[]).filter(x=>
    x.selectedSource==='grouped-plumeria-payments');
  const rootActions=root.nativeRootJoinReceipts??[];
  return {
    status:row.status??(row.finished?'engine-terminal':'censored'),
    finished:row.finished===true,winner:row.finished===true?
      row.winner??null:null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    nativeActorAuditPresent:row.actorOnlyDecisionCoverage!=null,
    totalOwnerRoots:chooser.ownerRoots??null,
    changedSameRootDecisions:chooser.changedRoots??null,
    selectedPlumeriaOwnerRoots:selected.map(root=>({
      seat:root.seat,globalTurn:root.globalTurn,
      rootOrdinal:root.rootOrdinal,selectedKind:root.selectedKind,
      nativeStoreReceipts:rootActions.filter(x=>
        x.policyDecisionOrdinal===root.rootOrdinal&&x.seat===root.seat)
    })),
    nativePlumeriaPromptAdapterPresent:
      Object.hasOwn(coverage,'ownerPlumeriaAfterPass'),
    acceptedPlumeria:plumeria.acceptedPlumeria??null,
    adoptedActorRootActions:plumeria.adoptedActorRootActions??null,
    nativePromptChoices:plumeria.acceptedPrompts??null,
    nativeDelegatedPromptChoices:plumeria.delegatedPromptDispatches??null,
    settledPhysicalEnergyDiscards:plumeria.settledEnergyDiscards??null,
    unresolvedNativeChains:plumeria.unresolvedChains??null,
    boundedSettlementSamples:(plumeria.log??[]).filter(x=>
      x.kind==='plumeria-native-root'||
      x.kind==='plumeria-energy-settlement').slice(0,24),
    qualified:false
  };
}

/** Frozen existing source deal reused as a retrospective integration test. */
function runNativeCommonChoicePair(){
  const p=readRegistration();
  const trials=p.trials.filter(x=>x.rank===6&&x.repeat===10);
  assert.equal(trials.length,2);
  assert.ok(trials.every(x=>x.seed===296638747&&x.candidateSlot==='A'));
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const core={
    actorOnlyComposition:true,
    mandatoryOptionFallback:true,paperSupporterQuota:true,
    nativePressureWindows:true,nativeAcceptedTargets:true,
    sameRootProposalChoice:true,sameRootChoiceApply:true,
    sameRootProbeAll:false,losslessNativeRootJoin:true,
    registeredTrials:trials,
    registeredFrameName:
      'agent41-retrospective-original-rank6-source-seed296638747-same-root-native-plumeria'
  };
  const control=runDevelopment({...core,
    actorPlumeriaAfterPass:false,nativePlumeriaChoice:false});
  const treatment=runDevelopment({...core,
    actorPlumeriaAfterPass:true,nativePlumeriaChoice:true});
  const failures=[];
  if(control.attempted!==2||treatment.attempted!==2)
    failures.push('incomplete-native-attempted-arm-count');
  if(control.competitiveQualifiedGames!==0||
     treatment.competitiveQualifiedGames!==0)
    failures.push('unexpected-qualified-game-claim');
  const paired=trials.map(t=>{
    const ctrl=control.rows.find(x=>x.trial.id===t.id);
    const tx=treatment.rows.find(x=>x.trial.id===t.id);
    if(!ctrl||!tx){
      failures.push('missing-native-pair:'+t.id);
      return {id:t.id,control:ctrl?auditNativeArm(ctrl):null,
        treatment:tx?auditNativeArm(tx):null};
    }
    const a=auditNativeArm(ctrl),b=auditNativeArm(tx);
    if(a.sourceDealFingerprint!==b.sourceDealFingerprint||
       a.fullPhysicalDealFingerprint!==b.fullPhysicalDealFingerprint)
      failures.push('initial-physical-deal-mismatch:'+t.id);
    if(a.sourceDealFingerprint!==SOURCE_SHA)
      failures.push('original-source-seed-mismatch:'+t.id);
    return {id:t.id,rank:t.rank,sourceSeat:1,
      sameInitialSourceAndFullPhysicalDeal:
        a.sourceDealFingerprint===b.sourceDealFingerprint&&
        a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint,
      control:a,treatment:b};
  });
  return {version:VERSION,enginePin:ENGINE,
    registrationGitBlob:
      '6f4a694403069674f33daf81eff18971e214b758',
    originalSourceSeed:296638747,
    distinctIndependentSeedGroups:1,
    actualNativeAttempts:control.attempted+treatment.attempted,
    candidateArms:2,matchedNativePairs:paired.length,
    validation:{passed:failures.length===0,failures},
    paired,competitiveQualifiedGames:0,
    caveat:'Retrospective reused original source physical deal. Choice, native acceptance, mandatory prompt settlement, and later opponent response are separate evidence stages. These four attempts are development-only and share one original source seed.'};
}

if(require.main===module){
  const result=runNativeCommonChoicePair();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.validation.passed)process.exitCode=1;
}

module.exports={VERSION,ENGINE,SOURCE_SHA,auditNativeArm,
  runNativeCommonChoicePair};
