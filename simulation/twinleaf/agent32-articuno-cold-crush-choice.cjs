'use strict';

const VERSION = 'agent32-articuno-one-water-cold-crush-choice-v1';
const MIN_OPPONENT_ACTIVE_ENERGY = 3;

/** @param {object} card @param {object} types */
function isBasicWaterEnergy(card, types) {
  return card?.superType === types.SuperType.ENERGY &&
    card.name === 'Water Energy' &&
    Array.isArray(card.provides) &&
    card.provides.includes(types.CardType.WATER);
}

/** @param {object} left @param {object} right */
function samePhysicalCard(left, right) {
  return left === right ||
    (Number.isInteger(left?.id) && left.id >= 0 && left.id === right?.id);
}

/**
 * Find the in-play slot containing the physical Articuno played from hand.
 * @param {object} owner
 * @param {object} card
 * @returns {object|null}
 */
function findArticunoSlot(owner, card) {
  const slots = [owner?.active, ...(owner?.bench ?? [])].filter(Boolean);
  return slots.find(slot =>
    (slot.cards ?? []).some(candidate => samePhysicalCard(candidate, card))) ?? null;
}

/**
 * Conservative public-state proposal for the rank3 one-Water Cold Crush line.
 * It is deliberately separate from the shared v8 owner policy and is not
 * integrated by this module. The opponent's hidden zones are never inspected.
 *
 * @param {{card:object,owner:object,opponent:object,types:object}} args
 * @returns {{decision:boolean,reason:string,details:object}}
 */
function decideOneWaterColdCrush({card, owner, opponent, types}) {
  const details = {
    opponentActiveEnergyCount: opponent?.active?.energies?.cards?.length ?? 0,
    otherBasicWaterCount: 0,
    ownerUsedGX: owner?.usedGX === true,
    minOpponentActiveEnergy: MIN_OPPONENT_ACTIVE_ENERGY,
    readsOpponentHidden: false,
    readsUnopenedDeck: false
  };
  const decline = reason => ({decision: false, reason, details});

  if (card?.name !== 'Articuno-GX' || card?.fullName !== 'Articuno-GX CES') {
    return decline('not-articuno-ces-31');
  }
  if (details.ownerUsedGX) return decline('gx-attack-already-used');

  const articunoSlot = findArticunoSlot(owner, card);
  if (!articunoSlot) return decline('articuno-not-in-play');

  const slots = [owner?.active, ...(owner?.bench ?? [])].filter(Boolean);
  details.articunoBasicWaterCount =
    (articunoSlot.energies?.cards ?? [])
      .filter(energy => isBasicWaterEnergy(energy, types)).length;
  details.otherBasicWaterCount = slots
    .filter(slot => slot !== articunoSlot)
    .flatMap(slot => slot.energies?.cards ?? [])
    .filter(energy => isBasicWaterEnergy(energy, types)).length;

  if (details.opponentActiveEnergyCount < MIN_OPPONENT_ACTIVE_ENERGY) {
    return decline('opponent-active-below-energy-threshold');
  }
  if (details.otherBasicWaterCount < 1) {
    return decline('no-transferable-owner-basic-water-for-cold-crush');
  }
  return {
    decision: true,
    reason: 'public-three-energy-active-one-water-cold-crush-proposal',
    details
  };
}

/** @param {object} left @param {object} right */
function sameTarget(left, right) {
  return left?.player === right?.player &&
    left?.slot === right?.slot &&
    left?.index === right?.index;
}

/**
 * Select exactly one legal owner Basic Water transfer for Cold Crush-GX.
 * The helper honors the actual MoveEnergyPrompt geometry and blocked indices.
 * It does not dispatch actions or mutate the Store.
 *
 * @param {{prompt:object,owner:object,played:object,types:object}} args
 * @returns {object[]}
 */
function chooseOneArticunoWaterTransfer({prompt, owner, played, types}) {
  const {PlayerType, SlotType, SuperType, GameMessage} = types;
  if (played?.card?.fullName !== 'Articuno-GX CES' ||
      prompt?.constructor?.name !== 'MoveEnergyPrompt' ||
      prompt.playerId !== owner?.id ||
      prompt.message !== GameMessage.MOVE_ENERGY_TO_ACTIVE ||
      prompt.playerType !== PlayerType.BOTTOM_PLAYER ||
      !Array.isArray(prompt.slots) ||
      !prompt.slots.includes(SlotType.ACTIVE) ||
      !prompt.slots.includes(SlotType.BENCH) ||
      prompt.filter?.superType !== SuperType.ENERGY ||
      prompt.filter?.name !== 'Water Energy' ||
      prompt.options?.min !== 1 ||
      prompt.options?.allowCancel !== false) {
    throw new Error('Articuno Cold Crush transfer prompt does not match the pinned geometry.');
  }

  const activeHasPlayedArticuno = (owner.active?.cards ?? [])
    .some(card => samePhysicalCard(card, played?.card));
  if (!activeHasPlayedArticuno) {
    throw new Error('Articuno Cold Crush recipient is not the played Active Pokémon.');
  }

  const destination = {
    player: PlayerType.BOTTOM_PLAYER,
    slot: SlotType.ACTIVE,
    index: 0
  };
  const blockedFrom = prompt.options.blockedFrom ?? [];
  const blockedTo = prompt.options.blockedTo ?? [];
  const blockedMap = prompt.options.blockedMap ?? [];
  const max = Number.isInteger(prompt.options.max) ?
    prompt.options.max : Number.MAX_SAFE_INTEGER;

  if (max < 1 || blockedTo.some(target => sameTarget(target, destination))) {
    throw new Error('Articuno Cold Crush prompt does not permit one transfer to Active.');
  }

  for (let benchIndex = 0; benchIndex < (owner.bench ?? []).length; benchIndex++) {
    const source = {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: benchIndex
    };
    if (blockedFrom.some(target => sameTarget(target, source))) continue;

    const slot = owner.bench[benchIndex];
    const blockedIndices = new Set(blockedMap
      .filter(entry => sameTarget(entry.source, source))
      .flatMap(entry => entry.blocked ?? []));

    for (const energy of slot?.energies?.cards ?? []) {
      const cardIndex = (slot.cards ?? []).indexOf(energy);
      if (cardIndex < 0 || blockedIndices.has(cardIndex) ||
          !isBasicWaterEnergy(energy, types)) continue;
      return [{from: source, to: destination, card: energy}];
    }
  }

  throw new Error('Articuno Cold Crush prompt has no legal owner Basic Water transfer.');
}

module.exports = {
  VERSION,
  MIN_OPPONENT_ACTIVE_ENERGY,
  isBasicWaterEnergy,
  decideOneWaterColdCrush,
  chooseOneArticunoWaterTransfer
};
