'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withLiveGarbodorAbilityWindow}=
  require('../simulation/twinleaf/agent41-live-garbotoxin-ability-window.cjs');

class AddPlayerAction {}
class AdvanceTurnAction {}
class RemoveGarbodorToolAction {}

class FakeStore {
  constructor(){
    const lunatone={name:'Lunatone',fullName:'Lunatone OBF',
      powers:[{name:'New Moon'}]};
    const garbodor={fullName:'Garbodor BKP'};
    const empty={getPokemonCard:()=>null,tools:[]};
    this.state={
      turn:1,activePlayer:0,phase:0,prompts:[],
      players:[
        {active:empty,bench:[{getPokemonCard:()=>garbodor,
          tools:[{name:'Float Stone'}]}]},
        {active:{getPokemonCard:()=>lunatone},bench:[]}
      ]
    };
  }
  dispatch(action){
    if(action instanceof AdvanceTurnAction){
      this.state.turn=2;
      this.state.activePlayer=1;
      this.state.phase=1;
    }
    if(action instanceof RemoveGarbodorToolAction){
      this.state.players[0].bench[0].tools=[];
    }
    return action;
  }
}

const injected={
  Store:FakeStore,
  GamePhase:{PLAYER_TURN:1},
  isAbilityBlocked:(store,state)=>{
    assert.ok(store instanceof FakeStore);
    return state.players[0].bench[0].tools.length>0;
  },
  publicBoardSnapshot:state=>[
    {garbodorTools:state.players[0].bench[0].tools.length},
    {candidateActive:state.players[1].active.getPokemonCard().name}
  ]
};

test('actual game Store captures New Moon blocked before owner Tool removal and free after',()=>{
  const original=FakeStore.prototype.dispatch;
  let shadow;
  const response=withLiveGarbodorAbilityWindow(()=>{
    const real=new FakeStore();
    real.dispatch(new AddPlayerAction());
    real.dispatch(new AdvanceTurnAction());
    shadow=new FakeStore();
    shadow.dispatch(new RemoveGarbodorToolAction());
    real.dispatch(new RemoveGarbodorToolAction());
    return real;
  },{sourceSeat:0,candidateSeat:1,turn:2},injected);
  assert.equal(FakeStore.prototype.dispatch,original);
  assert.equal(response.audit.before.action,'AdvanceTurnAction');
  assert.equal(response.audit.after.action,'RemoveGarbodorToolAction');
  assert.equal(response.audit.before.sourceGarbodorHasTool,true);
  assert.equal(response.audit.after.sourceGarbodorHasTool,false);
  assert.equal(response.audit.before.candidateGenericAbilityBlocked,true);
  assert.equal(response.audit.after.candidateGenericAbilityBlocked,false);
  assert.deepEqual(response.audit.before.candidatePrintedPowerNames,['New Moon']);
  assert.deepEqual(response.audit.before.candidatePrintedPowerChecks,
    [{name:'New Moon',blocked:true}]);
  assert.deepEqual(response.audit.after.candidatePrintedPowerChecks,
    [{name:'New Moon',blocked:false}]);
  assert.equal(response.audit.before.candidateActive,'Lunatone OBF');
  assert.equal(response.audit.before.publicBoard[0].garbodorTools,1);
  assert.equal(response.audit.after.publicBoard[0].garbodorTools,0);
  assert.equal(response.audit.realStoreOnly,true);
  assert.equal(shadow.state.players[0].bench[0].tools.length,0);
  assert.equal(response.result.state.players[0].bench[0].tools.length,0);
});

test('unseen Tools and non-player phases cannot invent a before/after pair',()=>{
  const response=withLiveGarbodorAbilityWindow(()=>{
    const real=new FakeStore();
    real.dispatch(new AddPlayerAction());
    real.dispatch(new RemoveGarbodorToolAction());
    real.dispatch(new AdvanceTurnAction());
    return real;
  },undefined,injected);
  assert.equal(response.audit.before,null);
  assert.equal(response.audit.after,null);
});

test('a failing real Store restores the exact original prototype descriptor',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withLiveGarbodorAbilityWindow(()=>{
    const real=new FakeStore();
    real.dispatch(new AddPlayerAction());
    throw new Error('intentional game failure');
  },undefined,injected),/intentional game failure/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),
    original);
});
