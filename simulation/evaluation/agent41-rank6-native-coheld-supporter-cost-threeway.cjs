'use strict';

const assert=require('node:assert/strict');
const {readRegistration}=require('./agent41-rank6-grouped-denial-source-panel.cjs');
const {ENGINE,SOURCE_SHA,auditNativeArm,firstPublicRootDeviation}=
  require('./agent41-rank6-native-plumeria-common-choice-pair.cjs');

const VERSION='agent41-original-rank6-coheld-native-cost-free-vs-paid-threeway-v1';

/**
 * Three genuinely executed two-seat policies over precisely the same
 * registered physical source and candidate decks:
 *   control: do not add costed Energy denial over terminal Pass;
 *   paid: use Plumeria if opponent Active has >=2 publicly attached Energy;
 *   cost-aware: when physically coheld, prefer native free Team Flare first.
 * This is a retrospective development comparison, not independent trial
 * registration or a competitive game win-rate estimate.
 */
function runNativeCoheldCostThreeway(){
  const trials=readRegistration().trials.filter(x=>
    x.rank===6&&x.repeat===10);
  assert.equal(trials.length,2);
  assert.ok(trials.every(x=>x.seed===296638747&&x.candidateSlot==='A'));
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const common={
    actorOnlyComposition:true,mandatoryOptionFallback:true,
    paperSupporterQuota:true,nativePressureWindows:true,
    nativeAcceptedTargets:true,
    sameRootProposalChoice:true,sameRootChoiceApply:true,
    sameRootProbeAll:false,losslessNativeRootJoin:true,
    registeredTrials:trials,
    registeredFrameName:'agent41-original-rank6-threeway-same-seed296638747'
  };
  const controls=runDevelopment({...common,
    actorPlumeriaAfterPass:false,nativePlumeriaChoice:false});
  const paid=runDevelopment({...common,
    actorPlumeriaAfterPass:true,nativePlumeriaChoice:true});
  const freeFirst=runDevelopment({...common,
    actorPlumeriaAfterPass:true,nativePlumeriaChoice:true,
    teamFlareGruntDenialRoot:true,nativeZeroCostDenialChoice:true});
  const failures=[];
  for(const [key,run] of [['control',controls],
    ['Plumeria',paid],['freeTeamFlare',freeFirst]]){
    if(run.attempted!==2)failures.push('missing-attempted-'+key);
    if(run.competitiveQualifiedGames!==0)
      failures.push('unsupported-win-qualification-'+key);
  }
  const pairRows=trials.map(trial=>{
    const c=controls.rows.find(x=>x.trial.id===trial.id);
    const p=paid.rows.find(x=>x.trial.id===trial.id);
    const f=freeFirst.rows.find(x=>x.trial.id===trial.id);
    if(!c||!p||!f){
      failures.push('missing-registered-arm:'+trial.id);
      return {id:trial.id,missing:true};
    }
    const control=auditNativeArm(c);
    const plumeria=auditNativeArm(p);
    const costAware=auditNativeArm(f);
    const sameFullDeal=[control,plumeria,costAware].every(x=>
      x.fullPhysicalDealFingerprint===control.fullPhysicalDealFingerprint&&
      x.sourceDealFingerprint===SOURCE_SHA);
    if(!sameFullDeal)failures.push('mismatched-full-native-deal:'+trial.id);
    const controlToPlumeria=firstPublicRootDeviation(
      c.rootActionLedger,p.rootActionLedger,1);
    const controlToFreeFlare=firstPublicRootDeviation(
      c.rootActionLedger,f.rootActionLedger,1);
    const paidToFreeFlare=firstPublicRootDeviation(
      p.rootActionLedger,f.rootActionLedger,1);
    if(!controlToPlumeria||!controlToFreeFlare||!paidToFreeFlare)
      failures.push('unverified-native-public-action-ledger:'+trial.id);
    if(costAware.acceptedFlare!==null&&costAware.acceptedFlare>
       (costAware.physicallySettledFlareEnergy??0))
      failures.push('unsettled-native-TeamFlare-energy:'+trial.id);
    if(costAware.unresolvedFlareChains>0)
      failures.push('unresolved-native-TeamFlare-prompt:'+trial.id);
    const coheldOpportunity={
      firstFreeChoice:costAware.selectedFlareOwnerRoots?.[0]??null,
      firstPaidChoice:plumeria.selectedPlumeriaOwnerRoots?.[0]??null,
      paidOwnerHandDiscards:plumeria.physicalOwnerPayments,
      freeOwnerHandDiscards:costAware.physicalOwnerPayments,
      exactFreeEnergyRemovals:costAware.nativeFlareReceipts.filter(x=>
        x.kind==='native-flare-physical-energy-settlement')
    };
    return {id:trial.id,rank:trial.rank,physicalSourceSeat:1,
      sameFullNativeDeal:sameFullDeal,
      controlToPlumeria,controlToFreeFlare,paidToFreeFlare,
      coheldOpportunity,control,plumeria,costAware};
  });
  return {
    version:VERSION,pinnedTwinleafCommit:ENGINE,
    sourceDealFingerprint:SOURCE_SHA,originalSeed:296638747,
    distinctIndependentSourceSeedGroups:1,
    attemptedOriginalStoreArms:controls.attempted+paid.attempted+
      freeFirst.attempted,
    registeredOpponentComparators:trials.length,
    validation:{passed:failures.length===0,failures},
    pairRows,
    competitivelyQualifiedGames:0,
    caveat:'Retrospective one-seed source policy development. Six native attempts share two identical source-deal and candidate physical combinations; action caps, paid-card opportunity costs, later responses and all engine errors remain visible. No result is a competitive win.'
  };
}

if(require.main===module){
  const r=runNativeCoheldCostThreeway();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  if(!r.validation.passed)process.exitCode=1;
}

module.exports={VERSION,runNativeCoheldCostThreeway};
