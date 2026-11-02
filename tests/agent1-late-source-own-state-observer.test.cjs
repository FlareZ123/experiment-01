'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,sourceOwnVisibleSnapshot,withLateSourceOwnState
}=require('../simulation/twinleaf/agent1-late-source-own-state-observer.cjs');

const prize=n=>Array.from({length:6},(_,i)=>({cards:i<n?[{}]:[]}));
const zone=(name,energies=[],attacks=[])=>({
  getPokemonCard:()=>({fullName:name,attacks}),
  energies:{cards:energies.map(fullName=>({fullName}))},
  tools:[],damage:0
});
function state(turn=31){
  return {turn,activePlayer:0,prompts:[],
    players:[
      {hand:{cards:[{fullName:'Dark Patch ASR'}]},
        active:zone('Mega Absol ex M1L',['Darkness Energy MEE'],[
          {name:'Claw of Darkness',cost:['DARK','DARK','COLORLESS'],damage:200}
        ]),bench:[zone('Oranguru V ASR')],prizes:prize(1)},
      {hand:{cards:[{fullName:'HIDDEN OPPONENT HAND'}]},
        active:zone('Shadow Rider Calyrex VMAX CRE'),
        bench:[],prizes:prize(6)}
    ]
  };
}
class PassTurnAction{}
class ItemAction{}
class MockStore{
  constructor(){this.state=state();}
  dispatch(action){
    if(action.constructor.name==='PassTurnAction'){
      this.state={...this.state,turn:this.state.turn+2};
    }
    return this.state.turn;
  }
}

test('only owner hand and public board are detached',()=>{
  const snap=sourceOwnVisibleSnapshot(state(),0);
  assert.equal(snap.turn,31);
  assert.equal(snap.sourceRemainingPrizes,1);
  assert.deepEqual(snap.sourceHand,['Dark Patch ASR']);
  assert.equal(snap.sourceActive.energyCards[0],'Darkness Energy MEE');
  assert.deepEqual(snap.sourceActiveNativeAttackCosts[0].cost,
    ['DARK','DARK','COLORLESS']);
  assert.equal(JSON.stringify(snap).includes('HIDDEN OPPONENT HAND'),false);
});

test('observer captures first and Pass decision without intervention and restores prototype',()=>{
  const old=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch');
  const reply=withLateSourceOwnState(()=>{
    const s=new MockStore();
    assert.equal(s.dispatch(new ItemAction()),31);
    assert.equal(s.dispatch(new PassTurnAction()),33);
    assert.equal(s.dispatch(new PassTurnAction()),35);
    return 'native-unmodified';
  },{Store:MockStore,seat:0,startTurn:31,endTurn:35});
  assert.equal(reply.result,'native-unmodified');
  assert.equal(reply.audit.version,VERSION);
  assert.deepEqual(reply.audit.firstByTurn.map(x=>x.turn),[31,33]);
  assert.deepEqual(reply.audit.beforePass.map(x=>x.turn),[31,33]);
  assert.equal(reply.audit.paperClockCertified,false);
  assert.deepEqual(Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch'),old);
});

test('observer retains native errors and restores',()=>{
  const old=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch');
  assert.throws(()=>withLateSourceOwnState(()=>{throw Error('real native abort');},
    {Store:MockStore}),/real native abort/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch'),old);
});
