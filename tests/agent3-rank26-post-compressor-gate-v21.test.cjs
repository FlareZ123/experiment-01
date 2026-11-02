'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceRootGates,summarizeRootReadings,firstTurnSettlements}=
  require('../simulation/twinleaf/agent3-rank26-post-compressor-gate-v21.cjs');
const card=(name,id)=>({name,id,fullName:name+' Test'});
const slot=(name,energy=[],tools=[])=>({
  getPokemonCard:()=>name?card(name,22):null,
  energies:{cards:energy.map((x,i)=>card(x,i))},
  tools:tools.map((x,i)=>card(x,30+i))
});
function fixture(){
  const owner={
    active:slot('Unown'),
    bench:[slot('Meloetta ex',['Double Colorless Energy','Lightning Energy'],
      ['Technical Machine: Crisis Punch']),slot('Tapu Koko Prism Star')],
    hand:{cards:[card('Canceling Cologne',55)]},
    discard:{cards:[card('Lightning Energy',10),card('Lightning Energy',11),
      card('Battle Compressor',12)]},
    stadium:{cards:[card('Risky Ruins',15)]},
    lostzone:{cards:[]}
  };
  const opponent={
    active:slot('Iron Thorns ex'),
    bench:[],hand:{cards:[card('secret',99)]},
    discard:{cards:[]},stadium:{cards:[]},
    getPrizeLeft:()=>1
  };
  return {players:[owner,opponent],turn:1,activePlayer:0};
}
test('owner-visible firstturn prerequisites distinguish staged Bench from attack-ready Active',()=>{
  const state=fixture(),x=sourceRootGates(state,0);
  assert.equal(x.opposingAbilityLock,true);
  assert.equal(x.discardLightning2,true);
  assert.equal(x.meloKokoBench,true);
  assert.equal(x.kokoResourceReady,true);
  assert.equal(x.DCEOnMelo,true);
  assert.equal(x.meloCrisisTool,true);
  assert.equal(x.attackWitnessPrerequisites,false);
  state.players[0].active=state.players[0].bench.shift();
  const active=sourceRootGates(state,0);
  assert.equal(active.activeMelo,true);
  assert.equal(active.attackWitnessPrerequisites,true);
  assert.equal(active.meloKokoBench,false);
});
test('snapshot independent of opposing hidden hand and deck',()=>{
  const state=fixture();
  const baseline=sourceRootGates(state,0);
  state.players[1].hand.cards=[card('another secret',900)];
  state.players[1].deck={cards:[card('private',901)]};
  assert.deepEqual(sourceRootGates(state,0),baseline);
});
test('firstturn settlement excludes later turns and paper-illegal empty choice',()=>{
  const arm={settlementAudit:{receipts:[
    {globalTurn:1,nativeDispatchReturned:true,paperMinimumMet:true,
      physicallyMoved:[{name:'Lightning Energy',id:10},{name:'Exeggcute',id:40}]},
    {globalTurn:2,nativeDispatchReturned:true,paperMinimumMet:true,
      physicallyMoved:[{name:'Lightning Energy',id:11}]},
    {globalTurn:1,nativeDispatchReturned:true,paperMinimumMet:false,
      physicallyMoved:[]}
  ]}};
  const result=firstTurnSettlements(arm);
  assert.equal(result.positivePromptResolutions,1);
  assert.equal(result.physicallyMovedCopies,2);
  assert.equal(result.lightningMoves,1);
  assert.equal(result.exeggcuteMoves,1);
  assert.deepEqual(result.lightningOriginalPhysicalIds,[10]);
});
test('root aggregation measures any root without counting roots as deals',()=>{
  const a=sourceRootGates(fixture(),0),b={...a,benchKoko:false,
    meloKokoBench:false,kokoResourceReady:false};
  const result=summarizeRootReadings([a,b]);
  assert.equal(result.sourceActionRoots,2);
  assert.equal(result.any.kokoResourceReady,true);
  assert.equal(result.timeline.length,2);
  assert.deepEqual(summarizeRootReadings([]).any.kokoResourceReady,false);
});
