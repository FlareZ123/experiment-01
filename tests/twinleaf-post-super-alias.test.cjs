'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {makeDetachedSimulatorClass} =
  require('../simulation/twinleaf/detached-simulator-hook.cjs');
const {severClonePrototypeAliases} =
  require('../simulation/twinleaf/prototype-safe-simulator-hook.cjs');
const {normalizeDeepClonePrototypes} =
  require('../simulation/twinleaf/normalize-deep-clone.cjs');

/**
 * Reproduce the two clone stages from pinned Twinleaf's Simulator design.
 * Arrays are cloned without reference memoization and Card instances are
 * excluded only in the second stage.
 * @param {unknown} source
 * @param {Function[]} [ignored]
 * @param {{source:object,copy:object}[]} [memo]
 * @returns {any}
 */
function pinnedCloneShape(source, ignored = [], memo = []) {
  if (source === null || typeof source !== 'object') return source;
  if (Array.isArray(source)) {
    return source.map(item => pinnedCloneShape(item, ignored, memo));
  }
  if (ignored.some(type => source instanceof type)) return source;
  const old = memo.find(item => item.source === source);
  if (old) return old.copy;
  const copy = Object.create(source);
  memo.push({source, copy});
  for (const key of Object.keys(source)) {
    copy[key] = pinnedCloneShape(source[key], ignored, memo);
  }
  return copy;
}

class PrintedCard {
  constructor() {
    this.name = 'Dialga-GX';
    this.attacks = [{name:'Timeless-GX', damage:150}];
    this.damageTakenLastTurn = 0;
  }
}

class SimulatedPinnedConstructor {
  /** @param {object} state */
  constructor(state) {
    this.store = {state:pinnedCloneShape(state, [PrintedCard])};
  }
}

/** @returns {{source:object,sourceCard:PrintedCard}} */
function actualAttackHistoryShape() {
  const card = new PrintedCard();
  const attack = card.attacks[0];
  return {
    sourceCard:card,
    source:{
      players:[{discard:{cards:[card]}}],
      lastAttack:attack,
      playerLastAttack:{'101':{attack}}
    }
  };
}

test('two-stage detached Simulator clone splits existing attack/history aliases', () => {
  const {source,sourceCard} = actualAttackHistoryShape();
  const Wrapped = makeDetachedSimulatorClass(SimulatedPinnedConstructor,
    state => {
      const detached = pinnedCloneShape(state);
      severClonePrototypeAliases(state, detached);
      return detached;
    });
  const postSuper = new Wrapped(source).store.state;
  const cardAttack = postSuper.players[0].discard.cards[0].attacks[0];
  assert.notStrictEqual(postSuper.players[0].discard.cards[0], sourceCard);
  assert.notStrictEqual(cardAttack, postSuper.lastAttack);
  assert.notStrictEqual(cardAttack, postSuper.playerLastAttack['101'].attack);
  assert.strictEqual(postSuper.lastAttack,
    postSuper.playerLastAttack['101'].attack);
});

test('source-graph post-construction normalization reunites both attack aliases', () => {
  const {source,sourceCard} = actualAttackHistoryShape();
  const Wrapped = makeDetachedSimulatorClass(SimulatedPinnedConstructor,
    state => {
      const detached = pinnedCloneShape(state);
      severClonePrototypeAliases(state, detached);
      return detached;
    });
  const copy = new Wrapped(source).store.state;
  normalizeDeepClonePrototypes(source, copy);
  const detachedCard = copy.players[0].discard.cards[0];
  const copiedAttack = detachedCard.attacks[0];
  assert.notStrictEqual(detachedCard, sourceCard);
  assert.notStrictEqual(copiedAttack, sourceCard.attacks[0]);
  assert.strictEqual(copiedAttack, copy.lastAttack);
  assert.strictEqual(copiedAttack, copy.playerLastAttack['101'].attack);
  detachedCard.damageTakenLastTurn = 70;
  copiedAttack.damage = 230;
  assert.equal(sourceCard.damageTakenLastTurn, 0);
  assert.equal(sourceCard.attacks[0].damage, 150);
});
