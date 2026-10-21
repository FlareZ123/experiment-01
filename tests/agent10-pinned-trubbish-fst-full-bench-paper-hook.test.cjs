'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const path = require('node:path');
const root = path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {Trubbish} = require(path.join(root,
  'sets/09-sword-and-shield/set-fusion-strike/trubbish'));
const {Player} = require(path.join(root,'game/store/state/player'));
const {PokemonCardList} = require(path.join(root,'game/store/state/pokemon-card-list'));
const {AttackEffect} = require(path.join(root,'game/store/effects/game-effects'));
const {withTrubbishFullBenchPaperHook} = require(
  '../simulation/twinleaf/agent10-trubbish-fst-full-bench-paper-hook.cjs');

test('pinned native FST 168 full-Bench Call for Family skips search', () => {
  const trubbish = new Trubbish();
  assert.equal(trubbish.fullName,'Trubbish FST');
  assert.equal(trubbish.setNumber,'168');
  assert.equal(trubbish.attacks[0].name,'Call for Family');
  assert.equal(trubbish.attacks[0].damage,0);

  const owner = new Player();
  const opponent = new Player();
  owner.bench = Array.from({length:5}, () => new PokemonCardList());
  for (const slot of owner.bench) slot.cards.push(new Trubbish());
  owner.deck.cards.push(new Trubbish());
  const effect = new AttackEffect(owner, opponent, trubbish.attacks[0]);
  const state = {source:'native-attack-effect'};
  let nativePrompts = 0;
  const store = {prompt() { nativePrompts++; throw new Error('should not search'); }};
  const original = Trubbish.prototype.reduceEffect;

  // The pinned engine's prefabricated search throws when Bench slots are full.
  assert.throws(() => trubbish.reduceEffect(store,state,effect));

  const executed = withTrubbishFullBenchPaperHook(() =>
    trubbish.reduceEffect(store,state,effect));
  assert.strictEqual(executed.result,state);
  assert.equal(executed.audit.skippedFullBenchSearches,1);
  assert.equal(nativePrompts,0);
  assert.strictEqual(Trubbish.prototype.reduceEffect,original);
});
