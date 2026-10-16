'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const load = name => require(path.join(root, name));
const { Store } = load('game/store/store');
const { Player } = load('game/store/state/player');
const { PokemonCardList } = load('game/store/state/pokemon-card-list');
const { GamePhase } = load('game/store/state/state');
const { PowerEffect } = load('game/store/effects/game-effects');
const { ChoosePokemonPrompt } = load('game/store/prompts/choose-pokemon-prompt');
const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');

/** @param {boolean} withHood @returns {object} Source-printing staged effect board. */
function stage(withHood) {
  const manager = initializeCards();
  /** @param {string} name */
  const get = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Pinned Twinleaf lacks card ' + name);
    return card;
  };
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const player = new Player();
  player.id = 101;
  player.name = 'self-ko-pilot';
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'protected-target';
  state.players = [player, opponent];
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;

  const dusclops = get('Dusclops SFA');
  const holder = new PokemonCardList();
  holder.cards.push(get('Duskull SFA'), dusclops);
  player.bench.push(holder);
  opponent.active.cards.push(get('Shadow Rider Calyrex V CRE'));
  if (withHood) opponent.active.tools.push(get('Stealthy Hood UNB'));
  return {store, state, player, opponent, holder, dusclops};
}

/** @param {object} f @returns {object} */
function useCursedBlast(f) {
  const {store, state, player, opponent, dusclops} = f;
  dusclops.reduceEffect(store,state,new PowerEffect(player,dusclops.powers[0],dusclops));
  const prompts = state.prompts.filter(p => p instanceof ChoosePokemonPrompt);
  assert.equal(prompts.length,1,'Cursed Blast should choose exactly one target');
  store.dispatch(new ResolvePromptAction(prompts[0].id,[opponent.active]));
  return { targetDamage:opponent.active.damage, userDamage:f.holder.damage,
    dusclopsOnBench:player.bench.some(slot=>slot.getPokemonCard()===dusclops),
    dusclopsInDiscard:player.discard.cards.includes(dusclops),
    benchRemaining:player.bench.map(slot=>slot.cards.map(c=>c.fullName)),
    playerDiscard:player.discard.cards.map(c=>c.fullName),
    opponentPrizeRemaining:opponent.getPrizeLeft(),
    prompts:state.prompts.map(p=>p.constructor.name) };
}

test('unprotected Cursed Blast places five counters and self-KOs', () => {
  const out=useCursedBlast(stage(false));
  assert.equal(out.targetDamage,50);
  console.log('Unprotected Cursed Blast terminal board:', JSON.stringify(out));
  assert.equal(out.dusclopsOnBench,false,'Self-KO must remove Dusclops from the Bench');
});

test('characterize pinned Cursed Blast self-KO even if Stealthy Hood prevents counters', () => {
  const out=useCursedBlast(stage(true));
  assert.equal(out.targetDamage,0,'Hood must prevent opponent Ability damage counters');
  console.log('Hood-prevented Cursed Blast terminal board:', JSON.stringify(out));
  assert.equal(out.dusclopsOnBench,false,
    'UNPATCHED PINNED DEFECT: Cursed Blast self-KOs even with no counters');
});
