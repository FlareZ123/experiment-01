'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {screenRank11FirstTurn}=require('../simulation/twinleaf/rank11-first-turn-screen.cjs');

function makeGame(activePlayer,sourceSeat=0,invalid=false) {
  let n=0;
  class AI {decodeNextAction(){n++;return 'original';}}
  const original=AI.prototype.decodeNextAction;
  const players=[0,1].map(i=>({
    name:i===0?'research-A':'research-B',
    active:{getPokemonCard:()=>({
      name:i===sourceSeat?'Oranguru V':'Shadow Rider Calyrex V'
    })},
    hand:{cards:[{name:'Battle VIP Pass',fullName:'Battle VIP Pass FST 225'},{name:'Float Stone',fullName:'Float Stone BKT 137'}]}
  }));
  const state={turn:1,activePlayer,phase:3,prompts:[],players,
    logs:[{message:'LOG_PLAYER_DRAWS_CARD',params:{name:players[activePlayer].name}}]};
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
  assert.equal(r.verifiedByDrawLog,true);
  assert.equal(r.firstDrawLogName,'research-A');
  assert.equal(r.eligibleK0,true);
  assert.equal(r.sourceStarter,'Oranguru V');
  assert.deepEqual(r.sourceOwnHand,['Battle VIP Pass','Float Stone']);
  assert.deepEqual(r.sourceOwnHandPrintings,['Battle VIP Pass FST 225','Float Stone BKT 137']);
  assert.equal(r.sourceOpponentHandSize,2);
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
  assert.equal(r.verifiedByDrawLog,true);
  assert.equal(r.eligibleK0,false);
  assert.equal(r.sourceOwnHand,null);
  assert.equal(r.sourceOwnHandPrintings,null);
  assert.equal(r.sourceOpponentHandSize,null);
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

test('contradictory live source draw evidence fails closed and restores bot',()=>{
  const g=makeGame(0);
  g.options.runMatch=()=>{
    const fake={turn:1,activePlayer:0,phase:3,prompts:[],
      logs:[{message:'LOG_PLAYER_DRAWS_CARD',
        params:{name:'research-B'}}],
      players:[
        {name:'research-A',active:{getPokemonCard:()=>({name:'Oranguru V'})},
          hand:{cards:[]}},
        {name:'research-B',active:{getPokemonCard:()=>({name:'Shadow Rider V'})},
          hand:{cards:[]}}
      ]};
    return new g.AI().decodeNextAction(fake);
  };
  assert.throws(()=>screenRank11FirstTurn(g.options),/contradicts actual draw log/);
  assert.equal(g.AI.prototype.decodeNextAction,g.original);
});
