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
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {CheckPokemonPowersEffect}=
  native('game/store/effects/check-effects');

function staged(seat){
 const manager=initializeCards();
 const get=print=>{
   const card=manager.getCardByName(print);
   assert.ok(card,'Missing pinned CardManager '+print);
   return card;
 };
 const store=new Store({onStateChange(){}});
 const state=store.state,players=[new Player(),new Player()];
 players[0].id=101;players[1].id=202;
 for(const p of players){
   p.active.cards.push(get('Dratini OBF'));
   p.deck.cards.push(...Array.from({length:12},()=>new Card()));
   p.prizes=Array.from({length:6},()=>{
     const prize=new CardList();prize.cards.push(new Card());return prize;
   });
 }
 const owner=players[seat],opp=players[1-seat];
 opp.active.cards.length=0;
 opp.active.cards.push(get('Genesect V FST'));
 const pathCard=get('Path to the Peak CRE');
 owner.hand.cards.push(pathCard);
 state.players=players;state.turn=5;state.phase=GamePhase.PLAYER_TURN;
 state.activePlayer=seat;store.state=state;
 return {store,owner,opp,pathCard};
}
function names(store,opp){
 const card=opp.active.getPokemonCard();
 const probe=new CheckPokemonPowersEffect(opp,card);
 store.reduceEffect(store.state,probe);
 return probe.powers.map(x=>x.name);
}
for(const seat of [0,1]){
 test('Path native play blocks visible opposing Genesect Ability seat '+seat,()=>{
   const {store,owner,opp,pathCard}=staged(seat);
   assert.ok(names(store,opp).includes('Fusion Strike System'),
     'Original Ability initially exposed to native power check');
   store.dispatch(new PlayCardAction(owner.id,
     owner.hand.cards.indexOf(pathCard),{
       player:PlayerType.ANY,slot:SlotType.BOARD,index:0
     }));
   assert.ok(owner.stadium.cards.includes(pathCard),
     'Native Store accepted exact Path to the Peak printed Stadium');
   assert.equal(names(store,opp).includes('Fusion Strike System'),false,
     'Native CheckPokemonPowersEffect must suppress opposing Rule Box Ability');
   // Removing the Stadium physically, solely for this staged rules probe,
   // restores a natural native CheckPokemonPowersEffect response.
   owner.stadium.cards.length=0;
   assert.ok(names(store,opp).includes('Fusion Strike System'));
 });
}
