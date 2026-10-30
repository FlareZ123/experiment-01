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
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');

function stage(seat){
 const manager=initializeCards();
 const pokemon=()=>manager.getCardByName('Dratini OBF');
 const sky=manager.getCardByName('Sky Field ROS');
 assert.ok(pokemon()&&sky);
 const store=new Store({onStateChange(){}});
 const state=store.state,players=[new Player(),new Player()];
 players[0].id=101;players[1].id=202;
 for(const p of players){
  p.active.cards.push(pokemon());
  p.deck.cards.push(...Array.from({length:12},()=>new Card()));
  p.prizes=Array.from({length:6},()=>{
   const prize=new CardList();prize.cards.push(new Card());return prize;
  });
  p.bench=Array.from({length:5},()=>new PokemonCardList());
  p.bench.forEach(b=>{b.isPublic=true;});
 }
 const owner=players[seat],opp=players[1-seat];
 owner.bench.forEach(b=>b.cards.push(pokemon()));
 owner.hand.cards.push(sky,pokemon());
 state.players=players;state.turn=5;state.phase=GamePhase.PLAYER_TURN;
 state.activePlayer=seat;store.state=state;
 return {store,owner,opp,sky};
}
for(const seat of [0,1]){
 test('native Sky Field opens slots 5-7 and permits sixth held Basic seat '+seat,()=>{
  const {store,owner,opp,sky}=stage(seat);
  assert.equal(owner.bench.length,5);
  store.dispatch(new PlayCardAction(owner.id,owner.hand.cards.indexOf(sky),{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  assert.ok(owner.stadium.cards.includes(sky));
  assert.equal(owner.bench.length,8);
  assert.equal(opp.bench.length,8);
  const pokemon=owner.hand.cards.find(c=>c?.name==='Dratini');
  assert.ok(pokemon);
  store.dispatch(new PlayCardAction(owner.id,owner.hand.cards.indexOf(pokemon),{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:5}));
  assert.equal(owner.bench[5].getPokemonCard()?.name,'Dratini');
  assert.equal(owner.bench.filter(b=>b.getPokemonCard()).length,6);
 });
}
