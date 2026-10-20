'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceVipAfterPassEligible, sourceVipActorEligible,
  selectSourceVipBasics, withSourceVipAfterPass} =
  require('../simulation/twinleaf/rank26-first-own-vip-after-pass.cjs');

function slot(name) {
  return {getPokemonCard:()=>name ? {name,fullName:name+' TEST'} : null};
}
function source(benchNames,handNames) {
  const own = {active:slot('Unown'),bench:benchNames.map(slot),
    hand:{cards:handNames.map(name=>({name}))}};
  const state = {turn:1,activePlayer:0,phase:3,prompts:[],players:[own,{}]};
  return {state,own};
}

test('firstturn VIP gate preserves Koko space and source ownership',()=>{
  const {state,own}=source(['Unown',null,null,null,null],['Battle VIP Pass']);
  assert.equal(sourceVipAfterPassEligible(state,own,0,3),true);
  state.activePlayer=1;
  assert.equal(sourceVipAfterPassEligible(state,own,0,3),false);
  state.activePlayer=0;
  own.bench=[slot('Unown'),slot('Exeggcute'),slot('Crobat V'),slot('Unown'),slot(null)];
  assert.equal(sourceVipAfterPassEligible(state,own,0,3),false);
  own.bench[1]=slot('Tapu Koko Prism Star');
  assert.equal(sourceVipAfterPassEligible(state,own,0,3),true);
  own.bench[1]=slot('Meloetta ex');
  assert.equal(sourceVipAfterPassEligible(state,own,0,3),false);
});

test('owner search selects physical Meloetta and Egg without altering deck',()=>{
  const {state,own}=source(['Unown',null,null,null,null],['Battle VIP Pass']);
  const refs=[{name:'Meloetta ex',fullName:'Meloetta ex SV11B'},
    {name:'Exeggcute',fullName:'Exeggcute PLF'},
    {name:'Bunnelby',fullName:'Bunnelby PRC'}];
  const prompt={cards:{cards:refs},validate:group=>group.length<=2 &&
    group.every(card=>refs.includes(card))};
  const original=refs.slice();
  assert.deepEqual(selectSourceVipBasics(own,prompt,state),refs.slice(0,2));
  assert.deepEqual(prompt.cards.cards,original);
  own.bench=[slot('Unown'),slot('Exeggcute'),slot('Crobat V'),slot(null),slot(null)];
  assert.deepEqual(selectSourceVipBasics(own,prompt,state),refs.slice(0,1));
  prompt.cards.cards=[refs[1],refs[2]];
  assert.deepEqual(selectSourceVipBasics(own,prompt,state),[refs[1]]);
});

test('cannot start native hook without valid seat and synchronous callback',()=>{
  assert.throws(()=>withSourceVipAfterPass(2,()=>{}),TypeError);
  assert.throws(()=>withSourceVipAfterPass(0,null),TypeError);
});

test('detached actor view preserves VIP eligibility under hidden changes',()=>{
  const active={printing:'Unown AOR'};
  const unown={printing:'Unown AOR'};
  const view={
    actorSeat:0,globalTurn:1,phase:3,decisionKind:'owner-root',
    ownHand:['Battle VIP Pass FST','Quick Ball FST'],
    ownPublic:{active,bench:[unown,null,null,null,null]},
    opponentPublic:{handCount:7,deckCount:47,prizeCount:6},
    ownTurnResources:{itemPlayLocked:false}
  };
  assert.equal(sourceVipActorEligible(view,3),true);
  const alternate=structuredClone(view);
  alternate.opponentPublic.hiddenHand=[
    'Searched hypothetical opponent-secret worlds'];
  alternate.opponentPublic.hiddenDeck=['Different concealed roster'];
  assert.equal(sourceVipActorEligible(alternate,3),true);
  alternate.ownPublic.bench=[
    {printing:'Unown AOR'},{printing:'Exeggcute PLF'},
    {printing:'Crobat V DAA'},{printing:'Unown AOR'},null];
  assert.equal(sourceVipActorEligible(alternate,3),false);
  alternate.ownPublic.bench[1]={printing:'Tapu Koko Prism Star TEU'};
  assert.equal(sourceVipActorEligible(alternate,3),true);
  alternate.ownPublic.bench[1]={printing:'Meloetta ex SV11B'};
  assert.equal(sourceVipActorEligible(alternate,3),false);
  alternate.ownPublic.bench[1]=null;
  alternate.ownHand=['Battle VIP Pass FST','Meloetta ex SV11B'];
  assert.equal(sourceVipActorEligible(alternate,3),false);
  alternate.ownHand=['Battle VIP Pass FST'];
  alternate.globalTurn=2;
  assert.equal(sourceVipActorEligible(alternate,3),false);
  alternate.globalTurn=1;
  alternate.decisionKind='owner-prompt';
  assert.equal(sourceVipActorEligible(alternate,3),false);
});
