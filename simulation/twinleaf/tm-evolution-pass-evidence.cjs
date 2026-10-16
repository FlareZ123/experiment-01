'use strict';

/**
 * Post-decision observational evidence for Technical Machine: Evolution.
 * This inspects the *actual remaining deck* only after a bot has selected
 * PassTurnAction. It must never be fed to a decision-making policy: K0 players
 * do not automatically know their Prize/deck partition.
 *
 * An available evolution card is a necessary target resource, not proof that
 * an attack can be announced or that all card effects permit its resolution.
 *
 * @param {object} player Actual pinned-engine Player.
 * @returns {null|object} Information for diagnostic archives only.
 */
function inspectTmEvolutionPass(player) {
  const active = player.active.getPokemonCard();
  if (!active || !player.active.tools.some(tool =>
    tool.fullName === 'Technical Machine: Evolution PAR')) return null;

  const targets = player.bench.map((slot, benchIndex) => {
    const pokemon = slot.getPokemonCard();
    const remaining = pokemon ? player.deck.cards.filter(card =>
      card.evolvesFrom === pokemon.name && card.stage !== undefined) : [];
    return {
      benchIndex,
      pokemon: pokemon?.name || null,
      evolutionsInDeck: remaining.length,
      evolutionPrintings: [...new Set(remaining.map(card => card.fullName))].sort()
    };
  });
  return {
    evidenceType: 'post-decision-tm-evolution-target-inventory-v1',
    activePokemon: active.name,
    attachedEnergyPrintings: player.active.energies.cards.map(card => card.fullName),
    remainingDeckCards: player.deck.cards.length,
    possibleBenchTargets: targets,
    targetCount: targets.filter(target => target.evolutionsInDeck > 0).length,
    interpretation: 'Remaining-deck target inventory only; excludes attack payment, lock interactions, and alternate decisions.'
  };
}

module.exports = {inspectTmEvolutionPass};
