'use strict';

/** @param {object} state @param {object} card */
function primaryLocations(state, card) {
  const locations = [];
  /** @param {string} label @param {object[]|undefined} cards */
  const add = (label, cards) => {
    if (cards && cards.includes(card)) locations.push(label);
  };
  state.players.forEach((player, seat) => {
    const key = 'seat' + seat + '.';
    for (const zone of ['deck','hand','discard','lostzone','stadium','supporter']) {
      add(key + zone, player[zone]?.cards);
    }
    add(key + 'active.cards', player.active?.cards);
    add(key + 'active.tools', player.active?.tools);
    (player.bench || []).forEach((slot, i) => {
      add(key + 'bench' + i + '.cards', slot.cards);
      add(key + 'bench' + i + '.tools', slot.tools);
    });
    (player.prizes || []).forEach((zone, i) =>
      add(key + 'prize' + i, zone.cards));
  });
  return locations;
}

/**
 * Trace the actual root Store's Energy-effect physical origin and destination.
 * Speculative bot Simulator states and their actions are excluded by root Store
 * object identity, and only events on its current live State are recorded.
 *
 * @template T
 * @param {{Store:Function,AttachEnergyEffect:Function}} engine Pinned constructors.
 * @param {()=>T} work Synchronous, real Store match runner.
 * @returns {{result:T,report:object}} Detached observational report.
 */
function withAttachmentOriginObserver(engine, work) {
  const {Store, AttachEnergyEffect} = engine;
  const proto = Store.prototype;
  const dispatch = Object.getOwnPropertyDescriptor(proto, 'dispatch');
  const reduce = Object.getOwnPropertyDescriptor(proto, 'reduceEffect');
  if (typeof dispatch?.value !== 'function' ||
      typeof reduce?.value !== 'function') {
    throw new TypeError('Pinned Store dispatch/reduceEffect was not found');
  }

  const report = {
    schema: 'live-root-attachment-source-origin-v1',
    totalLiveEnergyAttachEffects: 0,
    events: [],
    omitted: 0,
    onlyRoot: true,
    qualifyingCompetitiveGame: false
  };
  let root = null;
  let ordinal = 0;
  let currentAction = null;
  function observeDispatch(action) {
    if (!root && action?.constructor?.name === 'AddPlayerAction') root = this;
    if (this === root) {
      ordinal++;
      currentAction = action?.constructor?.name ?? null;
    }
    return dispatch.value.apply(this, arguments);
  }
  function observeReduce(state, effect) {
    if (this !== root || state !== this.state ||
        !(effect instanceof AttachEnergyEffect)) {
      return reduce.value.call(this, state, effect);
    }
    report.totalLiveEnergyAttachEffects++;
    const card = effect.energyCard;
    const owner = effect.player;
    const before = primaryLocations(state, card);
    const seat = state.players.indexOf(owner);
    const fromHand = !!owner.hand.cards.includes(card);
    const row = {
      ordinal, action: currentAction, turn: state.turn, seat,
      energy: card?.fullName ?? null,
      target: effect.target?.getPokemonCard?.()?.fullName ?? null,
      fromHand, sourcePrimaryLocations: before,
      sourceAmbiguous: before.length !== 1
    };
    try {
      const result = reduce.value.call(this, state, effect);
      row.targetHasPhysicalCard = effect.target?.cards.includes(card) ?? false;
      row.targetHasAttachedEnergy = effect.target?.energies?.cards.includes(card) ?? false;
      row.afterPrimaryLocations = primaryLocations(state, card);
      row.sourceRetained = before.some(location =>
        row.afterPrimaryLocations.includes(location));
      if (report.events.length < 512) report.events.push(row);
      else report.omitted++;
      return result;
    } catch (error) {
      row.error = String(error?.message ?? error);
      row.afterPrimaryLocations = primaryLocations(state, card);
      if (report.events.length < 512) report.events.push(row);
      else report.omitted++;
      throw error;
    }
  }
  Object.defineProperty(proto, 'dispatch', {...dispatch, value:observeDispatch});
  Object.defineProperty(proto, 'reduceEffect', {...reduce, value:observeReduce});
  try {
    const result = work();
    return {result, report};
  } finally {
    Object.defineProperty(proto, 'reduceEffect', reduce);
    Object.defineProperty(proto, 'dispatch', dispatch);
  }
}

module.exports = {primaryLocations, withAttachmentOriginObserver};
