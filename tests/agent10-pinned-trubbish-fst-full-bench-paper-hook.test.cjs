'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const path = require('node:path');
const root = path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {Trubbish} = require(path.join(root,
  'sets/09-sword-and-shield/set-fusion-strike/trubbish'));
const {Pidgey} = require(path.join(root,
  'sets/10-scarlet-and-violet/set-pokemon-151/pidgey'));
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
  assert.throws(() => trubbish.reduceEffect(store,state,effect),
    error => error.message === 'NO_BENCH_SLOTS_AVAILABLE');

  const executed = withTrubbishFullBenchPaperHook(() =>
    trubbish.reduceEffect(store,state,effect));
  assert.strictEqual(executed.result,state);
  assert.equal(executed.audit.skippedFullBenchSearches,1);
  assert.equal(nativePrompts,0);
  assert.strictEqual(Trubbish.prototype.reduceEffect,original);
});

test('pinned native MEW Pidgey Call for Family already obeys full-Bench C-11', () => {
  const pidgey = new Pidgey();
  assert.equal(pidgey.fullName,'Pidgey MEW');
  assert.equal(pidgey.setNumber,'16');
  assert.equal(pidgey.attacks[0].damage,0);

  const owner = new Player();
  const opponent = new Player();
  owner.bench = Array.from({length:5}, () => new PokemonCardList());
  for (const slot of owner.bench) slot.cards.push(new Pidgey());
  owner.deck.cards.push(new Pidgey());
  const effect = new AttackEffect(owner, opponent, pidgey.attacks[0]);
  const state = {source:'pinned-full-bench-control'};
  let prompted = false;
  const store = {prompt() { prompted = true; throw new Error('unexpected prompt'); }};
  assert.strictEqual(pidgey.reduceEffect(store,state,effect),state);
  assert.equal(prompted,false);
});
