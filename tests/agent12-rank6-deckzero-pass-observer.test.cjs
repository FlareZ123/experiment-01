'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withDeckoutPassObservation}=require('../simulation/twinleaf/agent12-rank6-deckzero-pass-observer.cjs');
class AddPlayerAction{}
class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
class FakeStore{
 constructor(seat,hand){this.state={activePlayer:seat,turn:40,prompts:[],
   players:[{id:101,hand:{cards:hand},deck:{cards:[]},supporterTurn:0,
     prizes:Array.from({length:6},()=>({cards:[{}]}))},
     {id:202,hand:{cards:[]},deck:{cards:[{}]},supporterTurn:0,prizes:[]} ]};
   this.actions=[];
 }
 dispatch(action){this.actions.push(action.constructor.name);return 'accepted';}
}
const trials=[
 {id:'6:71:A:champion-reference',candidateSlot:'A',rank:6},
 {id:'6:71:A:new-moon-lockbreaker-v1',candidateSlot:'A',rank:6}
];
test('read-only original Store Pass remains unchanged while empty-deck Lillie is observable',()=>{
 const card={fullName:"Lillie's Determination M1L",
   canPlay:()=>true};
 const other={fullName:'Psychic Energy SVE'};
 const old=FakeStore.prototype.dispatch;
 let clones=0;
 const out=withDeckoutPassObservation(()=>{
  const stores=[];
  for(let i=0;i<2;i++){
   const s=new FakeStore(0,i===0?[card,other]:[other]);
   s.dispatch(new AddPlayerAction());
   assert.equal(s.dispatch(new PassTurnAction(101)),'accepted');
   stores.push(s);
  }
  return stores.map(s=>s.actions);
 },trials,{Store:FakeStore,probe:()=>{clones++;return {outcome:'NATIVE_LILLIE_SETTLED'};}});
 assert.equal(out.audit.realGames,2);
 assert.equal(out.audit.events.length,2);
 assert.equal(clones,1);
 assert.equal(out.audit.events[0].nativeCanPlay,true);
 assert.equal(out.audit.events[0].oldActorPolicyDeckZeroVeto,true);
 assert.equal(out.audit.events[0].clone.outcome,'NATIVE_LILLIE_SETTLED');
 assert.equal(out.audit.events[1].clone,null);
 assert.deepEqual(out.result,[
   ['AddPlayerAction','PassTurnAction'],
   ['AddPlayerAction','PassTurnAction']]);
 assert.strictEqual(FakeStore.prototype.dispatch,old);
});
