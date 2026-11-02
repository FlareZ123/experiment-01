'use strict';
const assert=require('node:assert/strict');

const VERSION='agent50-rank19-float-stone-original-source-paired-development-v1';

/**
 * Compare identical registered source/candidate sixty identities and actual
 * physical source deals. A shared seed alone never establishes deal parity.
 * No outcome becomes competitively qualified through this comparison.
 * @param {object} control Frozen v2 source/candidate encounter.
 * @param {object} treatment Identical encounter plus source Float Stone roots.
 * @returns {object}
 */
function pairRows(control,treatment){
  assert.equal(control.trialId,treatment.trialId);
  assert.equal(control.sourceSeat,treatment.sourceSeat);
  const a=control.sourceDealSha256,b=treatment.sourceDealSha256;
  const dealParity=typeof a==='string'&&a.length===64&&a===b?
    'EXACT_SOURCE_DEAL_MATCH':
    (typeof a==='string'&&typeof b==='string'&&a.length===64&&
       b.length===64?'SOURCE_DEAL_DIFFERENT':'UNVERIFIED');
  return {
    trialId:control.trialId,
    seed:control.seed,
    sourceSeat:control.sourceSeat,
    candidateId:control.candidateId,
    physicalDealParity:dealParity,
    sourceDealControl:a,sourceDealTreatment:b,
    control,treatment,
    competitivelyQualified:false
  };
}

/**
 * Deterministically replay the four previously inspected rank-19 original
 * source deals, twice, under the same genuine canonical bilateral runner.
 * Only the second arm enables an already integrated, source-seat-only,
 * owner-visible Float Stone/retreat decision policy. Every native failure,
 * action cap and terminal is retained. Historical seeds are not prospective.
 * @returns {object}
 */
function run(){
  const {replayPlan}=require('./agent25-rank19-source-alias-retrospective.cjs');
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const {withRank19NativePublicActiveReadOnly}=require(
    '../twinleaf/agent28-rank19-native-source-root-readonly.cjs');
  const profile=require('./agent41-frozen-bilateral-development-v2.json');
  const plan=replayPlan();
  assert.equal(plan.trials.length,4);
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  const previous=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  /** @param {boolean} enabled */
  function execute(enabled){
    const observed=withRank19NativePublicActiveReadOnly(()=>
      runDevelopment({...profile.policyOptions,
        sourceFloatStoneMobility:enabled,
        allowAdditionalOriginalSourceRanks:true,
        registeredTrials:plan.trials,
        registeredFrameName:VERSION+(enabled?'-treated':'-control')}));
    assert.equal(observed.result.attempted,4);
    assert.equal(observed.result.rows.length,4);
    assert.equal(observed.audit.length,4);
    return observed.result.rows.map((raw,i)=>{
      const trial=plan.trials[i],audit=observed.audit[i];
      assert.equal(raw.trial?.id,trial.id);
      assert.equal(audit.gameIndex,i+1);
      const sourceSeat=trial.candidateSlot==='A'?1:0;
      assert.equal(audit.sourceSeat,sourceSeat);
      assert.equal(audit.sourcePhysicalRagingCounts[sourceSeat],2);
      assert.equal(audit.sourcePhysicalRagingCounts[1-sourceSeat],0);
      return {
        trialId:trial.id,seed:trial.seed,
        candidateId:trial.candidateId,sourceSeat,
        sourceDealSha256:raw.sourceDealFingerprint??
          raw.initialSourceDealFingerprint?.digestSha256??null,
        finished:raw.finished===true,
        endReason:raw.endReason??null,
        status:raw.status??(raw.finished===true?
          'ENGINE_TERMINAL_UNQUALIFIED':'CENSORED_OR_NATIVE_ERROR'),
        rootActionLedgerSha256:raw.rootActionLedgerSha256??null,
        nativeRootCount:raw.rootActionLedger?.length??null,
        sourceRootCount:audit.sourceOwnerRootCount,
        ragingActiveRoots:audit.sourceRagingActiveRoots,
        ragingActiveTurns:audit.sourceRagingActiveUniqueTurns,
        ragingFundedBenchRoots:audit.sourceRagingBenchedWithEnergyRoots,
        fundedHoOhRoots:audit.fundedHoOhActiveRoots,
        hoOhFundedFloatHeldRoots:audit.fundedHoOhWithFloatStoneHeld,
        hoOhFundedFloatAttachedRoots:audit.fundedHoOhWithFloatStoneAttached,
        fundedHoOhMobilitySamples:audit.fundedHoOhMobilitySamples,
        bellowingDeclared:audit.bellowingDeclared,
        sourceActivePrintings:audit.sourceActivePrintingCounts,
        sourceRetreatPostDispatch:audit.sourceRetreatPostDispatch,
        lastNativeRootActions:(raw.rootActionLedger??[]).slice(-16)
          .map(root=>({
            seat:root.playerSlot,turn:root.turnBefore,
            ordinal:root.actionOrdinal,action:root.action,
            card:root.card??null,attack:root.attack??null
          })),
        sourceRootActions:(raw.rootActionLedger??[])
          .filter(root=>root.playerSlot===sourceSeat&&
            root.action!=='ResolvePromptAction')
          .map(root=>({
            turn:root.turnBefore,ordinal:root.actionOrdinal,
            action:root.action,card:root.card??null,
            attack:root.attack??null
          })),
        ragingActiveEnergySamples:audit.ragingActiveEnergySamples,
        paperPaymentVerified:false,
        fullSourceCompetenceQualified:false,
        competitivelyQualified:false
      };
    });
  }
  let control,treatment;
  try{
    control=execute(false);
    treatment=execute(true);
  }finally{
    if(previous===undefined)
      delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=previous;
  }
  const pairs=control.map((row,i)=>pairRows(row,treatment[i]));
  return {
    version:VERSION,
    originalSourceRank:19,
    originalPrintedSource60Unchanged:true,
    bothFixedCandidate60sUnchanged:true,
    vendorPin:profile.pinnedVendorRevision,
    historicalSelectedSeeds:true,
    comparisonScope:'source-seat Float Stone root and retreat only',
    frozenControlOptions:profile.policyOptions,
    changedOption:'sourceFloatStoneMobility:false -> true',
    exactSourceDealMatches:pairs.filter(x=>
      x.physicalDealParity==='EXACT_SOURCE_DEAL_MATCH').length,
    nonMatches:pairs.filter(x=>
      x.physicalDealParity!=='EXACT_SOURCE_DEAL_MATCH')
      .map(x=>({trialId:x.trialId,status:x.physicalDealParity})),
    attemptedArms:8,
    pairs,
    competitivelyQualifiedGames:0,
    limitation:'Selected historical source deals, developmental two-seat opponent policy, partial paper-effect and timer checks; engine terminals cannot rank candidate decks.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,pairRows,run};
