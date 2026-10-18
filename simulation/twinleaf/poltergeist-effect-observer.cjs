'use strict';

/**
 * Detached post-choice evidence for the printed Poltergeist 50xTrainer effect.
 * Hand contents are retrospective only and must not be exposed to bot policy.
 * This audit does not resolve Weakness, HP modifiers, prevention or effects.
 *
 * @param {object} state Live pinned Twinleaf state.
 * @param {number} trainerSuperType Engine enum constant for Trainers.
 * @returns {object[]}
 */
function snapshot(state, trainerSuperType) {
  return state.players.map(player => {
    const pokemon = player.active.getPokemonCard();
    const handTrainers = player.hand.cards
      .filter(card => card.superType === trainerSuperType)
      .map(card => card.name);
    return {
      active: pokemon?.name ?? null,
      printedHp: pokemon?.hp ?? null,
      activeDamage: player.active.damage,
      handSize: player.hand.cards.length,
      handTrainerCount: handTrainers.length,
      handTrainerNames: handTrainers,
      prizesRemaining: player.prizes.filter(prize => prize.cards.length > 0).length,
      inPlayPokemon: Number(Boolean(pokemon)) +
        player.bench.filter(bench => bench.getPokemonCard()).length
    };
  });
}

/**
 * A necessary printed-base-damage calculation from the actual defender hand.
 * A KO or Prize change alone does not independently validate this damage.
 * @param {object} event Window rooted at a real Store attack declaration.
 * @returns {object}
 */
function assess(event) {
  if (![0, 1].includes(event.attackerSeat)) {
    throw new Error('Poltergeist audit needs authenticated attacker seat');
  }
  const defenderSeat = 1 - event.attackerSeat;
  const defender = event.before[defenderSeat];
  const last = event.steps.at(-1)?.after?.[defenderSeat] ?? event.after[defenderSeat];
  const attackerAfter = event.steps.at(-1)?.after?.[event.attackerSeat] ??
    event.after[event.attackerSeat];
  const printedBaseDamage = defender.handTrainerCount * 50;
  const printedHp = Number(defender.printedHp);
  const initialRemainingHp = defender.printedHp === null ? null :
    printedHp - Number(defender.activeDamage);
  return {
    printedAttack: 'Gengar & Mimikyu-GX TEU Poltergeist',
    sourceHandTrainerCount: defender.handTrainerCount,
    sourceHandTrainerNames: defender.handTrainerNames,
    printedBaseDamage,
    defenderBefore: defender.active,
    defenderPrintedHp: defender.printedHp,
    defenderDamageBefore: defender.activeDamage,
    printedRemainingHpBefore: initialRemainingHp,
    printedBaseDamageReachesPrintedRemainingHp: initialRemainingHp === null ? null :
      printedBaseDamage >= initialRemainingHp,
    defenderInPlayChange: last.inPlayPokemon - defender.inPlayPokemon,
    prizeChange: attackerAfter.prizesRemaining - event.before[event.attackerSeat].prizesRemaining,
    qualification: 'retrospective printed-base-damage and physical Store consequence only; damage modifiers and exact target KO cause unverified'
  };
}

module.exports = {snapshot, assess};
