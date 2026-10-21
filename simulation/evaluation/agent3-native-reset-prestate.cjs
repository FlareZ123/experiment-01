'use strict';

const VERSION='agent3-native-reset-public-win-prestate-v1';

/**
 * Inspect the public conditions checked by pinned Twinleaf's checkWinner.
 * This is an instantaneous pre-dispatch snapshot, so a prompt callback may
 * change the conditions before the engine performs its winner check.
 * No private hand, deck, or face-down Prize identity is accessed.
 *
 * @param {object} state Actual native Store State before dispatch.
 * @returns {object} Detached, public, diagnostic-only preconditions.
 */
function captureNativeResetPrestate(state){
  const players=state.players.map(player=>({
    noActive:player.active.cards.length===0,
    noPrizes:player.prizes.every(prize=>prize.cards.length===0),
    occupiedBenchSlots:player.bench.filter(slot=>slot.cards.length>0).length
  }));
  const nativePoints=[
    Number(players[1].noActive)+Number(players[0].noPrizes),
    Number(players[0].noActive)+Number(players[1].noPrizes)
  ];
  return {
    schema:VERSION,players,
    nativeCheckWinnerPointsIfCheckedNow:nativePoints,
    bothSeatsWouldScoreIfCheckedNow:nativePoints.every(n=>n>0),
    preDispatchOnly:true,provesTransitionCause:false,
    competitiveQualified:false
  };
}

module.exports={VERSION,captureNativeResetPrestate};
