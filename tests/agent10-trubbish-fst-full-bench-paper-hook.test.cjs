'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {withTrubbishFullBenchPaperHook} =
  require('../simulation/twinleaf/agent10-trubbish-fst-full-bench-paper-hook.cjs');

class AttackEffect {
  constructor(player, attack) {
    this.player = player;
    this.attack = attack;
  }
}
class Trubbish {
  constructor() {
    this.attacks = [{name:'Call for Family'}, {name:'Super Poison Breath'}];
    this.calls = 0;
  }
  reduceEffect(store, state, effect) {
    this.calls++;
    return {delegated:true, state, effect};
  }
}
const slots = occupied => Array.from({length:5}, (_,i) =>
  ({cards:i<occupied?[{}]:[]}));
const apply = (card, occupied, attackIndex=0) =>
  card.reduceEffect({}, {id:'state'}, new AttackEffect(
    {bench:slots(occupied)}, card.attacks[attackIndex]));
const deps = {Trubbish, AttackEffect};

test('full Bench: skip only FST Call for Family search', () => {
  const card = new Trubbish();
  const original = Trubbish.prototype.reduceEffect;
  const {result,audit} = withTrubbishFullBenchPaperHook(
    () => apply(card,5), deps);
  assert.deepEqual(result,{id:'state'});
  assert.equal(card.calls,0);
  assert.equal(audit.skippedFullBenchSearches,1);
  assert.equal(audit.delegatedReducerCalls,0);
  assert.equal(audit.competitiveQualified,false);
  assert.strictEqual(Trubbish.prototype.reduceEffect,original);
});

test('open Bench delegates original printed search', () => {
  const card = new Trubbish();
  const {result,audit} = withTrubbishFullBenchPaperHook(
    () => apply(card,4),deps);
  assert.equal(result.delegated,true);
  assert.equal(card.calls,1);
  assert.equal(audit.skippedFullBenchSearches,0);
  assert.equal(audit.delegatedReducerCalls,1);
});

test('second attack and unrelated effect delegate on full Bench', () => {
  const card = new Trubbish();
  const {audit} = withTrubbishFullBenchPaperHook(() => {
    assert.equal(apply(card,5,1).delegated,true);
    assert.equal(card.reduceEffect({}, {}, {
      player:{bench:slots(5)}, attack:card.attacks[0]
    }).delegated,true);
  },deps);
  assert.equal(card.calls,2);
  assert.equal(audit.skippedFullBenchSearches,0);
  assert.equal(audit.delegatedReducerCalls,2);
});

test('unexpected engine exception still restores original prototype', () => {
  const before = Trubbish.prototype.reduceEffect;
  assert.throws(() => withTrubbishFullBenchPaperHook(() => {
    throw new Error('native failure');
  },deps),/native failure/);
  assert.strictEqual(Trubbish.prototype.reduceEffect,before);
});
