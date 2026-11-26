'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../../simulation/twinleaf/actor-observation-contract.cjs');

const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

function fixture(actorSeat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {STAMP_STARTING_ABILITY_LOCKS}=
    native('game/store/prefabs/ability-lock');

  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,'Pinned card printing must be loaded: '+name);
    return result;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=93021;
  opponent.id=93022;
  for(const player of [owner,opponent]){
    player.bench=Array.from({length:5},()=>new PokemonCardList());
    player.active.cards.push(card('Klefki SVI'));
  }
  owner.bench[0].cards.push(card('Klefki SVI'));

  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=actorSeat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=actorSeat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.abilityLockOrderCounter=0;
  state.prompts=[];

  STAMP_STARTING_ABILITY_LOCKS(state);
  const startingOrder=owner.active.abilityLockActivationOrder;
  assert.ok(Number.isSafeInteger(startingOrder)&&startingOrder>0);
  assert.equal(opponent.active.abilityLockActivationOrder,startingOrder,
    'both starting Active lockers must share the simultaneous activation order');

  const entering=owner.bench[0].getPokemonCard();
  assert.equal(entering.fullName,'Klefki SVI');
  assert.equal(entering.abilityLockActivationOrder,undefined,
    'the activation order belongs to the PokémonCardList, not the card');
  owner.switchPokemon(owner.bench[0],store,state);

  return {state,owner,opponent,actorSeat,startingOrder,entering};
}

for(const actorSeat of [0,1]){
  test('native Bench-to-Active Ability-lock order is projected from the slot, physical seat '+actorSeat,()=>{
    const f=fixture(actorSeat);
    assert.strictEqual(f.owner.active.getPokemonCard(),f.entering);
    assert.ok(f.owner.active.abilityLockActivationOrder>f.startingOrder,
      'MovedToActiveEffect must stamp the promoted locker after the starting Actives');
    assert.equal(f.owner.bench[0].abilityLockActivationOrder,0,
      'MovedFromActiveToBenchEffect must clear the outgoing lock source');
    assert.equal(f.owner.active.getPokemonCard().abilityLockActivationOrder,undefined);
    const view=actorObservation(f.state,actorSeat);
    assert.equal(view.actorSeat,actorSeat);
    assert.equal(view.turnSeat,actorSeat);
    assert.equal(view.ownPublic.active.abilityLockActivationOrder,
      f.owner.active.abilityLockActivationOrder);
    assert.equal(view.ownPublic.bench[0].abilityLockActivationOrder,null,
      'the actor contract normalizes the native zero no-lock sentinel to null');
    assert.equal(view.opponentPublic.active.abilityLockActivationOrder,
      f.startingOrder);
  });
}
