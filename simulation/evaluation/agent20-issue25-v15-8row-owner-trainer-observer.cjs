'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {runIssue25PrizeCustodyV14}=
  require('./agent20-issue25-prize-custody-v14.cjs');

const VERSION='agent20-issue25-v15-original-eight-owner-trainer-observer-a-a';
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const ID='11:102:A:champion-reference';

/**
 * Observe exactly the original physical owner roots, ignoring owner-private
 * held Trainer identities in exported transcript. Source seat and genuine
 * native Store decisions are taken from each original-run receipt.
 *
 * @param {object} control Native v14 previous-policy return.
 * @param {object} observed Native v14 plus read-only frontier return.
 * @param {Array<object>} rawControl Unmodified per-original-ID native rows.
 * @param {Array<object>} rawObserved Observed per-original-ID native rows.
 * @returns {object}
 */
function compareOwnerTrainerReadOnly(control,observed,rawControl,rawObserved){
  assert.equal(control?.schema,
    'agent20-issue25-v14-verified-native-owner-prize-zone-counts');
  assert.equal(observed?.schema,control.schema);
  assert.equal(rawControl?.length,8);
  assert.equal(rawObserved?.length,8);
  const byId=raw=>new Map(raw.map(row=>{
    const id=row?.trial?.id??row?.id??null;
    assert.equal(typeof id,'string');
    return [id,row];
  }));
  const original=byId(rawControl), instrumented=byId(rawObserved);
  assert.equal(original.size,8);
  assert.equal(instrumented.size,8);
  const rows=control.allEightAttemptDispositions.map(base=>{
    const id=base.id;
    const comparison=observed.allEightAttemptDispositions.find(x=>x.id===id);
    const nativeBefore=original.get(id),nativeAfter=instrumented.get(id);
    assert.ok(comparison&&nativeBefore&&nativeAfter);
    const rootsBefore=nativeBefore.rootActionLedger??null;
    const rootsAfter=nativeAfter.rootActionLedger??null;
    const exactRoots=Array.isArray(rootsBefore)&&Array.isArray(rootsAfter)&&
      digest(rootsBefore)===digest(rootsAfter);
    const sourceSeat=base.originalSourceSeat??base.nativeAbortProvenance?.sourceSeat??null;
    assert.ok(sourceSeat===0||sourceSeat===1);
    const observedAudit=nativeAfter.actorOnlyDecisionCoverage;
    const frontier=observedAudit?.ownerTrainerFrontierAudit?.summary??null;
    const sourceCounts=frontier?.bySeat?.[sourceSeat]??null;
    const otherCounts=frontier?.bySeat?.[1-sourceSeat]??null;
    return {
      id,
      sourceSeat,
      sourceRank:Number(id.split(':')[0]),
      exactFullPhysicalDealMatched:
        base.fullPhysicalDealFingerprint===comparison.fullPhysicalDealFingerprint,
      exactOriginalSourceDealMatched:
        base.sourceDealFingerprint===comparison.sourceDealFingerprint,
      exactNativeRootLedgerMatched:exactRoots,
      baselineRootCount:rootsBefore?.length??null,
      observedRootCount:rootsAfter?.length??null,
      baselineStatus:base.status,
      observedStatus:comparison.status,
      exactStatusMatched:base.status===comparison.status,
      baselinePublicRootSha256:Array.isArray(rootsBefore)?digest(rootsBefore):null,
      observedPublicRootSha256:Array.isArray(rootsAfter)?digest(rootsAfter):null,
      sourceTrainerAuditPresent:sourceCounts!==null,
      readOnlyClaimFromObserver:frontier?.readOnly===true,
      originalSourceOwnerTrainerCounts:sourceCounts,
      candidateOwnerTrainerCounts:otherCounts,
      rawPrivateTrainerIdentitiesReleased:false,
      ownerPaperTrainerPlayabilityCertified:false
    };
  });
  const aggregateField=key=>rows.reduce((sum,r)=>
    sum+(r.originalSourceOwnerTrainerCounts?.[key]??0),0);
  return {
    schema:VERSION+'-comparison-v1',
    originalTrialIDs:rows.map(r=>r.id),
    exactFullPhysicalDealBothArms:rows.every(r=>r.exactFullPhysicalDealMatched),
    exactSourceDealBothArms:rows.every(r=>r.exactOriginalSourceDealMatched),
    exactAllEightRootLedgers:rows.every(r=>r.exactNativeRootLedgerMatched),
    exactAllEightStatus:rows.every(r=>r.exactStatusMatched),
    ownerTrainerAuditsCount:rows.filter(r=>r.sourceTrainerAuditPresent).length,
    ownerTrainerObserverClaimsReadOnly:rows.every(r=>r.readOnlyClaimFromObserver),
    sourceOwnerTotals:{
      actualDecisionRoots:aggregateField('observedRoots'),
      rootsHoldingTrainer:aggregateField('rootsHoldingTrainers'),
      rootsWithGenericUnblockedTrainer:aggregateField('rootsWithUnblockedTrainer'),
      passWithGenericUnblockedTrainer:aggregateField('acceptedPassWithUnblockedTrainer'),
      repeatedNativeOfferedCopies:aggregateField('nativeOfferedCopies'),
      repeatedGenericUnblockedCopies:aggregateField('genericUnblockedCopies'),
      actualNativeAcceptedTrainerRoots:aggregateField('selectedTrainerRootsAccepted')
    },
    formerlyErrorOriginalRank11Champion:
      rows.find(r=>r.id===ID)??null,
    rows,
    ownerTrainerPaperPlayabilityCertified:false,
    sourceStrategyCompetenceCertified:false,
    all32FieldSourceCertified:false,
    qualifiedGames:0
  };
}

