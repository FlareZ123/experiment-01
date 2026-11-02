'use strict';

const VERSION='agent24-same-resolution-pending-replay-prize-v1';

/**
 * Read-only numerical projection of a *single already validated native
 * knockout-resolution batch*. This intentionally does not assert that the
 * event occurred legally under paper rules, nor determine a final game
 * winner (simultaneous Pokemon absence and other win conditions are external).
 *
 * A native sudden-death KO can end the game before moving a physical Prize.
 * Therefore a [6,6] physical snapshot by itself cannot decide whether a
 * first-Prize lead was about to exist. This function requires the reduced
 * actual KnockOutEffect entitlement receipts before making any projection.
 *
 * @param {object} args
 * @param {boolean} args.authenticatedReplayEpoch Actual reset/new six-Prize deal.
 * @param {boolean} args.singleSettledResolutionBatch Same simultaneous KO batch.
 * @param {number[]} args.physicalRemaining Public Prize counts before movement.
 * @param {object[]} args.koEntitlements Post-reduction, exact physical KO effects.
 * @returns {object} Projected Prize counts and unresolved-paper caveat.
 */
function projectPendingReplayPrizes({
  authenticatedReplayEpoch=false,
  singleSettledResolutionBatch=false,
  physicalRemaining=null,
  koEntitlements=null
}={}){
  const base={schema:VERSION,paperGameOutcomeQualified:false};
  if(authenticatedReplayEpoch!==true||singleSettledResolutionBatch!==true)
    return {...base,status:'KO_RESOLUTION_EPOCH_UNVERIFIED',
      projectedLeaderSeat:null};
  if(!Array.isArray(physicalRemaining)||physicalRemaining.length!==2||
     !physicalRemaining.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=6))
    return {...base,status:'PRE_KO_PRIZE_COUNTS_UNVERIFIED',
      projectedLeaderSeat:null};
  if(!Array.isArray(koEntitlements)||koEntitlements.length===0||
     !koEntitlements.every(e=>
       e&&(e.victimSeat===0||e.victimSeat===1)&&
       Number.isSafeInteger(e.prizeCount)&&e.prizeCount>0&&
       e.preventDefault===false&&e.alternatePrizeDestination===false))
    return {...base,status:'KO_PRIZE_ENTITLEMENTS_UNVERIFIED',
      projectedLeaderSeat:null};
  const pendingByClaimant=[0,0];
  for(const event of koEntitlements)
    pendingByClaimant[1-event.victimSeat]+=event.prizeCount;
  const projectedRemaining=physicalRemaining.map((n,seat)=>
    Math.max(0,n-pendingByClaimant[seat]));
  const leader=projectedRemaining[0]===projectedRemaining[1]?
    null:(projectedRemaining[0]<projectedRemaining[1]?0:1);
  return {
    ...base,status:leader===null?
      'PENDING_KO_PRIZES_NO_STRICT_LEAD':'PENDING_KO_PRIZES_STRICT_LEAD',
    pendingPrizesByClaimant:pendingByClaimant,
    projectedRemainingPrizes:projectedRemaining,
    projectedLeaderSeat:leader,
    paperWinnerSeat:null,
    reason:'Pending KO prizes in one batch; no actual transfer, card-effect, simultaneous-loss or event-clock qualification'
  };
}

const NATIVE_COMPARISON_VERSION='agent24-native-pending-prize-winner-compare-v1';

/**
 * A read-only comparison of one native engine terminal against the pending
 * Prize projection. A mismatch can reveal a risky adjudication shortcut, but
 * this function cannot exclude other legal ways to win the game.
 *
 * @param {object} [args]
 * @param {object} [args.projection] Output of projectPendingReplayPrizes.
 * @param {boolean} [args.nativeFinished] Native terminal flag.
 * @param {string} [args.nativeEndReason] Exact engine terminal reason.
 * @param {0|1} [args.nativeWinnerSeat] Native winner physical seat.
 * @returns {object} Prize-only compatibility, never paper qualification.
 */
function compareNativePendingPrizeWinner({
  projection=null,
  nativeFinished=false,
  nativeEndReason=null,
  nativeWinnerSeat=null
}={}){
  const base={
    schema:NATIVE_COMPARISON_VERSION,
    paperGameOutcomeQualified:false,
    competingWinConditionsExcluded:false,
    nativeWinnerSeat,
    projectedPrizeLeaderSeat:null
  };
  if(!projection||projection.schema!==VERSION||
     !['PENDING_KO_PRIZES_STRICT_LEAD',
       'PENDING_KO_PRIZES_NO_STRICT_LEAD'].includes(projection.status))
    return {...base,status:'PENDING_PRIZE_PROJECTION_UNVERIFIED'};
  if(nativeFinished!==true||nativeEndReason!=='engine-game-end'||
     (nativeWinnerSeat!==0&&nativeWinnerSeat!==1))
    return {...base,status:'NATIVE_ENGINE_TERMINAL_UNVERIFIED'};
  const leader=projection.projectedLeaderSeat;
  const status=leader===null?
    'NATIVE_WINNER_WITHOUT_PENDING_PRIZE_LEAD':
    leader!==nativeWinnerSeat?
      'NATIVE_WINNER_OPPOSES_PENDING_PRIZE_LEAD':
      'NATIVE_WINNER_MATCHES_PENDING_PRIZE_LEAD';
  return {
    ...base,status,projectedPrizeLeaderSeat:leader,
    prizeOnlyCompatible:leader===nativeWinnerSeat,
    reason:'Compares pending KO Prize totals only; excludes neither other win conditions nor effects and never qualifies a paper result'
  };
}

module.exports={VERSION,NATIVE_COMPARISON_VERSION,
  projectPendingReplayPrizes,compareNativePendingPrizeWinner};

