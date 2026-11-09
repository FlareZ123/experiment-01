'use strict';

const VERSION='agent35-owner-public-opponent-active-retreat-lock-v1';

/**
 * A conservative public-printing gate for ongoing opponent Active Abilities
 * whose printed text forbids our Active Pokémon from retreating.
 *
 * A public printed prohibition remains a reason for a generic retreat
 * planner to abstain. Ability suppression may deactivate it in particular
 * board states; those cases require an explicit, separate policy treatment.
 * This checks only face-up opponent Active text, never hidden cards.
 *
 * @param {object} view Detached owner-root Pokémon observation.
 * @returns {boolean} Whether generic voluntary RetreatAction must abstain.
 */
function observedOpponentActiveForbidsRetreat(view){
  const opponent=view?.opponentPublic?.active;
  if(!opponent||!Array.isArray(opponent.abilityDetails))return false;
  return opponent.abilityDetails.some(ability=>
    typeof ability?.text==='string'&&
    /your opponent['’]s active pok[eé]mon can['’]t retreat/i
      .test(ability.text)&&
    /(?:as long as|while) this pok[eé]mon is (?:in the active spot|your active pok[eé]mon)/i
      .test(ability.text));
}

module.exports={VERSION,observedOpponentActiveForbidsRetreat};