/**
 * Two internally matched independent v14 native runs. Both have identical
 * printed sixties, same frozen 8 IDs, initial physical seed/seat schedule,
 * compiled pinned Twinleaf and native wrapper policy. The second adds the
 * established observational ownerGenericTrainerFrontier flag only. If
 * stochastic root parity fails, emit INCONCLUSIVE rather than A/A.
 *
 * @param {{baselineRunner?:Function,observedRunner?:Function}} [deps]
 * @returns {object}
 */
function runOriginalEightOwnerTrainerV15(deps={}){
  let rawControl=null,rawObserved=null;
  const baselineRunner=()=>{
    const result=(deps.baselineRunner??runMirroredIssue25V6)();
    rawControl=result.rawDevelopment?.rows??null;
    return result;
  };
  const observedRunner=()=>{
    const run=deps.observedRunner??(
      ()=>runMirroredIssue25V6({runner:options=>
        runDevelopment({...options,ownerGenericTrainerFrontier:true})})
    );
    const result=run();
    rawObserved=result.rawDevelopment?.rows??null;
    return result;
  };
  const baseline=runIssue25PrizeCustodyV14({runner:baselineRunner});
  const observed=runIssue25PrizeCustodyV14({runner:observedRunner});
  const audit=compareOwnerTrainerReadOnly(
    baseline,observed,rawControl,rawObserved);
  return {
    ...audit,
    baselineV14CompletedNativeRun:41932203013,
    originalV6ControlRun:41894027367,
    baselineNativeManifestVersion:baseline.policyPin,
    observedNativeManifestVersion:observed.policyPin,
    nativeEightEntriesPerArm:8,
    observedOwnerPrizeTransferAtOriginalRank11Champion:
      observed.sourceRank11Target?.ownerAudit?.nativePrizeZoneCustody??null,
    originalRank11SourcePromotionAtRoot26:
      observed.sourceRank11Target?.ownerAudit?.ownerPromotion??null,
    resultClassification:audit.exactAllEightRootLedgers&&
      audit.exactFullPhysicalDealBothArms&&
      audit.ownerTrainerAuditsCount===8?
      'READ_ONLY_A_A_ALL_EIGHT_NATIVE_DEVELOPMENT':
      'INCONCLUSIVE_OR_INCOMPLETE_NATIVE_DEVELOPMENT',
    qualifiedGames:0
  };
}

module.exports={
  VERSION,compareOwnerTrainerReadOnly,runOriginalEightOwnerTrainerV15
};
