'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {severClonePrototypeAliases} =
  require('../simulation/twinleaf/prototype-safe-simulator-hook.cjs');

/** @param {any} source @param {Map<object,object>} [seen] */
function reproducePinnedCloneSemantics(source, seen = new Map()) {
  if (source === null || typeof source !== 'object') return source;
  if (seen.has(source)) return seen.get(source);
  if (Array.isArray(source)) {
    const clone = [];
    seen.set(source, clone);
    for (const value of source) clone.push(reproducePinnedCloneSemantics(value, seen));
    return clone;
  }
  const clone = Object.create(source);
  seen.set(source, clone);
  for (const key of Object.keys(source)) {
    clone[key] = reproducePinnedCloneSemantics(source[key], seen);
  }
  return clone;
}

class SampleCard {
  constructor() {
    this.damageTakenLastTurn = 0;
  }
  /** @returns {number} */
  attack() {
    return 20 + this.damageTakenLastTurn;
  }
}

test('reparented Card retains class behavior but does not inherit source changes', () => {
  const card = new SampleCard();
  const source = {active: {cards: [card]}, aliases: [card]};
  const clone = reproducePinnedCloneSemantics(source);
  assert.strictEqual(Object.getPrototypeOf(clone.active.cards[0]), card);
  const severed = severClonePrototypeAliases(source, clone);
  assert.ok(severed >= 3);
  const clonedCard = clone.active.cards[0];
  assert.notStrictEqual(clonedCard, card);
  assert.strictEqual(Object.getPrototypeOf(clonedCard), SampleCard.prototype);
  assert.strictEqual(clone.aliases[0], clonedCard);
  assert.ok(clonedCard instanceof SampleCard);
  assert.equal(clonedCard.attack(), 20);
  card.damageTakenLastTurn = 50;
  card.fieldAddedAfterSimulation = 'live';
  assert.equal(clonedCard.damageTakenLastTurn, 0);
  assert.equal(clonedCard.fieldAddedAfterSimulation, undefined);
  assert.equal(clonedCard.attack(), 20);
});

test('prototype severing preserves cycles and source null prototypes', () => {
  const root = Object.create(null);
  root.amount = 4;
  root.self = root;
  const clone = reproducePinnedCloneSemantics(root);
  assert.strictEqual(Object.getPrototypeOf(clone), root);
  const changes = severClonePrototypeAliases(root, clone);
  assert.equal(changes, 1);
  assert.equal(Object.getPrototypeOf(clone), null);
  assert.strictEqual(clone.self, clone);
  root.newField = 2;
  assert.equal(clone.newField, undefined);
});

test('reparenting is idempotent for fully visited clone pairs', () => {
  const src = {objects: [{x: 1}]};
  const clone = reproducePinnedCloneSemantics(src);
  const first = severClonePrototypeAliases(src, clone);
  const second = severClonePrototypeAliases(src, clone);
  assert.ok(first > 0);
  assert.equal(second, 0);
});

test('clone state audit distinguishes repeated arrays from preserved aliases',()=>{
  const {compareOwnedStateGraph}=
    require('../simulation/twinleaf/prototype-safe-state-graph-audit.cjs');
  const shared=[{damage:0}];
  const source={left:shared,right:shared};
  const broken={left:[{damage:0}],right:[{damage:0}]};
  const mismatch=compareOwnedStateGraph(source,broken);
  assert.equal(mismatch.repeatedArrayBreaks.count,1);
  assert.equal(mismatch.repeatedObjectBreaks.count,0);
  assert.equal(mismatch.sharedReferences.count,0);
  const detachedCard={damage:0};
  const detachedArray=[detachedCard];
  const preserved={left:detachedArray,right:detachedArray};
  const good=compareOwnedStateGraph(source,preserved);
  assert.equal(good.repeatedArrayBreaks.count,0);
  assert.equal(good.sharedReferences.count,0);
});

test('clone state audit reports a source-instance prototype and shared objects',()=>{
  const {compareOwnedStateGraph}=
    require('../simulation/twinleaf/prototype-safe-state-graph-audit.cjs');
  const source={child:{hp:100}};
  const clone={child:Object.create(source.child)};
  clone.child.hp=100;
  const result=compareOwnedStateGraph(source,clone);
  assert.equal(result.sourcePrototypeAliases.count,1);
  const direct=compareOwnedStateGraph(source,{child:source.child});
  assert.equal(direct.sharedReferences.count,1);
});

test('Store graph audit catches divergent primitive values and Array lengths',()=>{
  const {compareOwnedStateGraph} =
    require('../simulation/twinleaf/prototype-safe-state-graph-audit.cjs');
  const source={scores:[{value:1}],queue:[null,null]};
  const copy={scores:[{value:2}],queue:[null]};
  const result=compareOwnedStateGraph(source,copy);
  assert.equal(result.valueMismatches.count,1);
  assert.equal(result.arrayLengthMismatches.count,1);
});

test('Store graph audit detects a changed class identity',()=>{
  const {compareOwnedStateGraph} =
    require('../simulation/twinleaf/prototype-safe-state-graph-audit.cjs');
  class Card{constructor(){this.value=1}}
  const source={active:new Card()};
  const wrong={active:{value:1}};
  const result=compareOwnedStateGraph(source,wrong);
  assert.equal(result.valueMismatches.count,0);
  assert.equal(result.classPrototypeMismatches.count,1);
  assert.deepEqual(result.classPrototypeMismatches.examples,['state.active']);
});
