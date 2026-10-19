'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {initializeCards}=require('./headless.cjs');
/** @param {string} name @returns {any} */
const load=name=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',name));
/**
 * Construct one exact source-60 (or provisional New Moon proxy) with physical
 * zones chosen to make a mandatory native Compressor prompt inspectable.
 * This is a mechanical staging fixture, never a random or source-dealt game.
 * @param {'rank26'|'newmoon'} kind
 * @returns {object}
 */
function stageSourceDeck(kind){
 assert.ok(kind==='rank26'||kind==='newmoon');
 const source=kind==='rank26'?26:{label:'New Moon',cards:loadNewMoonCandidate().cards};
 const opts={allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
 const registered=planAichi(source,opts).candidate.cards;
 assert.equal(registered.length,60);
 const goals=kind==='rank26'?[{printing:'Exeggcute PLF',value:9,maxCopies:2}]:[
  {printing:'Gengar & Mimikyu-GX TEU',value:9},
  {printing:'Trevenant & Dusknoir-GX SMP',value:7}];
 const remaining=registered.slice();
 const take=n=>{const i=remaining.indexOf(n);assert.ok(i>=0,n);return remaining.splice(i,1)[0]};
 const active=take(kind==='rank26'?'Meloetta ex SV11B':'Mewtwo & Mew-GX UNM');
 const compressor=take('Battle Compressor PHF');
 const protectedNames=new Set(goals.map(g=>g.printing));
 const takeOther=count=>{
  const result=[];
  for(let i=remaining.length-1;i>=0&&result.length<count;i--)
   if(!protectedNames.has(remaining[i]))result.push(remaining.splice(i,1)[0]);
  assert.equal(result.length,count);return result;
 };
 const hand=[compressor,...takeOther(6)],prizes=takeOther(6);
 assert.equal(remaining.length,46);
 const {Store}=load('game/store/store'),{Player}=load('game/store/state/player');
 const {CardList}=load('game/store/state/card-list');
 const {GamePhase}=load('game/store/state/state');
 const {Format}=load('game/store/card/card-types');
 const db=initializeCards();let nextId=1;
 const card=n=>{const c=db.getCardByName(n);assert.ok(c,n);c.id=nextId++;return c};
 const store=new Store({onStateChange(){}}),state=store.state;
 const owner=new Player(),opponent=new Player();
 owner.id=101;opponent.id=202;state.players=[owner,opponent];
 state.turn=1;state.activePlayer=0;state.phase=GamePhase.PLAYER_TURN;
 state.gameSettings.format=Format.EXPANDED;
 owner.active.cards.push(card(active));
 opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
 owner.hand.cards=hand.map(card);owner.deck.cards=remaining.map(card);
 owner.prizes=prizes.map(n=>{const x=new CardList();x.cards.push(card(n));return x});
 opponent.prizes=Array.from({length:6},()=>{
  const x=new CardList();x.cards.push(card('Psychic Energy MEE'));return x});
 assert.ok(goals.every(g=>owner.deck.cards.some(c=>c.fullName===g.printing)));
 const identities=[...owner.active.cards,...owner.hand.cards,...owner.deck.cards,
  ...owner.prizes.flatMap(x=>x.cards)];
 assert.equal(new Set(identities.map(x=>x.id)).size,60);
 return {store,state,owner,goals,load};
}
module.exports={stageSourceDeck};
