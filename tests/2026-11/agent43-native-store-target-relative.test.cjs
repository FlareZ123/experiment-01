'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');

const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));
const {StateUtils}=native('game/store/state-utils');
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {UseAbilityAction}=native('game/store/actions/game-actions');
const {actorObservation}=require('../../simulation/twinleaf/actor-observation-contract.cjs');

function makeNativeStore(){
  const store=new Store({onStateChange(){}});
  const players=[new Player(),new Player()];
  players[0].id=101;
  players[1].id=202;
  for(const player of players){
    player.bench=[new PokemonCardList(),new PokemonCardList()];
  }
  players[0].hand.cards.push({fullName:'seat-0-private-printing'});
  players[1].hand.cards.push({fullName:'seat-1-private-printing'});
  store.state.players=players;
  store.state.phase=GamePhase.PLAYER_TURN;
  return {store,players};
}

test('pinned StateUtils resolves relative targets against either actual acting Player in a native Store',()=>{
  const {store,players}=makeNativeStore();
  for(const [seat,actor] of players.entries()){
    const opponent=players[1-seat];
    assert.strictEqual(StateUtils.getTarget(store.state,actor,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }),actor.active);
    assert.strictEqual(StateUtils.getTarget(store.state,actor,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }),actor.bench[0]);
    assert.strictEqual(StateUtils.getTarget(store.state,actor,{
      player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0
    }),opponent.active);
    assert.strictEqual(StateUtils.getTarget(store.state,actor,{
      player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0
    }),opponent.bench[0]);
  }
});

test('native PlayCardAction and UseAbilityAction BOTTOM targets resolve to the acting owner from both seats',()=>{
  const {store,players}=makeNativeStore();
  for(const actor of players){
    const target={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1};
    const play=new PlayCardAction(actor.id,0,target);
    const ability=new UseAbilityAction(actor.id,'Underworld Door',target);
    assert.strictEqual(StateUtils.getTarget(store.state,actor,play.target),
      actor.bench[1]);
    assert.strictEqual(StateUtils.getTarget(store.state,actor,ability.target),
      actor.bench[1]);
  }
});

test('the shared actorObservation contract exposes each native owner hand only to that seat',()=>{
  const {store,players}=makeNativeStore();
  for(const [seat,actor] of players.entries()){
    store.state.activePlayer=seat;
    const view=actorObservation(store.state,seat);
    const own='seat-'+seat+'-private-printing';
    const opponent='seat-'+(1-seat)+'-private-printing';
    assert.equal(view.actorSeat,seat);
    assert.deepEqual(view.ownHand,[own]);
    assert.equal(view.opponentPublic.handCount,1);
    assert.equal(JSON.stringify(view.opponentPublic).includes(opponent),false);
    assert.equal(Object.isFrozen(view),true);
  }
});
