'use strict';

/**
 * Capture the actual first turn from a Twinleaf state. The engine resolves
 * the first-player coin flip and subsequent choice during setup, assigns
 * state.activePlayer, and increments state.turn to 1 in initNextTurn.
 * The initial activePlayer value while turn===0 is not evidence.
 *
 * This helper has no vendor dependency and makes no inference from A/B
 * deck placement, seed parity, or an unsourced policy assumption.
 *
 * @param {{turn:number,activePlayer:number,players:Array<{id:number,name:string}>}} state
 * @returns {{slot:number,playerId:number,playerName:string}|null}
 */
function observeFirstTurn(state) {
  if (state.turn !== 1) return null;
  const slot = state.activePlayer;
  if (!Number.isInteger(slot) || slot < 0 || slot >= state.players.length) {
    throw new Error('Twinleaf first turn has invalid activePlayer slot.');
  }
  const player = state.players[slot];
  return {slot, playerId: player.id, playerName: player.name};
}

/**
 * Check a captured starting player against the earliest turn-specific draw
 * log. Turn-one draw is explicitly enabled in the research runner.
 * StateLog timestamps are deliberately excluded from reproducible evidence.
 *
 * @param {{slot:number,playerId:number,playerName:string}|null} firstTurn
 * @param {Array<{message:string,params?:Record<string,unknown>}>} logs
 * @returns {{firstTurnSlot:number|null,firstTurnPlayerId:number|null,firstTurnPlayerName:string|null,firstDrawLogName:string|null,verifiedByDrawLog:boolean}}
 */
function summarizeTurnOrder(firstTurn, logs) {
  const firstDraw = logs.find(log => log.message === 'LOG_PLAYER_DRAWS_CARD');
  const firstDrawLogName = firstDraw ? firstDraw.params?.name : null;
  const verified = firstTurn !== null && firstDrawLogName === firstTurn.playerName;
  if (firstTurn !== null && firstDrawLogName !== null && !verified) {
    throw new Error('Twinleaf first-turn observer contradicts first draw log.');
  }
  return {
    firstTurnSlot: firstTurn?.slot ?? null,
    firstTurnPlayerId: firstTurn?.playerId ?? null,
    firstTurnPlayerName: firstTurn?.playerName ?? null,
    firstDrawLogName: firstDrawLogName ?? null,
    verifiedByDrawLog: verified
  };
}

module.exports = {observeFirstTurn, summarizeTurnOrder};
