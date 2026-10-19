'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {chooseGarbotoxinTargets}=
  require('../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');
const {assertValidPromptAction}=
  require('../simulation/twinleaf/prompt-integrity.cjs');

const out=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(out,name));
const {State}=load('game/store/state/state');
const {Player}=load('game/store/state/player');
const {PokemonCardList}=load('game/store/state/pokemon-card-list');
const {PokemonCard}=load('game/store/card/pokemon-card');
const {ChoosePokemonPrompt}=load('game/store/prompts/choose-pokemon-prompt');
const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
const {GameMessage}=load('game/game-message');
const {Garbodor:GarbodorBKP}=
  load('sets/07-x-and-y/set-breakpoint/garbodor');
const {GarbodorLTR}=
  load('sets/06-black-and-white/set-legendary-treasures/other-prints');

/**
 * Actual pinned PokemonCardList spots, with the engine's printed Pokémon
 * classes and attached public Tool marker. The real prompt still decides
 * whether each proposal is a legal resolution.
 * @param {new()=>object} Card Printed source Pokémon class.
 * @returns {object}
 */
function spot(Card){
  const list=new PokemonCardList();
  list.cards.push(new Card());
  list.tools.push({fullName:'Float Stone PLF'});
  return list;
}

/** @param {number} maxTools */
function fixture(maxTools){
  const state=new State();
  const owner=new Player();owner.id=101;
  owner.active.cards.push(new PokemonCard());
  const opponent=new Player();opponent.id=202;
  opponent.active=spot(GarbodorBKP);
  opponent.bench.push(spot(GarbodorLTR));
  state.players.push(owner,opponent);
  const prompt=new ChoosePokemonPrompt(
    101,GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS,PlayerType.ANY,
    [SlotType.ACTIVE,SlotType.BENCH],
    {min:0,max:maxTools,allowCancel:false,blocked:[]});
  prompt.id=23;
  state.prompts.push(prompt);
  return {state,opponent,prompt};
}

test('two printed Garbotoxin classes yield valid Active plus Bench Tool targets',()=>{
  const {state,opponent,prompt}=fixture(2);
  const targets=chooseGarbotoxinTargets(prompt,opponent,state);
  assert.deepEqual(targets,[opponent.active,opponent.bench[0]]);
  assert.doesNotThrow(()=>assertValidPromptAction(state,
    new ResolvePromptAction(prompt.id,targets)));
});

test('actual pinned Stadium-plus-Tool size bound reduces to one legal target',()=>{
  const {state,opponent,prompt}=fixture(1);
  const targets=chooseGarbotoxinTargets(prompt,opponent,state);
  assert.deepEqual(targets,[opponent.active]);
  assert.doesNotThrow(()=>assertValidPromptAction(state,
    new ResolvePromptAction(prompt.id,targets)));
});
