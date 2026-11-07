'use strict';

const path = require('node:path');

const VERSION = 'agent36-snap-trap-public-active-energy-denial-v1';
const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');

/**
 * Load the pinned engine types used by the selector.
 * @returns {{CardTag:object,EnergyType:object,SuperType:object,GameMessage:object,StateUtils:object}}
 */
function loadTypes() {
  const load = relative => require(path.join(OUTPUT, relative));
  return {
    ...load('game/store/card/card-types'),
    GameMessage: load('game/game-message').GameMessage,
    StateUtils: load('game/store/state-utils').StateUtils
  };
}

/**
 * Choose one real Energy from the attacking Active's public attached-Energy
 * sublist. The heuristic first maximizes printed attacks made unaffordable by
 * the removal, then prefers Prism Star, Special, and higher-unit Energy cards.
 * It reads only the prompt's public Active list, its Energy sublist, and the
 * Active Pokemon's printed attacks. It never inspects hand, deck, or Prizes.
 * Energy payment uses each card's static `provides` array. Dynamic Stadium,
 * Ability, and other in-play Energy modifiers are not applied in this v1 model.
 *
 * This is a deterministic developmental heuristic, not an optimal-play claim.
 *
 * @param {object} prompt Native ChooseCardsPrompt.
 * @param {object} attackerActive The exact public attacking Active PokemonCardList.
 * @param {object} [types] Pinned engine enums and StateUtils injection for tests.
 * @returns {null|{
 *   card:object,parentIndex:number,denialScore:number,deniedAttacks:string[],
 *   eligibleCount:number,payableAttackCount:number,prismStar:boolean,
 *   specialEnergy:boolean,providedUnitCount:number,providedTypeCount:number,
 *   energyMapModel:string,policy:string
 * }}
 */
function chooseSnapTrapEnergy(prompt, attackerActive, types = loadTypes()) {
  const {
    CardTag, EnergyType, SuperType, GameMessage, StateUtils
  } = types;

  if (
    prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
    prompt.result !== undefined ||
    prompt.message !== GameMessage.CHOOSE_CARD_TO_DISCARD ||
    prompt.cards !== attackerActive ||
    prompt.cards?.energies !== attackerActive?.energies ||
    prompt.filter?.superType !== SuperType.ENERGY ||
    Object.keys(prompt.filter ?? {}).length !== 1 ||
    prompt.options?.min !== 1 ||
    prompt.options?.max !== 1 ||
    prompt.options?.allowCancel !== false ||
    prompt.options?.isSecret === true ||
    typeof prompt.validate !== 'function' ||
    typeof StateUtils?.checkEnoughEnergy !== 'function' ||
    typeof StateUtils?.getProvidesUnitCount !== 'function'
  ) {
    return null;
  }

  const parentCards = prompt.cards.cards;
  const energyCards = prompt.cards.energies.cards;
  const blocked = new Set(prompt.options.blocked ?? []);
  const eligible = parentCards
    .map((card, parentIndex) => ({card, parentIndex}))
    .filter(({card, parentIndex}) =>
      energyCards.includes(card) &&
      card?.superType === SuperType.ENERGY &&
      !blocked.has(parentIndex) &&
      prompt.validate([card]) === true
    );

  if (eligible.length === 0) return null;

  const attackerPokemon = attackerActive.getPokemonCard?.();
  const attacks = Array.isArray(attackerPokemon?.attacks)
    ? attackerPokemon.attacks.filter(attack => Array.isArray(attack.cost))
    : [];
  const energyMap = energyCards.map(card => ({
    card,
    provides: Array.isArray(card?.provides) ? [...card.provides] : []
  }));
  const payableAttacks = attacks.filter(attack =>
    StateUtils.checkEnoughEnergy(energyMap, attack.cost)
  );

  const scored = eligible.map(({card, parentIndex}) => {
    const remainingEnergy = energyMap.filter(entry => entry.card !== card);
    const denied = payableAttacks.filter(attack =>
      !StateUtils.checkEnoughEnergy(remainingEnergy, attack.cost)
    );
    const denialScore = denied.reduce((score, attack) => {
      const damage = Number.isFinite(attack.damage)
        ? Math.max(1, attack.damage)
        : 1;
      return score + damage;
    }, 0);
    const provides = Array.isArray(card.provides) ? card.provides : [];
    const prismStar = Array.isArray(card.tags) &&
      card.tags.includes(CardTag.PRISM_STAR);
    const specialEnergy = card.energyType === EnergyType.SPECIAL;

    return {
      card,
      parentIndex,
      denialScore,
      deniedAttacks: denied.map(attack => attack.name ?? null),
      eligibleCount: eligible.length,
      payableAttackCount: payableAttacks.length,
      prismStar,
      specialEnergy,
      providedUnitCount: StateUtils.getProvidesUnitCount(provides),
      providedTypeCount: new Set(provides).size,
      energyMapModel: 'printed-provides-only',
      policy: VERSION
    };
  });

  scored.sort((a, b) =>
    b.denialScore - a.denialScore ||
    Number(b.prismStar) - Number(a.prismStar) ||
    Number(b.specialEnergy) - Number(a.specialEnergy) ||
    b.providedUnitCount - a.providedUnitCount ||
    b.providedTypeCount - a.providedTypeCount ||
    a.parentIndex - b.parentIndex
  );

  return scored[0];
}

module.exports = {VERSION, loadTypes, chooseSnapTrapEnergy};
