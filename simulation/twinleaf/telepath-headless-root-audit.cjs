'use strict';

/** Capture Telepath attachment origins during real headless Store dispatches.
 * In pinned Twinleaf, the live Store's handler has an own onStateChange
 * method, while Simulator passes itself with a prototype method.
 * @param {{Store: Function, AttachEnergyEffect: Function}} deps
 * @returns {{events: Array<object>, restore: Function}}
 */
function installHeadlessTelepathRootAudit({Store, AttachEnergyEffect}) {
  const p = Store.prototype;
  const dispatch = Object.getOwnPropertyDescriptor(p, 'dispatch');
  const reduce = Object.getOwnPropertyDescriptor(p, 'reduceEffect');
  const context = new WeakMap(), count = new WeakMap(), events = [];
  const live = store => Object.hasOwn(store.handler || {}, 'onStateChange');
  Object.defineProperty(p, 'dispatch', {...dispatch, value: function(action, ...args) {
    if (!live(this)) return dispatch.value.call(this, action, ...args);
    const n = (count.get(this) || 0) + 1;
    count.set(this, n);
    const prev = context.get(this);
    context.set(this, {ordinal:n, action:action.constructor.name});
    try { return dispatch.value.call(this, action, ...args); }
    finally { if (prev) context.set(this, prev); else context.delete(this); }
  }});
  Object.defineProperty(p, 'reduceEffect', {...reduce, value: function(state, effect) {
    const ctx = context.get(this);
    if (ctx && live(this) && !this.calculatingPlayability &&
      effect instanceof AttachEnergyEffect &&
      effect.energyCard?.fullName === 'Telepath [P] Energy M3') {
      const card = effect.energyCard, origin = [];
      for (const [seat, player] of state.players.entries()) {
        for (const zone of ['hand','deck','discard','lostzone']) {
          if (player[zone].cards.includes(card)) origin.push('seat'+seat+'.'+zone);
        }
        if (player.active.cards.includes(card)) origin.push('seat'+seat+'.active');
        for (const [i, slot] of player.bench.entries()) {
          if (slot.cards.includes(card)) origin.push('seat'+seat+'.bench['+i+']');
        }
      }
      events.push({...ctx, turn:state.turn, playerSeat:state.players.indexOf(effect.player),
        sourceZonesAtReducerEntry:origin});
    }
    return reduce.value.call(this, state, effect);
  }});
  return {events, restore() {
    Object.defineProperty(p, 'reduceEffect', reduce);
    Object.defineProperty(p, 'dispatch', dispatch);
  }};
}
module.exports = {installHeadlessTelepathRootAudit};
