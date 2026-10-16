'use strict';

const {publicBoardSnapshot} = require('./public-board-telemetry.cjs');

/**
 * Read-only, perspective-limited record of a candidate turn's first
 * decision state. Captured before calling the policy, never fed back to it.
 * Opponent hand and face-down Prize identities are intentionally absent.
 *
 * @param {object} state Live pinned Twinleaf Store state.
 * @param {0|1} candidateSeat Physical seat of the known candidate.
 * @returns {object} Detached diagnostic of current public board and own zones.
 */
function copycatTurnStartSnapshot(state, candidateSeat) {
  const candidate = state.players[candidateSeat];
  const opponent = state.players[1 - candidateSeat];
  const prior = state.playerLastAttack?.[opponent.id] || null;
  const slot = [candidate.active, ...candidate.bench];
  const mimikyu = slot.map((pokemon, index) => ({
    pokemon, index
  })).filter(({pokemon}) => pokemon.getPokemonCard()?.fullName === 'Mimikyu GRI')
    .map(({pokemon,index}) => ({
      location:index === 0 ? 'active' : 'bench',
      benchIndex:index === 0 ? null : index - 1,
      energyPrintings:pokemon.energies.cards.map(card => card.fullName),
      damage:pokemon.damage
    }));
  const ownDialga = {
    hand:candidate.hand.cards.filter(card => card.fullName === 'Dialga-GX UPR').length,
    discard:candidate.discard.cards.filter(card => card.fullName === 'Dialga-GX UPR').length,
    inPlay:slot.filter(pokemon =>
      pokemon.getPokemonCard()?.fullName === 'Dialga-GX UPR').length
  };
  return {
    turn:state.turn,candidateSeat,
    candidateUsedGX:candidate.usedGX === true,
    previousOpponentAttack:prior ? {
      source:prior.sourceCard?.fullName || null,
      name:prior.attack?.name || null,
      gx:prior.attack?.gxAttack === true
    } : null,
    mimikyu,ownDialga,
    candidateHand:candidate.hand.cards.map(card => card.fullName),
    candidateDiscard:candidate.discard.cards.map(card => card.fullName),
    opponentDiscard:opponent.discard.cards.map(card => card.fullName),
    opponentHandSize:opponent.hand.cards.length,
    board:publicBoardSnapshot(state),
    prizeCounts:state.players.map(player =>
      player.prizes.filter(prize => prize.cards.length > 0).length)
  };
}

module.exports = {copycatTurnStartSnapshot};
