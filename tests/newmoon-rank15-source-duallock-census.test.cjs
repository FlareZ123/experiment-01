'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {observeSourceLock}=require(
  '../simulation/twinleaf/newmoon-rank15-source-duallock-census.cjs');

/** @param {string|null} name */
const pokemon=name=>({
  getPokemonCard:()=>name?{fullName:name}:null,
  cards:name?[{fullName:name}]:[],
  tools:[],
  energies:{cards:[]}
});
/** @param {string} active @param {string[]} bench */
const player=(active,bench)=>({
  active:pokemon(active),
  bench:bench.map(pokemon),
  prizes:Array.from({length:6},()=>({cards:[{fullName:'Pidgey FLF'}]})),
  hand:{cards:[]},deck:{cards:[]}
});

class AddPlayerAction {}
class PlayCardAction {}
class PassTurnAction {}
class MockStore {
  /** @param {object} state */
  constructor(state){this.state=state}
  /** @param {object} action */
  dispatch(action){
    if(action.nextState)this.state=action.nextState;
    return this.state;
  }
}

/** @param {string} ownActive */
function board(ownActive='Mewtwo & Mew-GX UNM'){
  return {
    players:[
      player('Vileplume BUS',['Vileplume AOR']),
      player(ownActive,['Duskull VIV'])
    ],
    turn:6,activePlayer:1
  };
}

test('root-only post-dispatch observation records dual board and Stage1 exposure',()=>{
  const original=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch').value;
  const store=new MockStore({players:[player('Oddish UNB',[])]});
  const spec=new MockStore(board('Dusclops SFA'));
  const result=observeSourceLock(MockStore,0,1,()=>{
    store.dispatch(new AddPlayerAction());
    spec.dispatch(new PlayCardAction());
    store.dispatch(Object.assign(new PlayCardAction(),{
      nextState:board('Mewtwo & Mew-GX UNM')
    }));
    store.dispatch(Object.assign(new PassTurnAction(),{
      nextState:board('Dusclops SFA')
    }));
    return 'executed';
  });
  assert.equal(result.result,'executed');
  assert.equal(result.rootSnapshots,2);
  assert.equal(result.first.dual.turn,6);
  assert.equal(result.first.dusclopsAgainstDual.action,'PassTurnAction');
  assert.equal(result.first.dusclopsAgainstDual.ordinal,2);
  assert.equal(result.max.aorCount,1);
  assert.equal(result.max.busCount,1);
  assert.equal(result.max.dusclopsCount,1);
  assert.equal(result.max.sourceStageLineSlots,2);
  assert.equal(result.first.twoSourceStageLineSlots.sourceStageLineSlots,2);
  assert.equal(result.first.fullSourceBenchBelowTwoStageLines,null);
  assert.equal(MockStore.prototype.dispatch,original);
});

test('root Store dispatch method is restored after an exception',()=>{
  const original=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch').value;
  assert.throws(()=>observeSourceLock(MockStore,0,1,()=>{
    const source=new MockStore(board());
    source.dispatch(new AddPlayerAction());
    throw new Error('deliberate source failure');
  }),/deliberate source failure/);
  assert.equal(MockStore.prototype.dispatch,original);
});

test('source-only initial six-Prize gate is annotated and leaves zones unchanged',()=>{
  const initial=board('Mewtwo & Mew-GX UNM');
  initial.phase=2;
  initial.players[0].prizes[0].cards[0].fullName='Gloom UNB';
  const before=JSON.stringify(initial);
  const store=new MockStore(initial);
  const result=observeSourceLock(MockStore,0,1,()=>{
    store.dispatch(new AddPlayerAction());
    return 'unchanged';
  });
  assert.equal(result.result,'unchanged');
  assert.equal(result.firstNormalTurnPrizeGate.beforeTakingPrizesEligible,false);
  assert.equal(result.firstNormalTurnPrizeGate.gloomPrized,1);
  assert.equal(JSON.stringify(store.state),before);
});

test('detect authentic full Bench with only one stage-chain position',()=>{
  const original=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch').value;
  const store=new MockStore({players:[player('Oddish UNB',[])]});
  const stageStarved={
    players:[
      player('Bunnelby PRC',
        ['Oddish UNB','Budew ASC','Pidgey FLF','Buneary M2','Fan Rotom SCR']),
      player('Mewtwo & Mew-GX UNM',[])
    ],
    turn:4,activePlayer:0
  };
  const result=observeSourceLock(MockStore,0,1,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(Object.assign(new PlayCardAction(),{nextState:stageStarved}));
    return 'observed';
  });
  assert.equal(result.result,'observed');
  assert.equal(result.first.fullSourceBenchBelowTwoStageLines.turn,4);
  assert.equal(result.first.fullSourceBenchBelowTwoStageLines.sourceStageLineSlots,1);
  assert.equal(result.first.fullSourceBenchBelowTwoStageLines.occupiedSourceBench,5);
  assert.equal(result.first.twoSourceStageLineSlots,null);
  assert.equal(result.max.sourceStageLineSlots,1);
  assert.equal(MockStore.prototype.dispatch,original);
});

test('source root observer separates Bunnelby Active from Tool and Energy readiness',()=>{
  const original=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch').value;
  const store=new MockStore({players:[player('Oddish UNB',[])]});
  const state={
    players:[player('Bunnelby PRC',['Oddish UNB']),
      player('Mewtwo & Mew-GX UNM',[])],
    turn:4,activePlayer:0
  };
  state.players[0].active.tools=[{fullName:'Technical Machine: Evolution PAR'}];
  state.players[0].active.energies.cards=[{fullName:'Jet Energy PAL'}];
  const result=observeSourceLock(MockStore,0,1,()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(Object.assign(new PlayCardAction(),{nextState:state}));
    return 'observed';
  });
  assert.equal(result.result,'observed');
  assert.equal(result.first.sourceBunnelbyActive.turn,4);
  assert.deepEqual(result.first.sourceBunnelbyActiveWithTM.activeToolNames,
    ['Technical Machine: Evolution PAR']);
  assert.deepEqual(result.first.sourceBunnelbyActiveWithTMAndEnergy.activeEnergyNames,
    ['Jet Energy PAL']);
  assert.equal(MockStore.prototype.dispatch,original);
});
