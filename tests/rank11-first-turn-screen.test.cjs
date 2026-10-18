'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {screenRank11FirstTurn}=require('../simulation/twinleaf/rank11-first-turn-screen.cjs');

function makeGame(activePlayer,sourceSeat=0,invalid=false) {
  let n=0;
  class AI {decodeNextAction(){n++;return 'original';}}
  const original=AI.prototype.decodeNextAction;
  const players=[0,1].map(i=>({
    active:{getPokemonCard:()=>({
      name:i===sourceSeat?'Oranguru V':'Shadow Rider Calyrex V'
    })},
    hand:{cards:[{name:'Battle VIP Pass'},{name:'Float Stone'}]}
  }));
  const state={turn:1,activePlayer,phase:3,prompts:[],players};
  const sourceObserver=(_s,p)=>p.active.getPokemonCard().name==='Oranguru V';
  const options={
    sourceSeat,SimpleTacticsAi:AI,playerTurnPhase:3,
    openingOpportunity:sourceObserver,
    runMatch(){const x=new AI();assert.equal(x.decodeNextAction(state),'original');}
  };
  if(invalid) options.runMatch=()=>{throw new Error('source engine error');};
  return {options,AI,original,readCalls:()=>n};
}
test('capture actual source first and K0 only before root policy action',()=>{
  const g=makeGame(0);
  const r=screenRank11FirstTurn(g.options);
  assert.equal(r.sourceFirst,true);
  assert.equal(r.eligibleK0,true);
  assert.equal(r.sourceStarter,'Oranguru V');
  assert.deepEqual(r.sourceOwnHand,['Battle VIP Pass','Float Stone']);
  assert.equal(g.readCalls(),0);
  assert.equal(g.AI.prototype.decodeNextAction,g.original);
  assert.equal(r.qualifiedForCompetitiveInference,false);
});
test('candidate-first screen never inspects opponent hidden hand',()=>{
  const g=makeGame(1);
  let reads=0;
  g.options.openingOpportunity=()=>{reads++; return true;};
  const r=screenRank11FirstTurn(g.options);
  assert.equal(r.actualFirstPlayerSeat,1);
  assert.equal(r.sourceFirst,false);
  assert.equal(r.eligibleK0,false);
  assert.equal(r.sourceOwnHand,null);
  assert.equal(reads,0);
  assert.equal(g.AI.prototype.decodeNextAction,g.original);
});
test('ordinary engine exceptions propagate and bot prototype restores',()=>{
  const g=makeGame(0,0,true);
  assert.throws(()=>screenRank11FirstTurn(g.options),/source engine error/);
  assert.equal(g.AI.prototype.decodeNextAction,g.original);
});
test('no first-turn root decision is an explicit screening failure',()=>{
  const g=makeGame(0);
  g.options.runMatch=()=>{};
  assert.throws(()=>screenRank11FirstTurn(g.options),/did not reach/);
  assert.equal(g.AI.prototype.decodeNextAction,g.original);
});
