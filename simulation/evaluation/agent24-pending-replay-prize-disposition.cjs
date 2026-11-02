'use strict';

const VERSION='agent24-same-resolution-pending-replay-prize-v1';
const ORDINARY_VERSION='agent24-same-resolution-pending-ordinary-prize-v1';

/**
 * Shared read-only arithmetic for one already authenticated, fully observed
 * native KO resolution batch. A pending Prize calculation cannot certify any
 * paper outcome or exclude other game-end and card-text interactions.
 *
 * @param {object} args
 * @param {boolean} args.authenticatedEpoch Exact source-owner Prize epoch.
 * @param {boolean} args.singleSettledResolutionBatch Entire simultaneous KOs.
 * @param {number[]} args.physicalRemaining Pre-KO public Prize counts.
 * @param {object[]} args.koEntitlements Reduced native KO effect receipts.
 * @param {string} schema Distinct ordinary/replay evidence provenance.
 * @returns {object} Prize-only projection with paper qualification veto.
 */
function calculatePendingPrizes({
  authenticatedEpoch=false,
  singleSettledResolutionBatch=false,
  physicalRemaining=null,
  koEntitlements=null
}={},schema){
  const base={schema,paperGameOutcomeQualified:false};
  if(authenticatedEpoch!==true||singleSettledResolutionBatch!==true)
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
    projectedBothPrizeEmpty:projectedRemaining.every(n=>n===0),
    paperWinnerSeat:null,
    reason:'Pending KO prizes in one batch; no actual transfer, card-effect, simultaneous-loss or event-clock qualification'
  };
}

/**
 * @param {object} [args]
 * @param {boolean} [args.authenticatedReplayEpoch] Native fresh-six Prize replay.
 * @param {boolean} [args.singleSettledResolutionBatch]
 * @param {number[]} [args.physicalRemaining]
 * @param {object[]} [args.koEntitlements]
 * @returns {object} Native sudden-death KO Prize projection.
 */
function projectPendingReplayPrizes({
  authenticatedReplayEpoch=false,
  ...rest
}={}){
  return calculatePendingPrizes({
    ...rest,authenticatedEpoch:authenticatedReplayEpoch
  },VERSION);
}

/**
 * Separate source-provenance gate for ordinary six-Prize games, including
 * simultaneous final-Prize KO events. The ordinary epoch must be positively
 * authenticated; merely setting the current Prize count is insufficient.
 *
 * @param {object} [args]
 * @param {boolean} [args.authenticatedOrdinaryEpoch]
 * @param {boolean} [args.singleSettledResolutionBatch]
 * @param {number[]} [args.physicalRemaining]
 * @param {object[]} [args.koEntitlements]
 * @returns {object} Ordinary-game KO Prize projection.
 */
function projectPendingOrdinaryPrizes({
  authenticatedOrdinaryEpoch=false,
  ...rest
}={}){
  return calculatePendingPrizes({
    ...rest,authenticatedEpoch:authenticatedOrdinaryEpoch
  },ORDINARY_VERSION);
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
  if(!projection||![VERSION,ORDINARY_VERSION].includes(projection.schema)||
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

module.exports={VERSION,ORDINARY_VERSION,NATIVE_COMPARISON_VERSION,
  projectPendingReplayPrizes,projectPendingOrdinaryPrizes,
  compareNativePendingPrizeWinner};

