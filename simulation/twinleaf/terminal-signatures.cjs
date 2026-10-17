'use strict';

/**
 * Derive public, necessary terminal-condition signatures from an observed
 * transition. These are evidence markers, not an adjudication of paper-rule
 * loss cause: deck exhaustion loses at the attempted turn-opening draw, and
 * several game-ending conditions can coexist.
 *
 * @param {object|null} transition Detached public before/after Store snapshots.
 * @returns {object} Public terminal signatures with no hidden card identities.
 */
function terminalSignatures(transition) {
  if (!transition) {
    return {observed:false, interpretation:'No terminal Store transition was observed'};
  }
  const before = transition.before.players;
  const after = transition.after.players;
  const candidate = [0, 1].map(seat => ({
    seat,
    prizesRemainingBefore:before[seat].prizesRemaining,
    prizesRemainingAfter:after[seat].prizesRemaining,
    allPrizesGone:after[seat].prizesRemaining === 0,
    newlyTookLastPrizes:before[seat].prizesRemaining > 0 &&
      after[seat].prizesRemaining === 0,
    pokemonBefore:before[seat].inPlayPokemon,
    pokemonAfter:after[seat].inPlayPokemon,
    noPokemonInPlay:after[seat].inPlayPokemon === 0,
    newlyLostLastPokemon:before[seat].inPlayPokemon > 0 &&
      after[seat].inPlayPokemon === 0,
    deckBefore:before[seat].deckRemaining,
    deckAfter:after[seat].deckRemaining,
    emptyDeckAtTerminal:after[seat].deckRemaining === 0
  }));
  return {
    observed:true,
    engineWinner:transition.after.winner,
    endingAction:transition.actionName,
    actionPlayerSlot:transition.playerSlot,
    candidate,
    hasAmbiguousSimultaneousVisibleConditions:
      candidate.some(s => s.allPrizesGone) &&
      candidate.some(s => s.noPokemonInPlay),
    interpretation:'Visible terminal-condition signatures only. No inferred unique loss cause; a zero-card deck is not sufficient proof of a failed turn-opening draw.'
  };
}

module.exports={terminalSignatures};
