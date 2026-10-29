'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {plumeriaOwnerOpportunity,visibleEnergyTargets}=
  require('../simulation/twinleaf/agent4-plumeria-opportunity.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=modulePath=>require(path.join(output,modulePath));

/**
 * A native real-Store instant with two legal Basic Actives, one original
 * Plumeria, two discardable original-source-neutral hand cards, and an
 * opposing physically attached Energy in both core board and Energy zones.
 * @param {0|1} seat
 * @returns {object}
 */
function nativePlumeriaRoot(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let nextId=74000;
  const card=printing=>{
    const instance=manager.getCardByName(printing);
    assert.ok(instance,'Unavailable pinned printing: '+printing);
    instance.id=nextId++;
    return instance;
  };
  const store=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=371;opponent.id=527;
  const state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=seat;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Bunnelby PRC'));
  opponent.active.cards.push(card('Bunnelby PRC'));
  const attached=card('Psychic Energy SVE');
  opponent.active.cards.push(attached);
  opponent.active.energies.cards.push(attached);
  owner.hand.cards.push(card('Plumeria BUS'),
    card('Psychic Energy SVE'),card('Psychic Energy SVE'));
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,attached,seat};
}

test('pinned Plumeria native canPlay distinguishes real attached Energy, quota and discard costs for both seats',()=>{
  for(const seat of [0,1]){
    const {store,state,owner,opponent}=nativePlumeriaRoot(seat);
    const initial=plumeriaOwnerOpportunity(store,state,seat);
    assert.equal(initial.heldCopies,1);
    assert.equal(initial.paperScreenedCopies,1);
    assert.equal(initial.nativePlayableCopies,1);
    assert.deepEqual(initial.opponentEnergyTargets.map(p=>p.slot),['active']);
    assert.equal(visibleEnergyTargets(opponent)[0].energies.length,1);
    owner.supporterTurn=1;
    assert.equal(plumeriaOwnerOpportunity(store,state,seat).nativePlayableCopies,0);
    owner.supporterTurn=0;
    owner.hand.cards.pop();
    assert.equal(plumeriaOwnerOpportunity(store,state,seat).nativePlayableCopies,0);
    const replacement=owner.deck.cards.pop();
    owner.hand.cards.push(replacement);
    assert.equal(plumeriaOwnerOpportunity(store,state,seat).nativePlayableCopies,1);
    opponent.active.energies.cards=[];
    opponent.active.cards=opponent.active.cards.filter(
      c=>c.superType!==native('game/store/card/card-types').SuperType.ENERGY);
    assert.equal(plumeriaOwnerOpportunity(store,state,seat).nativePlayableCopies,0);
  }
});

test('genuine pinned Store Plumeria resolves physical two-hand discard and one opponent Energy discard',()=>{
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  for(const seat of [0,1]){
    const {store,state,owner,opponent}=nativePlumeriaRoot(seat);
    const before=plumeriaOwnerOpportunity(store,state,seat);
    assert.equal(before.nativePlayableCopies,1);
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const pending=()=>state.prompts.find(p=>p.result===undefined);
    const first=pending();
    assert.equal(first?.constructor?.name,'ChooseCardsPrompt');
    const two=owner.hand.cards.slice(0,2);
    assert.equal(first.validate(two),true);
    store.dispatch(new ResolvePromptAction(first.id,two));
    const second=pending();
    assert.equal(second?.constructor?.name,'ChoosePokemonPrompt');
    assert.equal(second.validate([opponent.active],state),true);
    store.dispatch(new ResolvePromptAction(second.id,[opponent.active]));
    const third=pending();
    assert.equal(third?.constructor?.name,'ChooseCardsPrompt');
    assert.equal(third.validate([opponent.active.energies.cards[0]]),true);
    const energy=opponent.active.energies.cards[0];
    store.dispatch(new ResolvePromptAction(third.id,[energy]));
    assert.equal(opponent.active.energies.cards.includes(energy),false);
    assert.equal(opponent.discard.cards.includes(energy),true);
    assert.ok(two.every(c=>owner.discard.cards.includes(c)));
    assert.equal(state.prompts.some(p=>p.result===undefined),false);
  }
});

// The after-Pass research fork currently requires an explicit manual opt-in.
// Its normal actor-first composition does not expose the baseline Pass to
// the external wrapper; do not obstruct unrelated pinned native regressions.
if(process.env.AGENT4_PLUMERIA_AFTERPASS_NATIVE_DEV==='true')
  require('./agent4-plumeria-native-intervention.test.cjs');
