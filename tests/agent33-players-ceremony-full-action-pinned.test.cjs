'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {registerPlayersCeremony}=
  require('../simulation/twinleaf/card-patches.cjs');
const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(BASE,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {Card}=native('game/store/card/card');
const {CardList}=native('game/store/state/card-list');
const {GamePhase}=native('game/store/state/state');
const {UseStadiumAction}=native('game/store/actions/game-actions');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');

function stage(seat){
 const manager=initializeCards(),id=registerPlayersCeremony();
 const ceremony=manager.getCardByName(id);
 assert.ok(ceremony&&ceremony.researchPatched===true);
 assert.ok(manager.getCardByName('Dratini OBF'));
 const store=new Store({onStateChange(){}});
 const state=store.state;
 const players=[new Player(),new Player()];
 players[0].id=101;players[1].id=202;
 for(const player of players){
  // CardManager clones the printed card on lookup: two real physical copies.
  player.active.cards.push(manager.getCardByName('Dratini OBF'));
  player.deck.cards.push(...Array.from({length:12},()=>new Card()));
  player.prizes=Array.from({length:6},()=>{
    const prize=new CardList();prize.cards.push(new Card());return prize;
  });
 }
 const owner=players[seat],opp=players[1-seat];
 owner.hand.cards.push(new Card(),new Card(),new Card(),ceremony);
 state.players=players;
 state.activePlayer=seat;state.phase=GamePhase.PLAYER_TURN;state.turn=5;
 store.state=state;
 return {store,owner,opp,ceremony};
}
for(const seat of [0,1]){
 test('native held SP127 card placement and Stadium draw-two turn end seat '+seat,()=>{
   const {store,owner,opp,ceremony}=stage(seat);
   const beforeOpponent=opp.hand.cards.length;
   const idx=owner.hand.cards.indexOf(ceremony);
   store.dispatch(new PlayCardAction(owner.id,idx,{
     player:PlayerType.ANY,slot:SlotType.BOARD,index:0
   }));
   assert.ok(owner.stadium.cards.includes(ceremony));
   assert.equal(owner.hand.cards.length,3);
   assert.equal(owner.stadiumPlayedTurn,5);
   store.dispatch(new UseStadiumAction(owner.id));
   assert.equal(owner.hand.cards.length,5);
   assert.equal(owner.deck.cards.length,10);
   assert.equal(owner.stadiumUsedTurn,5);
   assert.equal(opp.hand.cards.length,beforeOpponent);
   assert.ok(store.state.activePlayer!==seat||
     store.state.phase!==GamePhase.PLAYER_TURN);
 });
}
test('native repeat use after same turn is denied',()=>{
 const {store,owner}=stage(0);
 owner.stadium.cards.push(owner.hand.cards.pop());
 owner.stadiumUsedTurn=5;
 assert.throws(()=>store.dispatch(new UseStadiumAction(owner.id)));
});
