'use strict';

const assert=require('node:assert/strict');
const {replayPlan}=require('./agent25-rank19-source-alias-retrospective.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {pairRows}=require('./agent50-rank19-float-stone-paired-development.cjs');
const {withRank19NativePublicActiveReadOnly}=require(
  '../twinleaf/agent28-rank19-native-source-root-readonly.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const VERSION='agent28-exact-rank19-adp-first-gx-vs-ray-four-paired-v1';

/**
 * Reuse four previously examined, exact source physical deals. In both arms
 * Float Stone mobility is enabled. Only the default-off, public-own-board
 * ADP GX attack preference differs. Every native error/cap is retained.
 * @returns {object} Retrospective development results only.
 */
function run(){
  const plan=replayPlan();
  assert.equal(plan.trials.length,4);
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  const previousGX=process.env.AGENT28_ADP_GX_ROOT_DEV;
  const previousPayment=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  /** @param {boolean} gxPreference */
  function execute(gxPreference){
    process.env.AGENT28_ADP_GX_ROOT_DEV=gxPreference?'true':'false';
    const observed=withRank19NativePublicActiveReadOnly(()=>
      runDevelopment({...profile.policyOptions,
        sourceFloatStoneMobility:true,
        allowAdditionalOriginalSourceRanks:true,
        registeredTrials:plan.trials,
        registeredFrameName:VERSION+(gxPreference?'-gx':'-ray')}));
    assert.equal(observed.result.attempted,4);
    assert.equal(observed.result.rows.length,4);
    assert.equal(observed.audit.length,4);
    return plan.trials.map((trial,index)=>{
      const raw=observed.result.rows[index];
      const audit=observed.audit[index];
      const sourceSeat=trial.candidateSlot==='A'?1:0;
      assert.equal(raw.trial?.id,trial.id);
      assert.equal(audit.gameIndex,index+1);
      assert.equal(audit.sourceSeat,sourceSeat);
      assert.equal(audit.sourcePhysicalRagingCounts[sourceSeat],2);
      assert.equal(audit.sourcePhysicalRagingCounts[1-sourceSeat],0);
      const sourceActions=(raw.rootActionLedger??[]).filter(a=>
        a.playerSlot===sourceSeat&&a.action!=='ResolvePromptAction');
      return {
        trialId:trial.id,seed:trial.seed,
        candidateId:trial.candidateId,sourceSeat,
        sourceDealSha256:raw.sourceDealFingerprint??
          raw.initialSourceDealFingerprint?.digestSha256??null,
        status:raw.status??(raw.finished===true?'ENGINE_TERMINAL_UNQUALIFIED':
          'CENSORED_OR_NATIVE_ERROR'),
        finished:raw.finished===true,
        endReason:raw.endReason??null,
        nativeWinner:raw.winner??null,
        rootActionLedgerSha256:raw.rootActionLedgerSha256??null,
        sourceOwnerRoots:audit.sourceOwnerRootCount,
        sourceRagingActiveRoots:audit.sourceRagingActiveRoots,
        postRetreat:audit.sourceRetreatPostDispatch,
        finalPublicBoard:audit.lastNativePublicBoard,
        nativeSourceEpochs:raw.sourceDealEpochs?{
          recordedNativeRestarts:raw.sourceDealEpochs.recordedNativeRestarts,
          recordedOpeningDeals:raw.sourceDealEpochs.recordedOpeningDeals,
          allEpisodeOpeningsCaptured:raw.sourceDealEpochs.allEpisodeOpeningsCaptured
        }:null,
        sourceAttackSettlement:raw.sourceAttackSettlement?{
          declarations:raw.sourceAttackSettlement.declarations,
          settled:raw.sourceAttackSettlement.settled,
          crossEpochRejected:raw.sourceAttackSettlement.crossEpochSettlementsRejected,
          attacks:(raw.sourceAttackSettlement.attacks??[]).map(a=>({
            turn:a.turnBefore,attack:a.attackName,
            settled:a.settledPromptChain,
            prizesBefore:a.prizesBefore,prizesAfter:a.prizesAfter,
            nextOpponentRoot:a.nextSourceRoot??null
          }))
        }:null,
        sourceRootActions:sourceActions.map(a=>({
          turn:a.turnBefore,ordinal:a.actionOrdinal,
          action:a.action,attack:a.attack??null,card:a.card??null
        })),
        competitivelyQualified:false
      };
    });
  }
  let control,treatment;
  try{
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    control=execute(false);
    treatment=execute(true);
  }finally{
    if(previousGX===undefined)delete process.env.AGENT28_ADP_GX_ROOT_DEV;
    else process.env.AGENT28_ADP_GX_ROOT_DEV=previousGX;
    if(previousPayment===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=previousPayment;
  }
  const pairs=control.map((row,index)=>pairRows(row,treatment[index]));
  return {version:VERSION,originalRank:19,
    historicalSelectedSeeds:true,printedSixtiesUnchanged:true,
    floatStoneMobilityInBothArms:true,
    changedOption:'AGENT28_ADP_GX_ROOT_DEV:false -> true',
    vendorPin:profile.pinnedVendorRevision,
    attemptedArms:8,exactSourceDealMatches:pairs.filter(p=>
      p.physicalDealParity==='EXACT_SOURCE_DEAL_MATCH').length,
    pairs,competitivelyQualifiedGames:0,
    limitation:'Historical already-inspected four rank19 sources, unqualified source and candidate policies, native Store and paper clock gaps.'};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
