'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sourcePrerequisites,summarize}=
  require('../simulation/twinleaf/rank26-prerequisite-census-v12.cjs');

/** @param {string|null} name */
function slot(name) {
  return {getPokemonCard:()=>name?{name}:null};
}

/** @param {0|1} seat @param {object} [options] */
function stateFor(seat,options={}) {
  const owner={
    hand:{cards:options.noCologne?[]:[{name:'Canceling Cologne'}]},
    discard:{cards:options.lowLightning?[{name:'Lightning Energy'}]:
      [{name:'Lightning Energy'},{name:'Lightning Energy'}]},
    active:slot(options.activeMelo?'Meloetta ex':'Unown'),
    bench:options.noBench?[]:[slot('Meloetta ex'),slot('Tapu Koko Prism Star')]
  };
  const opponent={active:slot(options.otherOpponent?'Bunnelby':'Iron Thorns ex'),
    hand:new Proxy({}, {get(){throw new Error('Opponent hand must stay invisible');}})};
  const players=seat===0?[owner,opponent]:[opponent,owner];
  return {players,turn:seat===0?1:2};
}

for(const seat of [0,1]) {
  test('source-only complete pre-Koko state in physical seat '+seat,()=>{
    const g=sourcePrerequisites(stateFor(seat),seat);
    assert.equal(g.fullV2,true);
    assert.equal(g.preKokoReady,true);
    assert.equal(g.activeMelo,false);
    assert.equal(g.globalTurn,seat===0?1:2);
    assert.equal(g.sourcePhysicalSeat,seat);
  });
  test('owner-only missing prerequisites are discriminated for seat '+seat,()=>{
    const noCologne=sourcePrerequisites(stateFor(seat,{noCologne:true}),seat);
    const noBench=sourcePrerequisites(stateFor(seat,{noBench:true}),seat);
    const lowLightning=sourcePrerequisites(stateFor(seat,{lowLightning:true}),seat);
    const noLock=sourcePrerequisites(stateFor(seat,{otherOpponent:true}),seat);
    assert.equal(noCologne.fullV2,false);
    assert.equal(noCologne.heldCologne,false);
    assert.equal(noBench.benchReady,false);
    assert.equal(noBench.fullV2,false);
    assert.equal(lowLightning.preKokoReady,false);
    assert.equal(lowLightning.fullV2,false);
    assert.equal(noLock.opponentLocked,false);
    assert.equal(noLock.fullV2,false);
  });
  test('Active Meloetta is the independent original v1 route for seat '+seat,()=>{
    const g=sourcePrerequisites(stateFor(seat,{activeMelo:true,noBench:true,lowLightning:true}),seat);
    assert.equal(g.fullV2,true);
    assert.equal(g.activeMelo,true);
    assert.equal(g.preKokoReady,false);
  });
}

test('summarization preserves no-root versus partial-root state',()=>{
  assert.equal(summarize([]).nativeSourceRoots,0);
  assert.equal(summarize([]).any.fullV2,false);
  const g=sourcePrerequisites(stateFor(0),0);
  const out=summarize([g]);
  assert.equal(out.nativeSourceRoots,1);
  assert.equal(out.any.fullV2,true);
  assert.equal(out.first.heldCologne,true);
});
