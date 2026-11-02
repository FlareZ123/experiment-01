'use strict';

const VERSION='agent24-native-replay-first-strict-prize-lead-v1';

/**
 * Detect a paper tiebreaker winner from a *settled and independently
 * authenticated* native sudden-death replay. No native game-state mutation.
 *
 * Advanced Player's Rulebook v3.4, section E: a tied game requires a fresh
 * six-Prize tiebreaker, whose winner is first to have fewer Prizes remaining.
 *
 * This observer does not certify the original tie, epoch provenance, legal
 * attack/Prize transition, or an actual tournament clock. Those requirements
 * remain external release-level gates.
 *
 * @param {object} args
 * @param {object|null} [args.state] Actual native Store state after dispatch.
 * @param {number} [args.playerTurnPhase] Pinned native GamePhase.PLAYER_TURN.
 * @param {boolean} [args.authenticatedReplayEpoch=false] Actual native
 *   reset marker and six-Prize new deal validated separately.
 * @param {boolean} [args.originalActionSettled=false] Actual accepted Store
 *   root; unresolved prompts must be absent.
 * @returns {object} Read-only public Prize-count witness and failure reason.
 */
function paperReplayFirstLeadWitness({
  state=null,playerTurnPhase,
  authenticatedReplayEpoch=false,
  originalActionSettled=false
}={}){
  const base={schema:VERSION,paperGameOutcomeQualified:false};
  if(authenticatedReplayEpoch!==true)
    return {...base,status:'REPLAY_EPOCH_UNVERIFIED',paperWinnerSeat:null};
  if(!state||state.isSuddenDeath!==true||!Number.isSafeInteger(playerTurnPhase))
    return {...base,status:'NATIVE_REPLAY_STATE_UNVERIFIED',
      paperWinnerSeat:null};
  if(state.phase!==playerTurnPhase||originalActionSettled!==true||
     !Array.isArray(state.prompts)||
     state.prompts.some(prompt=>prompt.result===undefined))
    return {...base,status:'REPLAY_ROOT_NOT_SETTLED',
      paperWinnerSeat:null};
  if(!Array.isArray(state.players)||state.players.length!==2||
     !state.players.every(player=>Array.isArray(player.prizes)&&
       player.prizes.length===6&&
       player.prizes.every(prize=>Array.isArray(prize.cards)&&
         prize.cards.length<=1))||
     !state.players.every(player=>Array.isArray(player.active?.cards)&&
       player.active.cards.length>0))
    return {...base,status:'SIX_PRIZE_REPLAY_BOARD_UNVERIFIED',
      paperWinnerSeat:null};
  const remaining=state.players.map(player=>player.prizes
    .filter(prize=>prize.cards.length>0).length);
  const body={...base,
    remainingPrizesBySeat:remaining,
    nativeEngineOngoing:true,
    source:'Advanced Player\'s Rulebook 3.4, E. Win and Loss'};
  if(remaining[0]===remaining[1])
    return {...body,status:'NO_STRICT_PRIZE_LEAD',
      paperWinnerSeat:null};
  return {...body,status:'PAPER_REPLAY_FIRST_PRIZE_LEAD',
    paperWinnerSeat:remaining[0]<remaining[1]?0:1,
    disposition:'STOP_NATIVE_REPLAY_FOR_PAPER_REVIEW',
    paperGameOutcomeQualified:false,
    reason:'Native replay currently continues after a strict Prize lead; paper tiebreaker should terminate, subject to actual original-tie and legal-first-Prize certification'};
}

module.exports={VERSION,paperReplayFirstLeadWitness};
