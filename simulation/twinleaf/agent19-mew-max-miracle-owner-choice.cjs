'use strict';

/** @param {object} input Detached owner-authenticated prompt DTO. */
function chooseMewMaxMiracleAgainstSafeguard(input) {
  if (input.actor.decisionKind !== 'owner-prompt' || input.prompt.kind !== 'ChooseAttackPrompt' ||
      input.actor.ownPublic?.active?.printing !== 'Mew VMAX FST' ||
      input.actor.opponentPublic?.active?.printing !== 'Mimikyu PAL') return null;
  for (const donor of input.prompt.offered) {
    if (donor.printing !== 'Mew VMAX FST') continue;
    for (const attack of donor.attacks) {
      if (attack.name === 'Max Miracle' && !attack.blocked)
        return {sourceIndex: donor.index, attackIndex: attack.index};
    }
  }
  return null;
}

module.exports = {chooseMewMaxMiracleAgainstSafeguard};
