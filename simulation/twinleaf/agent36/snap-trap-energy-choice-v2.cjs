'use strict';

const path = require('node:path');

const VERSION = 'agent36-snap-trap-public-best-remaining-attack-v2';
const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');

/**
 * Load pinned engine enums and the pure Energy cost utility.
 * @returns {object}
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
 * Build an EnergyMap using only the public attacking Active's two card lists.
 * This mirrors regular Energy and Pokemon-as-Energy collection and explicitly
 * models the pinned Beast Energy FLI Ultra Beast override. It does not invoke
 * Store.reduceEffect, which would propagate through hidden zones.
 *
 * @param {object} attackerActive
 * @param {object} types
 * @returns {{energyMap:object[],ultraBeast:boolean,beastEnergyAttached:boolean,
 *   model:string,dynamicOverrides:string[]}}
 */
function buildPublicEnergyMap(attackerActive, types = loadTypes()) {
  const {CardTag, CardType, SuperType} = types;
  const pokemon = attackerActive?.getPokemonCard?.();
  const ultraBeast = pokemon?.hasTag?.(CardTag.ULTRA_BEAST) === true;
  const energyMap = [];
  const dynamicOverrides = [];

  const add = card => {
    if (energyMap.some(entry => entry.card === card)) return;
    const isBeastEnergy = card?.fullName === 'Beast Energy FLI' ||
      (card?.set === 'FLI' && String(card?.setNumber) === '117');
    const provides = isBeastEnergy && ultraBeast
      ? [CardType.ANY]
      : Array.isArray(card?.provides) ? [...card.provides] : [];
    if (isBeastEnergy && ultraBeast) dynamicOverrides.push('Beast Energy FLI: ANY');
    energyMap.push({card, provides});
  };

  for (const card of attackerActive.cards) {
    if (card?.superType === SuperType.ENERGY) add(card);
  }
  for (const card of attackerActive.energies.cards) {
    if (!energyMap.some(entry => entry.card === card) &&
        Array.isArray(card?.provides) && card.provides.length > 0) {
      add(card);
    }
  }

  return {
    energyMap,
    ultraBeast,
    beastEnergyAttached: energyMap.some(entry =>
      entry.card?.fullName === 'Beast Energy FLI'
    ),
    model: 'public-active-static-provides-plus-beast-energy-ultra-beast-v1',
    dynamicOverrides
  };
}

/**
 * Select one attached Energy by minimizing the strongest remaining
 * energy-payable printed attack. The optional damage callback can model
 * public, verified attack modifiers; by default only numeric printed base
 * damage is used. This is a deterministic heuristic, not a full attack-legality
 * or expected-value model.
 *
 * @param {object} prompt Native ChooseCardsPrompt.
 * @param {object} attackerActive Exact public attacking Active PokemonCardList.
 * @param {object} [types] Pinned engine types.
 * @param {{energyMap?:object[],attackDamageValue?:
 *   (attack:object,context:object)=>number}} [options]
 * @returns {null|object}
 */
function chooseSnapTrapEnergyV2(prompt, attackerActive, types = loadTypes(), options = {}) {
  const {CardTag, EnergyType, SuperType, GameMessage, StateUtils} = types;
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

  const publicMap = buildPublicEnergyMap(attackerActive, types);
  const energyMap = options.energyMap ?? publicMap.energyMap;
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
  const damageModel = typeof options.attackDamageValue === 'function'
    ? 'caller-supplied-public-modifiers'
    : 'printed-base-only';
  const attackDamageValue = options.attackDamageValue ?? (attack =>
    Number.isFinite(attack.damage) ? Math.max(0, attack.damage) : 1
  );
  const contextFor = map => ({
    attackerPokemon,
    ultraBeast: publicMap.ultraBeast,
    beastEnergyAttached: map.some(entry =>
      entry.card?.fullName === 'Beast Energy FLI'
    ),
    energyMap: map
  });
  const damage = (attack, map) => {
    const value = attackDamageValue(attack, contextFor(map));
    return Number.isFinite(value) ? Math.max(0, value) : 1;
  };

  const payableBefore = attacks.filter(attack =>
    StateUtils.checkEnoughEnergy(energyMap, attack.cost)
  );
  const bestBefore = payableBefore.reduce((best, attack) =>
    Math.max(best, damage(attack, energyMap)), 0);
  const scored = eligible.map(({card, parentIndex}) => {
    const remainingEnergyMap = energyMap.filter(entry => entry.card !== card);
    const remainingPayable = payableBefore.filter(attack =>
      StateUtils.checkEnoughEnergy(remainingEnergyMap, attack.cost)
    );
    const bestRemaining = remainingPayable.reduce((best, attack) =>
      Math.max(best, damage(attack, remainingEnergyMap)), 0);
    const denied = payableBefore.filter(attack =>
      !StateUtils.checkEnoughEnergy(remainingEnergyMap, attack.cost)
    );
    const deniedBaseDamage = denied.reduce((sum, attack) =>
      sum + (Number.isFinite(attack.damage) ? Math.max(1, attack.damage) : 1), 0);
    const provides = Array.isArray(card.provides) ? card.provides : [];
    const prismStar = Array.isArray(card.tags) &&
      card.tags.includes(CardTag.PRISM_STAR);
    const specialEnergy = card.energyType === EnergyType.SPECIAL;

    return {
      card,
      parentIndex,
      bestBeforeAttackDamage: bestBefore,
      bestRemainingAttackDamage: bestRemaining,
      bestAttackDenial: bestBefore - bestRemaining,
      deniedAttacks: denied.map(attack => attack.name ?? null),
      deniedBaseDamage,
      eligibleCount: eligible.length,
      payableAttackCount: payableBefore.length,
      prismStar,
      specialEnergy,
      providedUnitCount: StateUtils.getProvidesUnitCount(provides),
      providedTypeCount: new Set(provides).size,
      energyMapModel: options.energyMap
        ? 'caller-supplied-public-energy-map'
        : publicMap.model,
      dynamicEnergyOverrides: publicMap.dynamicOverrides,
      damageModel,
      policy: VERSION
    };
  });

  scored.sort((a, b) =>
    a.bestRemainingAttackDamage - b.bestRemainingAttackDamage ||
    b.bestAttackDenial - a.bestAttackDenial ||
    Number(b.prismStar) - Number(a.prismStar) ||
    Number(b.specialEnergy) - Number(a.specialEnergy) ||
    b.providedUnitCount - a.providedUnitCount ||
    b.providedTypeCount - a.providedTypeCount ||
    a.parentIndex - b.parentIndex
  );

  return {
    ...scored[0],
    sumDeniedBaseDamage: scored[0].deniedBaseDamage,
    bestBeforeAttackNames: payableBefore
      .filter(attack => damage(attack, energyMap) === bestBefore)
      .map(attack => attack.name ?? null)
  };
}

module.exports = {
  VERSION,
  loadTypes,
  buildPublicEnergyMap,
  chooseSnapTrapEnergyV2
};
