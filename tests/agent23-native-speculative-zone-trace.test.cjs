'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {zoneLengths,observeNativeSpeculativeZoneTrace}=
  require('../simulation/twinleaf/agent23-native-speculative-zone-trace.cjs');
const {nativeTacticSequenceComparison}=
  require('../simulation/evaluation/agent50-bilateral-hidden-order-audit.cjs');

class MockTactic {
  simulateAction(state,action){
    const result=structuredClone(state);
    const player=result.players.find(p=>p.id===action.id);
    player.deck.cards.pop();
    player.hand.cards.push({id:9});
    return result;
  }
}
const game=()=>({turn:3,phase:1,activePlayer:0,players:[
  {id:101,hand:{cards:[{id:1}]},deck:{cards:[{id:2},{id:3}]},
    discard:{cards:[]},prizes:{cards:[{id:4}]},bench:[]},
  {id:202,hand:{cards:[{id:5}]},deck:{cards:[{id:6}]},
    discard:{cards:[]},prizes:{cards:[]},bench:[]}
]});

test('read-only native simulation trace preserves exact result and method',()=>{
  const state=game(),original=structuredClone(state);
  const tactic=new MockTactic();
  const bot={tactics:[tactic,tactic]};
  const initial=tactic.simulateAction,observed={};
  const action={id:101,handIndex:0,constructor:{name:'PlayCardAction'}};
  const out=observeNativeSpeculativeZoneTrace(bot,
    ()=>tactic.simulateAction(state,action),observed);
  assert.equal(tactic.simulateAction,initial);
  assert.deepEqual(state,original);
  assert.equal(out.players[0].deck.cards.length,1);
  assert.equal(out.players[0].hand.cards.length,2);
  assert.equal(observed.simulationCalls,1);
  assert.equal(observed.simulations.length,1);
  const saved=observed.simulations[0];
  assert.equal(saved.tactic,'MockTactic');
  assert.equal(saved.input.players[0].deck,2);
  assert.equal(saved.result.players[0].deck,1);
  assert.equal(saved.input.players[0].hand,1);
  assert.equal(saved.result.players[0].hand,2);
  assert.equal(saved.handIndex,0);
  assert.equal(saved.threw,false);
  assert.equal(saved.returnedState,true);
  assert.ok(!JSON.stringify(saved).includes('Opponent Darkness'));
  assert.deepEqual(zoneLengths(state),saved.input);
});

test('exception still restores tactic and reports unmodified source counts',()=>{
  const tactic={simulateAction(){throw Error('native failure')}};
  const original=tactic.simulateAction,observed={};
  assert.throws(()=>observeNativeSpeculativeZoneTrace({tactics:[tactic]},
    ()=>tactic.simulateAction(game(),{id:101}),observed),/native failure/);
  assert.equal(tactic.simulateAction,original);
  assert.equal(observed.simulationCalls,1);
  assert.equal(observed.simulations[0].threw,true);
  assert.equal(observed.simulations[0].returnedState,false);
});

test('trace limit drops only diagnostic records, never actual simulator calls',()=>{
  const state=game(),tactic=new MockTactic(),observed={};
  observeNativeSpeculativeZoneTrace({tactics:[tactic]},()=>{
    for(let i=0;i<5;i++)tactic.simulateAction(state,{id:101});
  },observed,{limit:2});
  assert.equal(observed.simulationCalls,5);
  assert.equal(observed.simulations.length,2);
});

test('native source/replay delta isolates first zone-count divergence',()=>{
  const before=zoneLengths(game());
  const changed=structuredClone(before);
  changed.players[0].deck++;
  const source={steps:[],rngCalls:40,simulations:[{
    tactic:'PlaySupporterTactic',actionType:'PlayCardAction',input:before
  }],simulationCalls:1};
  const replay={steps:[],rngCalls:41,simulations:[{
    tactic:'PlaySupporterTactic',actionType:'PlayCardAction',input:changed
  }],simulationCalls:1};
  const compared=nativeTacticSequenceComparison(source,replay);
  assert.equal(compared.simulationsObserved,true);
  assert.equal(compared.sameSimulations,false);
  assert.equal(compared.firstSimulationDivergence.index,0);
  assert.equal(compared.firstSimulationDivergence.source.input.players[0].deck,
    2);
  assert.equal(compared.firstSimulationDivergence.replay.input.players[0].deck,
    3);
  assert.equal(compared.sourceSpeculativeCalls,1);
  assert.equal(compared.replaySpeculativeCalls,1);
  assert.equal(compared.sameEvaluations,null);
});
