'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceVipAfterPassEligible, sourceVipActorEligible,
  sourceCologneAfterVipEligible,sourceSecondVipActorEligible,
  sourceCompressorAfterKokoEligible,selectSourceCompressorCards,
  sourceKokoNativePostcondition,
  selectSourceVipBasics,selectSecondVipBasics,withSourceVipAfterPass} =
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

test('post-search Cologne opportunity requires owner-visible Meloetta, Thorns and unlocked Item',()=>{
  const view={decisionKind:'owner-root',globalTurn:1,phase:3,
    ownTurnResources:{itemPlayLocked:false},
    ownHand:['Canceling Cologne ASR'],
    ownPublic:{active:{printing:'Unown AOR'},bench:[
      {printing:'Meloetta ex SV11B'},null,null,null,null]},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM'},handCount:6}};
  assert.equal(sourceCologneAfterVipEligible(view,3),true);
  const hidden=structuredClone(view);
  hidden.opponentPublic.secretHand=['irrelevant private identity'];
  hidden.opponentPublic.secretDeck=['another unseen distribution'];
  assert.equal(sourceCologneAfterVipEligible(hidden,3),true);
  hidden.ownTurnResources.itemPlayLocked=true;
  assert.equal(sourceCologneAfterVipEligible(hidden,3),false);
  hidden.ownTurnResources.itemPlayLocked=false;
  hidden.opponentPublic.active={printing:'Regidrago VSTAR SIT'};
  assert.equal(sourceCologneAfterVipEligible(hidden,3),false);
  hidden.opponentPublic.active={printing:'Iron Thorns ex TWM'};
  hidden.ownPublic.bench[0]=null;
  assert.equal(sourceCologneAfterVipEligible(hidden,3),false);
  hidden.ownPublic.active={printing:'Meloetta ex SV11B'};
  assert.equal(sourceCologneAfterVipEligible(hidden,3),true);
  hidden.globalTurn=2;
  assert.equal(sourceCologneAfterVipEligible(hidden,3),false);
});


test('optional Squawk priority uses only physical owner search choices and fallback',()=>{
  const {state,own}=source(['Unown',null,null,null,null],['Battle VIP Pass']);
  const egg={name:'Exeggcute',fullName:'Exeggcute PLF'};
  const meloetta={name:'Meloetta ex',fullName:'Meloetta ex SV11B'};
  const squawk={name:'Squawkabilly ex',fullName:'Squawkabilly ex PAL'};
  const original=[egg,meloetta,squawk];
  const prompt={cards:{cards:original.slice()},validate:cards=>cards.length<=2&&
    cards.every(card=>prompt.cards.cards.includes(card))};
  assert.deepEqual(selectSourceVipBasics(own,prompt,state),[meloetta,egg]);
  assert.deepEqual(selectSourceVipBasics(own,prompt,state,{preferSquawk:true}),
    [meloetta,squawk]);
  assert.deepEqual(prompt.cards.cards,original);
  prompt.cards.cards=[egg,meloetta];
  assert.deepEqual(selectSourceVipBasics(own,prompt,state,{preferSquawk:true}),
    [meloetta,egg]);
  prompt.cards.cards=[egg,squawk];
  assert.deepEqual(selectSourceVipBasics(own,prompt,state,{preferSquawk:true}),
    [squawk,egg]);
  own.bench=[slot('Unown'),slot('Exeggcute'),slot('Crobat V'),slot(null),slot(null)];
  assert.deepEqual(selectSourceVipBasics(own,prompt,state,{preferSquawk:true}),
    [squawk]);
});


test('second VIP after actual Squawk turn sees only the actor hand and public board',()=>{
  const view={decisionKind:'owner-root',globalTurn:1,phase:3,
    ownTurnResources:{itemPlayLocked:false},
    ownHand:['Battle VIP Pass FST','Battle Compressor PHF'],
    ownPublic:{active:{printing:'Bunnelby PRC'},bench:[
      {printing:'Dedenne GX UNB'},{printing:'Meloetta ex SV11B'},
      {printing:'Squawkabilly ex PAL'},{printing:'Exeggcute PLF'},null]},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM'},handCount:5}};
  assert.equal(sourceSecondVipActorEligible(view,3),true);
  const alternate=structuredClone(view);
  alternate.opponentPublic.hiddenHand=['unknown opponent cards'];
  alternate.opponentPublic.hiddenDeck=['unknown opponent deck'];
  assert.equal(sourceSecondVipActorEligible(alternate,3),true);
  alternate.ownPublic.bench[4]={printing:'Tapu Koko Prism Star TEU'};
  assert.equal(sourceSecondVipActorEligible(alternate,3),false);
  alternate.ownPublic.bench[4]=null;
  alternate.ownHand=['Battle Compressor PHF'];
  assert.equal(sourceSecondVipActorEligible(alternate,3),false);
  alternate.ownHand=['Battle VIP Pass FST'];
  alternate.ownTurnResources.itemPlayLocked=true;
  assert.equal(sourceSecondVipActorEligible(alternate,3),false);
  alternate.ownTurnResources.itemPlayLocked=false;
  alternate.ownPublic.bench[2]=null;
  assert.equal(sourceSecondVipActorEligible(alternate,3),false);
  alternate.ownPublic.bench[2]={printing:'Squawkabilly ex PAL'};
  alternate.globalTurn=2;
  assert.equal(sourceSecondVipActorEligible(alternate,3),false);
});

test('second VIP search selects only real owner-deck Koko and legal additional Egg',()=>{
  const {state,own}=source(['Meloetta ex','Squawkabilly ex',null,null,null],
    ['Battle VIP Pass']);
  const koko={name:'Tapu Koko Prism Star',fullName:'Tapu Koko Prism Star TEU'};
  const egg={name:'Exeggcute',fullName:'Exeggcute PLF'};
  const bunnelby={name:'Bunnelby',fullName:'Bunnelby PRC'};
  const pool=[egg,bunnelby,koko];
  const prompt={cards:{cards:pool.slice()},validate:cards=>cards.length<=2&&
    cards.every(card=>prompt.cards.cards.includes(card))};
  assert.deepEqual(selectSecondVipBasics(own,prompt,state),[koko,egg]);
  assert.deepEqual(prompt.cards.cards,pool);
  own.bench=[slot('Dedenne GX'),slot('Meloetta ex'),
    slot('Squawkabilly ex'),slot('Exeggcute'),slot(null)];
  assert.deepEqual(selectSecondVipBasics(own,prompt,state),[koko]);
  prompt.cards.cards=[egg,bunnelby];
  assert.deepEqual(selectSecondVipBasics(own,prompt,state),[egg]);
  prompt.cards.cards=[bunnelby];
  assert.deepEqual(selectSecondVipBasics(own,prompt,state),[]);
});


test('third missed Compressor offer cannot see opponent hidden zones or own deck',()=>{
  const view={decisionKind:'owner-root',globalTurn:1,phase:3,
    ownTurnResources:{itemPlayLocked:false},
    ownHand:['Battle Compressor PHF','Carmine TWM'],
    ownPublic:{active:{printing:'Bunnelby PRC'},bench:[
      {printing:'Dedenne GX UNB'},{printing:'Meloetta ex SV11B'},
      {printing:'Squawkabilly ex PAL'},{printing:'Exeggcute PLF'},
      {printing:'Tapu Koko Prism Star TEU'}]},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM'}}};
  assert.equal(sourceCompressorAfterKokoEligible(view,3),true);
  const changed=structuredClone(view);
  changed.opponentPublic.hiddenHand=['different opponent secret'];
  changed.ownHiddenDeck=['a hypothetical prized Lightning'];
  assert.equal(sourceCompressorAfterKokoEligible(changed,3),true);
  changed.ownTurnResources.itemPlayLocked=true;
  assert.equal(sourceCompressorAfterKokoEligible(changed,3),false);
  changed.ownTurnResources.itemPlayLocked=false;
  changed.ownPublic.bench[4]=null;
  assert.equal(sourceCompressorAfterKokoEligible(changed,3),false);
  changed.ownPublic.bench[4]={printing:'Tapu Koko Prism Star TEU'};
  changed.ownHand=['Carmine TWM'];
  assert.equal(sourceCompressorAfterKokoEligible(changed,3),false);
  changed.ownHand=['Battle Compressor PHF'];
  changed.globalTurn=2;
  assert.equal(sourceCompressorAfterKokoEligible(changed,3),false);
});

test('Compressor owner prompt selects only physical Lightning and Egg references',()=>{
  const lightning1={name:'Lightning Energy',fullName:'Lightning Energy MEE',id:1};
  const lightning2={name:'Lightning Energy',fullName:'Lightning Energy MEE',id:2};
  const egg={name:'Exeggcute',fullName:'Exeggcute PLF',id:3};
  const other={name:'Bunnelby',fullName:'Bunnelby PRC',id:4};
  const state={};
  const prompt={cards:{cards:[egg,other,lightning2,lightning1]},
    validate:group=>group.length<=3&&
      group.every(card=>prompt.cards.cards.includes(card))};
  assert.deepEqual(selectSourceCompressorCards(prompt,state),
    [lightning2,lightning1,egg]);
  assert.equal(prompt.cards.cards.length,4);
  prompt.cards.cards=[egg,other,lightning1];
  assert.deepEqual(selectSourceCompressorCards(prompt,state),[lightning1,egg]);
  prompt.cards.cards=[other];
  assert.deepEqual(selectSourceCompressorCards(prompt,state),[]);
});


test('Koko proof requires actual Lost Zone card and two distinct Bench Energy zones',()=>{
  const energy=()=>({name:'Lightning Energy'});
  const own={
    lostzone:{cards:[]},discard:{cards:[energy(),energy()]},
    bench:[slot('Meloetta ex'),slot('Dedenne GX'),slot(null),slot(null),slot(null)]
  };
  own.bench.forEach(s=>{s.energies={cards:[]};});
  assert.equal(sourceKokoNativePostcondition(own).prismInLostZone,false);
  own.lostzone.cards.push({name:'Tapu Koko Prism Star'});
  own.discard.cards=[];
  own.bench[0].energies.cards=[energy()];
  own.bench[1].energies.cards=[energy()];
  const result=sourceKokoNativePostcondition(own);
  assert.equal(result.prismInLostZone,true);
  assert.equal(result.recipientCount,2);
  assert.equal(result.lightningAttached,2);
  assert.equal(result.discardLightning,0);
  own.bench[1].energies.cards=[];
  assert.equal(sourceKokoNativePostcondition(own).recipientCount,1);
});
