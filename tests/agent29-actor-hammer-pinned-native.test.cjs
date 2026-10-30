'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {chooseHammerPromptCards}=
  require('../simulation/twinleaf/agent29-actor-hammer-after-pass.cjs');

const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(base,p));

/**
 * Authenticated original Store with a real original-source Special Energy
 * mirrored in the native PokemonCardList's physical and energy arrays.
 * @param {0|1} seat Actual player holding an Enhanced Hammer.
 * @param {string} hammer Printing to place in owner's hand.
 * @returns {object}
 */
function staged(seat,hammer) {
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const stateStore=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=2920;opponent.id=2921;
  const state=stateStore.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=seat;
  state.gameSettings.format=Format.EXPANDED;
  let id=82000;
  const card=p=>{
    const c=manager.getCardByName(p);
    assert.ok(c,'Missing pinned native printing '+p);
    c.id=id++;
    return c;
  };
  owner.active.cards.push(card('Bunnelby PRC'));
  opponent.active.cards.push(card('Bunnelby PRC'));
  const energy=card('Double Colorless Energy SUM');
  opponent.active.cards.push(energy);
  opponent.active.energies.cards.push(energy);
  owner.hand.cards.push(card(hammer));
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<9;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store:stateStore,state,owner,opponent,energy,manager,seat};
}

/**
 * Use pinned Item root and actual prompts. Coin flips are fixed only in
 * deliberately staged native tests and not in the proposed game policy.
 * @param {object} fixture
 * @param {'enhanced'|'crushing'} family
 * @param {boolean} [heads]
 */
function resolveHammer(fixture,family,heads=true) {
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {EnergyType,SuperType}=native('game/store/card/card-types');
  const {store,state,owner,manager,seat}=fixture;
  const special=new Set(manager.getAllCards().filter(c=>
    c.superType===SuperType.ENERGY&&c.energyType===EnergyType.SPECIAL)
    .map(c=>c.fullName));
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const hammer=owner.hand.cards[0];
  assert.equal(hammer.canPlay(store,state,owner),true);
  // The pinned Store samples the coin itself inside the Item root action,
  // then exposes only a WaitPrompt animation. Controlled RNG is test-only.
  const originalRandom=Math.random;
  if(family==='crushing')Math.random=()=>heads?0.1:0.9;
  try{
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }finally{
    Math.random=originalRandom;
  }
  if(family==='crushing'){
    const animation=pending();
    assert.equal(animation?.constructor?.name,'WaitPrompt');
    assert.equal(animation.message,'Coin flip animation');
    assert.equal(animation.validate(null,state),true);
    store.dispatch(new ResolvePromptAction(animation.id,null));
    if(!heads){
      assert.equal(pending(),undefined);
      return;
    }
  }
  const targetPrompt=pending();
  assert.equal(targetPrompt?.constructor?.name,'ChoosePokemonPrompt');
  const target=chooseHammerPromptCards(state,seat,targetPrompt,family,special);
  assert.equal(target?.length,1);
  assert.equal(target[0],fixture.opponent.active);
  assert.equal(targetPrompt.validate(target,state),true);
  store.dispatch(new ResolvePromptAction(targetPrompt.id,target));
  const energyPrompt=pending();
  assert.equal(energyPrompt?.constructor?.name,'ChooseCardsPrompt');
  const energy=chooseHammerPromptCards(state,seat,energyPrompt,family,special);
  assert.deepEqual(energy,[fixture.energy]);
  assert.equal(energyPrompt.validate(energy,state),true);
  store.dispatch(new ResolvePromptAction(energyPrompt.id,energy));
  assert.equal(pending(),undefined);
}

test('pinned Enhanced Hammer TWM native original Store removes Special Energy for either physical seat',()=>{
  for(const seat of [0,1]){
    const state=staged(seat,'Enhanced Hammer TWM');
    resolveHammer(state,'enhanced');
    assert.equal(state.opponent.active.energies.cards.includes(state.energy),false);
    assert.equal(state.opponent.active.cards.includes(state.energy),false);
    assert.equal(state.opponent.discard.cards.includes(state.energy),true);
  }
});
test('pinned Crushing Hammer native tails preserves and heads discards attached Energy',()=>{
  for(const heads of [false,true]){
    const state=staged(0,'Crushing Hammer SVI');
    resolveHammer(state,'crushing',heads);
    assert.equal(state.opponent.active.energies.cards.includes(state.energy),!heads);
    assert.equal(state.opponent.discard.cards.includes(state.energy),heads);
  }
});
