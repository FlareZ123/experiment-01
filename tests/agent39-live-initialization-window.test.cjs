'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {initializationSnapshot,withLiveInitializationWindow}=
  require('../simulation/twinleaf/agent39-live-initialization-window.cjs');

class AddPlayerAction {}
class StartTurnAction {}
class PassSourceAction {}
class BenchIronThornsAction {}
class PassCandidateAction {}

const iron={
  name:'Iron Thorns ex',fullName:'Iron Thorns ex TWM',
  powers:[{name:'Initialization'}]
};
const mewtwo={
  name:'Mewtwo & Mew-GX',fullName:'Mewtwo & Mew-GX UNM',
  powers:[{name:'Perfection'}],
  hasRuleBox:()=>true,hasTag:()=>false
};
const marshadow={
  name:'Marshadow',fullName:'Marshadow UNB',
  powers:[{name:'Resetting Hole'}],
  hasRuleBox:()=>false,hasTag:()=>false
};
const future={
  name:'Future target',fullName:'Future target TEST',
  powers:[{name:'Future Ability'}],
  hasRuleBox:()=>true,hasTag:tag=>tag==='FUTURE'
};
const slot=pokemon=>({getPokemonCard:()=>pokemon});

class FakeStore {
  constructor(candidateActive=mewtwo){
    this.state={
      turn:0,activePlayer:0,phase:0,prompts:[],
      players:[
        {active:slot(iron),bench:[slot(null)]},
        {active:slot(candidateActive),bench:[slot(marshadow),slot(future)]}
      ]
    };
  }
  dispatch(action){
    if(action instanceof StartTurnAction){
      this.state.turn=1;this.state.activePlayer=0;this.state.phase=1;
    }else if(action instanceof PassSourceAction){
      this.state.turn=2;this.state.activePlayer=1;
    }else if(action instanceof BenchIronThornsAction){
      this.state.players[0].active=slot(null);
      this.state.players[0].bench[0]=slot(iron);
    }else if(action instanceof PassCandidateAction){
      this.state.turn=3;this.state.activePlayer=0;
    }
    return action;
  }
}
const deps={
  Store:FakeStore,GamePhase:{PLAYER_TURN:1},futureTag:'FUTURE',
  isAbilityBlocked:(store,state,player,pokemon)=>{
    assert.ok(store instanceof FakeStore);
    assert.equal(player,state.players[1]);
    assert.equal(pokemon,mewtwo);
    return state.players[0].active.getPokemonCard()?.name==='Iron Thorns ex';
  },
  publicBoardSnapshot:state=>({
    sourceActive:state.players[0].active.getPokemonCard()?.name??null,
    candidateActive:state.players[1].active.getPokemonCard()?.name??null
  })
};

test('authentic source-first Store boundaries witness passive block then removal',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  let shadow=null;
  const result=withLiveInitializationWindow(()=>{
    const real=new FakeStore();
    real.dispatch(new AddPlayerAction());
    real.dispatch(new StartTurnAction());
    shadow=new FakeStore();
    shadow.dispatch(new StartTurnAction());
    shadow.dispatch(new PassSourceAction());
    shadow.dispatch(new BenchIronThornsAction());
    real.dispatch(new PassSourceAction());
    real.dispatch(new BenchIronThornsAction());
    real.dispatch(new PassCandidateAction());
    return real;
  },{},deps);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),
    original);
  assert.ok(shadow);
  assert.equal(result.audit.sourceTurn1.globalTurn,1);
  assert.equal(result.audit.sourceTurn1.sourceActiveIronThornsEx,true);
  assert.equal(result.audit.sourceTurn1.targetPrinting,mewtwo.fullName);
  assert.equal(result.audit.sourceTurn1.targetNativeAbilityBlocked,true);
  assert.equal(result.audit.sourceTurn1.entryAfterAction,'StartTurnAction');
  assert.equal(result.audit.candidateTurn2.globalTurn,2);
  assert.equal(result.audit.candidateTurn2.entryAfterAction,'PassSourceAction');
  assert.equal(result.audit.candidateTurn2.targetNativeAbilityBlocked,true);
  assert.equal(result.audit.sourceReturnTurn3.globalTurn,3);
  assert.equal(result.audit.sourceReturnTurn3.entryAfterAction,
    'PassCandidateAction');
  assert.equal(result.audit.sourceReturnTurn3.sourceActiveIronThornsEx,false);
  assert.equal(result.audit.sourceReturnTurn3.targetNativeAbilityBlocked,false);
  assert.equal(result.audit.passiveLockCausedByTurnOneRoot,false);
  assert.equal(result.audit.competitiveGameQualified,false);
  assert.equal(result.audit.genuineStoreOnly,true);
});

test('exclude Future and non-Rule-Box printed Abilities from target selection',()=>{
  const state=new FakeStore(future).state;
  state.players[1].bench=[slot(marshadow)];
  state.turn=1;
  state.phase=1;
  const snap=initializationSnapshot({},state,0,1,
    ()=>{throw Error('No eligible target may be probed');},
    deps.publicBoardSnapshot,'FUTURE');
  assert.equal(snap.sourceActiveIronThornsEx,true);
  assert.deepEqual(snap.eligibleRuleBoxPowerTargets,[]);
  assert.equal(snap.targetPrinting,null);
  assert.equal(snap.targetNativeAbilityBlocked,null);
});

test('source-first t1 evidence stays missing if source is the second player',()=>{
  const result=withLiveInitializationWindow(()=>{
    const real=new FakeStore();
    real.dispatch(new AddPlayerAction());
    real.dispatch(new StartTurnAction());
    real.dispatch(new PassSourceAction());
    return real;
  },{sourceSeat:1,candidateSeat:0},deps);
  assert.equal(result.audit.sourceTurn1,null);
  assert.equal(result.audit.candidateTurn2,null);
  assert.equal(result.audit.sourceReturnTurn3,null);
});

test('read-only hook is always restored after real Store errors',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withLiveInitializationWindow(()=>{
    const real=new FakeStore();
    real.dispatch(new AddPlayerAction());
    real.dispatch(new StartTurnAction());
    throw Error('native Store error');
  },{},deps),/native Store error/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),
    original);
});

test('public snapshot has no hidden opponent hand/deck/prize dependence',()=>{
  const real=new FakeStore();
  real.state.turn=2;real.state.activePlayer=1;
  real.state.players[0].hand={cards:['sealed-source-hand']};
  real.state.players[1].deck={cards:['sealed-candidate-deck']};
  const a=initializationSnapshot(real,real.state,0,1,
    deps.isAbilityBlocked,deps.publicBoardSnapshot,'FUTURE');
  real.state.players[0].hand.cards=['different-secret'];
  real.state.players[1].deck.cards=['different-secret'];
  const b=initializationSnapshot(real,real.state,0,1,
    deps.isAbilityBlocked,deps.publicBoardSnapshot,'FUTURE');
  assert.deepEqual(a,b);
  assert.deepEqual(a.eligibleRuleBoxPowerTargets,
    [{printing:mewtwo.fullName,powers:['Perfection']}]);
});
