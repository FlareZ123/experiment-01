'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {PIN,BLOB,HOOK_ID,isExact,installPinnedHeavyBallResolutionHook}
 =require('../../simulation/twinleaf/agent2-hisuian-heavy-ball-resolution-hook.cjs');
const {installPinnedHisuianHeavyBallShuffleHook}
 =require('../../simulation/twinleaf/agent2-hisuian-heavy-ball-prize-shuffle-hook.cjs');
const card=(name)=>({name,superType:name==='Regidrago V'?'POKEMON':'TRAINER',stage:'BASIC'});
const sourceId='Hisuian Heavy Ball ASR';
class ChooseCardsPrompt{
 constructor(player,cards){
  this.playerId=player.id;
  this.cards=cards;this.message='CHOOSE_CARD_TO_HAND';
  this.options={min:0,max:1,allowCancel:false};
 }
}
function moveCards(store,state,from,to,{cards,sourceCard}={}){
 for(const c of cards){
  const at=from.cards.indexOf(c);
  if(at<0)throw Error('NATIVE_MOVE_SOURCE_MISSING');
  from.cards.splice(at,1);to.cards.push(c);
 }
}
function pinnedCard(){
 return class HisuianHeavyBall{
  constructor(){
   this.name='Hisuian Heavy Ball';this.fullName=sourceId;
   this.set='ASR';this.setNumber='146';
  }
  shuffleFaceDownPrizeCards(array){
   const faceDownPrizeCards=array.filter(p=>p.isSecret&&p.cards.length>0);
   const prizePositions=[];
   for(let i=0;i<array.length;i++){
    prizePositions.push(faceDownPrizeCards.splice(0,1)[0]??array[i]);
   }
   return prizePositions;
  }
  reduceEffect(store,state,effect){
   if(effect.trainerCard!==this)return state;
   const player=effect.player,originallyFaceDown=player.prizes.map(x=>x.isSecret);
   const originalCards=player.prizes.flatMap(x=>x.cards);
   player.prizes.forEach(p=>{if(p.isSecret)p.isSecret=false});
   moveCards(store,state,player.hand,player.supporter,{
    cards:[effect.trainerCard],sourceCard:this});
   store.prompt(state,new ChooseCardsPrompt(player,{cards:originalCards}),chosenPrize=>{
    if(!chosenPrize||chosenPrize.length===0){
     player.prizes.forEach((p,i)=>{if(originallyFaceDown[i])p.isSecret=true});
     this.shuffleFaceDownPrizeCards(player.prizes.filter((p,i)=>originallyFaceDown[i]));
     return state;
    }
    const prizePokemon=chosenPrize[0];
    const list=player.prizes.find(p=>p.cards.includes(prizePokemon));
    if(list){
     moveCards(store,state,list,player.hand,{cards:[prizePokemon],sourceCard:this});
     moveCards(store,state,player.supporter,list,{cards:[effect.trainerCard],sourceCard:this});
    }
    player.prizes.forEach((p,i)=>{if(originallyFaceDown[i])p.isSecret=true});
    this.shuffleFaceDownPrizeCards(player.prizes.filter((p,i)=>originallyFaceDown[i]));
    return state;
   });
   return state;
  }
 };
}
function env(Card){
 const item=new Card(),basic=card('Regidrago V'),energy=card('Grass Energy'),
  other=card('Sky Field');
 const player={id:'actor',hand:{cards:[item]},supporter:{cards:[]},
  discard:{cards:[]},prizes:[
   {cards:[energy],isSecret:true,faceUpPrize:false},
   {cards:[basic],isSecret:true,faceUpPrize:false},
   {cards:[other],isSecret:true,faceUpPrize:false}
  ]};
 const store={prompt(state,prompt,callback){
  this.pending={state,prompt,callback};
  return state;
 }};
 const state={phase:3,players:[player,{id:'other'}]};
 return {store,state,item,player,basic,energy,other};
}
function call(e){
 const method=e.store.prompt;
 const result=e.item.reduceEffect(e.store,e.state,{trainerCard:e.item,player:e.player});
 assert.equal(result,e.state);
 assert.equal(e.store.prompt,method);
 assert.equal(e.store.pending.prompt.constructor.name,'ChooseCardsPrompt');
 assert.ok(e.player.supporter.cards.includes(e.item));
 return e.store.pending.callback;
}
test('source/pin/module identity and non-source branch stay exact',()=>{
 assert.equal(PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.equal(BLOB,'894450a28fe12cb6291b14f301d7ea05e7b1f1b3');
 assert.equal(HOOK_ID,'agent2-pinned-asr146-empty-choice-resolution-v1');
 const Card=pinnedCard();assert.equal(isExact(Card),true);
 assert.throws(()=>installPinnedHeavyBallResolutionHook({
  CardClass:Card,enginePin:'unpinned',moveCards
 }),x=>x.code==='ASR146_RESOLUTION_WRONG_PIN');
 const item=new Card(),e=env(Card);
 assert.equal(e.item.reduceEffect(e.store,e.state,{player:e.player}),
  e.state);
 assert.equal(e.store.pending,undefined);
});
test('empty choice must discard Item from supporter and restore Prize secrecy',()=>{
 for(const seat of [0,1]){
  const Card=pinnedCard(),api=installPinnedHeavyBallResolutionHook({
   CardClass:Card,enginePin:PIN,moveCards
  }),e=env(Card);
  const originalPosition=e.player.prizes.map(p=>p.cards[0]);
  const callback=call(e);
  assert.deepEqual(e.player.supporter.cards,[e.item]);
  callback([]);
  assert.deepEqual(e.player.supporter.cards,[]);
  assert.deepEqual(e.player.discard.cards,[e.item]);
  assert.deepEqual(e.player.hand.cards,[]);
  assert.ok(e.player.prizes.every(p=>p.isSecret));
  assert.deepEqual(e.player.prizes.map(p=>p.cards[0]),originalPosition);
  assert.equal(api.uninstall(),true);
 }
});
test('selected originally face-down Basic follows existing native exchange only',()=>{
 const Card=pinnedCard(),api=installPinnedHeavyBallResolutionHook({
  CardClass:Card,enginePin:PIN,moveCards
 }),e=env(Card);
 const callback=call(e);
 callback([e.basic]);
 assert.ok(e.player.hand.cards.includes(e.basic));
 assert.ok(e.player.prizes[1].cards.includes(e.item));
 assert.equal(e.player.supporter.cards.length,0);
 assert.equal(e.player.discard.cards.length,0);
 assert.ok(e.player.prizes.every(p=>p.isSecret));
 assert.equal(api.uninstall(),true);
});
test('face-up Basic cannot be selected by pinned native source despite aggregation',()=>{
 const Card=pinnedCard(),api=installPinnedHeavyBallResolutionHook({
  CardClass:Card,enginePin:PIN,moveCards
 }),e=env(Card);
 e.player.prizes[1].isSecret=false;e.player.prizes[1].faceUpPrize=true;
 const callback=call(e);
 assert.throws(()=>callback([e.basic]),
  x=>x.code==='ASR146_RESOLUTION_FACEUP_PRIZE');
 assert.ok(e.player.supporter.cards.includes(e.item));
 assert.ok(!e.player.hand.cards.includes(e.basic));
 assert.equal(e.player.discard.cards.length,0);
 assert.equal(api.uninstall(),true);
});
test('forged result and changed native source method fail closed',()=>{
 const Card=pinnedCard(),api=installPinnedHeavyBallResolutionHook({
  CardClass:Card,enginePin:PIN,moveCards
 }),e=env(Card),cb=call(e);
 assert.throws(()=>cb({token:'fake'}),
  x=>x.code==='ASR146_RESOLUTION_WRONG_RESULT');
 assert.throws(()=>cb([e.basic,e.basic]),
  x=>x.code==='ASR146_RESOLUTION_TOO_MANY');
 api.uninstall();
 const Different=pinnedCard();
 Different.prototype.reduceEffect=function(store,state,effect){return state;};
 assert.throws(()=>installPinnedHeavyBallResolutionHook({
  CardClass:Different,enginePin:PIN,moveCards
 }),x=>x.code==='ASR146_RESOLUTION_SOURCE_DRIFT');
});
test('idempotent install, uninstall, and wrong class protection',()=>{
 const Card=pinnedCard(),old=Card.prototype.reduceEffect;
 const first=installPinnedHeavyBallResolutionHook({CardClass:Card,enginePin:PIN,moveCards});
 const second=installPinnedHeavyBallResolutionHook({CardClass:Card,enginePin:PIN,moveCards});
 assert.equal(first,second);
 assert.equal(first.uninstall(),true);
 assert.equal(Card.prototype.reduceEffect,old);
 assert.throws(()=>first.uninstall(),x=>x.code==='ASR146_RESOLUTION_CONFLICT');
 class Foreign extends Card{}
 assert.equal(isExact(Foreign),false);
 assert.throws(()=>installPinnedHeavyBallResolutionHook({
  CardClass:Foreign,enginePin:PIN,moveCards
 }),x=>x.code==='ASR146_RESOLUTION_WRONG_CLASS');
});
test('both ASR146 native shuffle and resolution hooks coexist without touching vendor',()=>{
 const Card=pinnedCard(),
  shuffle=installPinnedHisuianHeavyBallShuffleHook({
   CardClass:Card,enginePin:PIN,rng:()=>0}),
  resolution=installPinnedHeavyBallResolutionHook({
   CardClass:Card,enginePin:PIN,moveCards}),
  e=env(Card);
 const original=e.player.prizes.map(p=>p.cards[0]);
 const cb=call(e);
 cb([]);
 assert.deepEqual(e.player.prizes.map(p=>p.cards[0]),
  [original[1],original[2],original[0]]);
 assert.ok(e.player.discard.cards.includes(e.item));
 assert.equal(resolution.uninstall(),true);
 assert.equal(shuffle.uninstall(),true);
});
