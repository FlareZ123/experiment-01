'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(BASE,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {Card}=native('game/store/card/card');
const {CardList}=native('game/store/state/card-list');
const {GamePhase}=native('game/store/state/state');
const {UseStadiumAction}=native('game/store/actions/game-actions');

function stage(seat){
  const manager=initializeCards(),getCard=id=>{
    const card=manager.getCardByName(id);
    assert.ok(card,'Pinned printed card unavailable: '+id);
    return card;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state,players=[new Player(),new Player()];
  players[0].id=101;players[1].id=202;
  for(const player of players){
    player.active.cards.push(getCard('Dratini OBF'));
    player.deck.cards.push(...Array.from({length:12},()=>new Card()));
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(new Card());
      return prize;
    });
  }
  const beach=getCard('Tropical Beach BWP');
  const owner=players[seat],opponent=players[1-seat];
  owner.stadium.cards.push(beach);
  owner.hand.cards.push(new Card(),new Card(),new Card());
  state.players=players;state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;state.turn=5;
  store.state=state;
  return {store,state,owner,opponent,beach};
}

for(const seat of [0,1]){
  test('pinned native Beach action settles draw 4 and ends turn, seat '+seat,()=>{
    const {store,owner,opponent,beach}=stage(seat);
    const beforeOpponent=opponent.hand.cards.length;
    store.dispatch(new UseStadiumAction(owner.id));
    assert.equal(owner.hand.cards.length,7);
    assert.equal(owner.deck.cards.length,8);
    assert.equal(owner.stadiumUsedTurn,5);
    assert.equal(opponent.hand.cards.length,beforeOpponent);
    assert.ok(owner.stadium.cards.includes(beach));
    assert.ok(store.state.activePlayer!==seat||
      store.state.phase!==GamePhase.PLAYER_TURN,
      'Real Stadium action must end the owner turn');
  });
}

test('native Store rejects repeated Beach use in same turn',()=>{
  const {store,owner}=stage(0);
  owner.stadiumUsedTurn=5;
  assert.throws(()=>store.dispatch(new UseStadiumAction(owner.id)));
  assert.equal(owner.hand.cards.length,3);
});
