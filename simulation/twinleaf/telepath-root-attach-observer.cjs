'use strict';

/**
 * Watch one live Store instance while it processes an actual root action.
 * The pinned bot can create separate speculative Stores. This observer is
 * installed on the live instance only and records no card-face information.
 *
 * The reported source is the card's canonical location immediately before
 * AttachEnergyEffect reduction. Earlier moves within the same root action
 * may already have changed that location.
 *
 * @param {{reduceEffect: Function}} store Actual game Store instance.
 * @param {Function} AttachEnergyEffect Pinned compiled effect constructor.
 * @param {string} fullName Full name of the Energy being audited.
 * @returns {{events: object[], enter: Function, leave: Function, restore: Function}}
 */
function installRootTelepathAttachObserver(store, AttachEnergyEffect,
  fullName = 'Telepath [P] Energy M3') {
  const oldDescriptor = Object.getOwnPropertyDescriptor(store, 'reduceEffect');
  const oldReduce = store.reduceEffect;
  if (typeof oldReduce !== 'function') throw new TypeError('Store.reduceEffect required');
  const events = [];
  let root = null;

  /**
   * @param {object} state Source Store State.
   * @param {object} card One physical Energy object.
   * @returns {string[]} Canonical locations by exact object reference.
   */
  function locations(state, card) {
    const found = [];
    for (const [seat, player] of state.players.entries()) {
      const prefix = 'seat' + seat;
      for (const zone of ['deck', 'hand', 'discard', 'lostzone', 'stadium', 'supporter']) {
        if (player[zone].cards.includes(card)) found.push(prefix + '.' + zone);
      }
      if (player.active.cards.includes(card)) found.push(prefix + '.active');
      for (const [index, slot] of player.bench.entries()) {
        if (slot.cards.includes(card)) found.push(prefix + '.bench[' + index + ']');
      }
      for (const [index, prize] of player.prizes.entries()) {
        if (prize.cards.includes(card)) found.push(prefix + '.prizes[' + index + ']');
      }
    }
    return found;
  }

  store.reduceEffect = function observedReduceEffect(state, effect) {
    if (root && effect instanceof AttachEnergyEffect &&
        effect.energyCard?.fullName === fullName) {
      events.push({
        actionOrdinal: root.actionOrdinal,
        turn: root.turn,
        actionType: root.actionType,
        playerSeat: state.players.indexOf(effect.player),
        sourceZonesAtReducerEntry: locations(state, effect.energyCard)
      });
    }
    return oldReduce.call(this, state, effect);
  };
  return {
    events,
    enter(context) { root = context; },
    leave() { root = null; },
    restore() {
      if (oldDescriptor) Object.defineProperty(store, 'reduceEffect', oldDescriptor);
      else delete store.reduceEffect;
    }
  };
}

module.exports = {installRootTelepathAttachObserver};
