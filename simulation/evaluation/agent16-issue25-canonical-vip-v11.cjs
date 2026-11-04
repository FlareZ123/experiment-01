'use strict';

const assert=require('node:assert/strict');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');

const VERSION='agent16-issue25-v11-canonical-actor-inner-vip-after-pass';
const ENV='AGENT9_BATTLE_VIP_AFTER_PASS_DEV';

/** @param {object} row */
function nativeVipOutcome(row){
  const audit=row.actorOnlyDecisionCoverage?.ownerVipAfterPass??null;
  return {
    id:row.trial?.id??row.id??null,
    policyRecorded:audit!==null,
    originalPassRoots:audit?.originalPassRoots??null,
    eligiblePassRoots:audit?.eligiblePassRoots??null,
    acceptedItems:audit?.acceptedItems??null,
    rejectedItems:audit?.rejectedItems??null,
    acceptedSearches:audit?.acceptedSearches??null,
    rejectedSearches:audit?.rejectedSearches??null,
    nativeBenchConfirmed:audit?.nativeBenchConfirmed??null,
    nativeBenchUnconfirmed:audit?.nativeBenchUnconfirmed??null,
    unresolvedOwnerSearches:audit?.unresolvedOwnerSearches??null,
    bySeat:audit?.bySeat??null,
    rootActionCount:row.rootActionLedger?.length??
      row.nativeAbortEvidence?.rootActionLedger?.length??null
  };
}

/**
 * The canonical root policy is the outermost actual native decoder override.
 * Its fallthrough Pass invokes the inner owner-only VIP handler only if the
 * existing canonical composition's opt-in is true. A separate wrapper outside
 * the canonical actor cannot see these root Pass decisions (empirically 0
 * observed Pass roots and identical 8/8 accepted Store action traces in v10).
 *
 * Preserve the original v6 registered games, whole chosen attack set and
 * physical deals. Only enable the already implemented inner canonical
 * first-own-turn VIP; the flag is scoped to this synchronous invocation and
 * always restored, including if the real native Store throws.
 *
 * @param {{runner?:Function,layers?:object,attackLayer?:Function}} [deps]
 */
function runCanonicalVipIssue25V11(deps={}){
  const previous=process.env[ENV];
  process.env[ENV]='true';
  try{
    const executed=runMirroredIssue25V6(deps);
    const rows=executed.rawDevelopment?.rows??[];
    const vipRows=rows.map(nativeVipOutcome);
    const originalPassRoots=vipRows.reduce((n,r)=>
      n+(r.originalPassRoots??0),0);
    const acceptedItems=vipRows.reduce((n,r)=>n+(r.acceptedItems??0),0);
    const acceptedSearches=vipRows.reduce((n,r)=>n+(r.acceptedSearches??0),0);
    return {
      manifest:{
        ...executed.manifest,version:VERSION,
        policyEntryPoint:'simulation/evaluation/agent16-issue25-canonical-vip-v11.cjs',
        selectedInnerCanonicalOwnerVip:true,
        nativeActorPassFallthroughObservedPerRow:vipRows.map(r=>({
          id:r.id,policyRecorded:r.policyRecorded,
          originalPassRoots:r.originalPassRoots
        })),
        oneSelectedBehaviorChange:'canonical actor inner first-owner-turn Battle VIP Pass after Pass',
        originalV6RegisteredTrialIdsUnchanged:true,
        originalRank6AndRank11DecksUnchanged:true,
        candidateDeck60sUnchanged:true,
        nativeRootActionLimit:48,
        retrospectiveDevelopmentOnly:true,
        paperQualified:false,releaseQualified:false,
        competitiveGamesQualified:0
      },
      diagnostic:{
        ...executed.diagnostic,schema:VERSION,
        policyOwnerVipRows:vipRows,
        nativeOwnerVipAuditsReturned:vipRows.filter(r=>r.policyRecorded).length,
        observedCanonicalPassFallthroughRoots:originalPassRoots,
        observedAcceptedVipItems:acceptedItems,
        observedAcceptedVipSearches:acceptedSearches,
        competitiveGamesQualified:0,
        verdict:'FAIL-v11-development-only-native-owner-policy-unqualified'
      },
      rawDevelopment:executed.rawDevelopment
    };
  }finally{
    if(previous===undefined)delete process.env[ENV];
    else process.env[ENV]=previous;
  }
}
module.exports={VERSION,ENV,nativeVipOutcome,runCanonicalVipIssue25V11};
