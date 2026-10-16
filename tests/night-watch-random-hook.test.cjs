'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { randomSubset, installNightWatchRandomHook } =
  require('../simulation/twinleaf/night-watch-random-hook.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const load = modulePath => require(path.join(root, modulePath));

const { initializeCards } = require('../simulation/twinleaf/headless.cjs');
const { Store } = load('game/store/store');
const { Player } = load('game/store/state/player');
const { GamePhase } = load('game/store/state/state');
const { AttackEffect } = load('game/store/effects/game-effects');
const { ChooseCardsPrompt } = load('game/store/prompts/choose-cards-prompt');
const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
const { GameMessage } = load('game/game-message');

/** @returns {object} Staged reducer board, without attack-cost or turn legality assertions. */
function board() {
  const manager = initializeCards();
  const trevenant = manager.getCardByName('Trevenant & Dusknoir-GX SMP');
  const defender = manager.getCardByName('Shadow Rider Calyrex V CRE');
  const hand = ['Ace Trainer AOR', 'VS Seeker PHF', 'Ultra Ball SUM'].map(name =>
    manager.getCardByName(name));
  assert.ok(trevenant && defender && hand.every(Boolean), 'Pinned printing unavailable');

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const attacker = new Player();
  attacker.id = 101;
  attacker.name = 'night-watch-attacker';
  const victim = new Player();
  victim.id = 202;
  victim.name = 'hand-lock-target';
  state.players = [attacker, victim];
  state.activePlayer = 0;
  state.phase = GamePhase.ATTACK;
  state.turn = 4;
  attacker.active.cards.push(trevenant);
  victim.active.cards.push(defender);
  victim.hand.cards.push(...hand);
  return {store,state,attacker,victim,trevenant,hand};
}

/** @param {object} fixture @returns {any} */
function announceNightWatch(fixture) {
  const {store,state,attacker,victim,trevenant} = fixture;
  trevenant.reduceEffect(store,state,new AttackEffect(
    attacker,victim,trevenant.attacks[0]));
  const prompts = state.prompts.filter(p => p instanceof ChooseCardsPrompt);
  assert.equal(prompts.length,1,'Night Watch must emit one hand-selection prompt');
  return prompts[0];
}

test('uniform random-subset samples only physical card objects without mutation', () => {
  const cards = ['A','B','C'];
  assert.deepEqual(randomSubset(cards,2,()=>0), ['A','B']);
  const rngAC = [0,0.99][Symbol.iterator]();
  assert.deepEqual(randomSubset(cards,2,()=>rngAC.next().value),['A','C']);
  const rngBC = [0.5,0.99][Symbol.iterator]();
  assert.deepEqual(randomSubset(cards,2,()=>rngBC.next().value),['B','C']);
  assert.deepEqual(cards,['A','B','C'],'Source hand order unchanged');
  assert.throws(()=>randomSubset(cards,4),/Invalid Night Watch/);
});

test('unpatched Night Watch presents all three hidden opponent cards', () => {
  const f = board();
  const prompt = announceNightWatch(f);
  assert.equal(prompt.playerId,f.attacker.id);
  assert.strictEqual(prompt.cards,f.victim.hand);
  assert.equal(prompt.options.min,2);
  assert.equal(prompt.options.max,2);
  assert.equal(prompt.options.isSecret,true);
  assert.deepEqual(prompt.cards.cards,f.hand);
  assert.equal(prompt.validate([f.hand[0],f.hand[2]]),true,
    'Pinned prompt permits choosing a specific, non-random pair');
});

test('research hook restricts only Night Watch selection, then restores', () => {
  const originalRandom = Math.random;
  const restore = installNightWatchRandomHook();
  try {
    const pair = [0,0.99][Symbol.iterator]();
    Math.random = ()=>pair.next().value;
    const f = board();
    const prompt = announceNightWatch(f);
    assert.notStrictEqual(prompt.cards,f.victim.hand);
    assert.deepEqual(prompt.cards.cards,[f.hand[0],f.hand[2]]);
    assert.equal(f.victim.hand.cards.length,3,
      'Displaying the sample must not prematurely remove cards');
    assert.equal(prompt.validate([f.hand[0],f.hand[2]]),true);
    assert.equal(prompt.validate([f.hand[0],f.hand[1]]),false,
      'Attacker cannot substitute a strategically preferred third card');

    storeResolve(f.store,prompt);
    assert.deepEqual(f.victim.hand.cards,[f.hand[1]]);
    assert.ok(f.victim.deck.cards.includes(f.hand[0]));
    assert.ok(f.victim.deck.cards.includes(f.hand[2]));
  } finally {
    Math.random = originalRandom;
    restore();
  }
  const unchanged = board();
  assert.equal(announceNightWatch(unchanged).cards.cards.length,3,
    'The original card reducer and Store.prompt must be restored');
});

/** @param {any} store @param {any} prompt */
function storeResolve(store,prompt) {
  store.dispatch(new ResolvePromptAction(prompt.id,prompt.cards.cards.slice()));
}

test('unrelated secret opponent-hand prompts preserve normal selection', () => {
  const restore = installNightWatchRandomHook();
  try {
    const f = board();
    const prompt = new ChooseCardsPrompt(
      f.attacker,GameMessage.CHOOSE_CARD_TO_DISCARD,
      f.victim.hand,{}, {allowCancel:false,min:2,max:2,isSecret:true}
    );
    f.store.prompt(f.state,prompt,()=>{});
    assert.strictEqual(prompt.cards,f.victim.hand);
    assert.equal(prompt.cards.cards.length,3);
  } finally {
    restore();
  }
});

test('Night Watch copied through delegated source reducer uses random physical subset', () => {
  const { runDelegatedCopiedAttack, clearCopyAttackSessionsForTests } =
    load('game/store/prefabs/copy-attack-delegation');
  const f = board();
  const manager = initializeCards();
  const mewtwo = manager.getCardByName('Mewtwo & Mew-GX UNM');
  assert.ok(mewtwo);
  f.attacker.active.cards = [mewtwo];
  f.attacker.discard.cards.push(f.trevenant);
  const restore = installNightWatchRandomHook();
  const originalRandom = Math.random;
  try {
    Math.random = () => 0;
    runDelegatedCopiedAttack({
      store:f.store, state:f.state, player:f.attacker, opponent:f.victim,
      copycatCard:mewtwo, sourceCard:f.trevenant,
      selectedAttack:f.trevenant.attacks[0],
      sourceSlot:f.attacker.active, skipLog:true
    });
    const prompts = f.state.prompts.filter(p => p instanceof ChooseCardsPrompt);
    assert.equal(prompts.length,1,
      'Copy attack must dispatch a Night Watch hand selection');
    assert.equal(prompts[0].cards.cards.length,2,
      'Delegated Night Watch must use the same random sampling guard');
    assert.equal(prompts[0].playerId, f.attacker.id);
    assert.deepEqual(prompts[0].cards.cards,[f.hand[0],f.hand[1]]);
  } finally {
    Math.random = originalRandom;
    restore();
    clearCopyAttackSessionsForTests();
  }
});
