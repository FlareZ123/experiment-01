'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withFrozenCandidateLilliePassProbe,
  VERSION
}=require('../simulation/twinleaf/agent7-frozen-candidate-lillie-pass-clone.cjs');

class AddPlayerAction {}
class PassTurnAction {
  constructor(clientId){this.clientId=clientId;}
}
class OtherAction {}
class FakeStore {
  constructor(candidateSeat,turn=4) {
    this.state={turn,activePlayer:candidateSeat,
      players:[{id:101},{id:202}]};
  }
  dispatch(action) { return action?.constructor?.name; }
}
const trials=[
  {id:'6:0:A:champion-reference',candidateSlot:'A',candidateId:'champion-reference',rank:6},
  {id:'6:0:A:new-moon-lockbreaker-v1',candidateSlot:'A',candidateId:'new-moon-lockbreaker-v1',rank:6},
  {id:'6:1:B:champion-reference',candidateSlot:'B',candidateId:'champion-reference',rank:6},
  {id:'6:1:B:new-moon-lockbreaker-v1',candidateSlot:'B',candidateId:'new-moon-lockbreaker-v1',rank:6}
];

test('exact two source-seat-B, candidate-seat-A turn-four passes are observed only',()=>{
  let probeCount=0;
  const all=[];
  const x=withFrozenCandidateLilliePassProbe(()=>{
    for(const row of trials){
      const seat=row.candidateSlot==='A'?0:1;
      const store=new FakeStore(seat);
      store.dispatch(new AddPlayerAction());
      store.dispatch(new AddPlayerAction());
      store.dispatch(new OtherAction());
      all.push(store.dispatch(new PassTurnAction(seat===0?101:202)));
      store.dispatch(new PassTurnAction(seat===0?101:202));
    }
    return 'four-games-completed';
  },trials,{
    store:{Store:FakeStore},
    probe:()=>{probeCount++;return {outcome:'NATIVE_LILLIE_SETTLED'};}
  });
  assert.equal(x.result,'four-games-completed');
  assert.equal(x.audit.observedGameCount,4);
  assert.equal(x.audit.schema,VERSION);
  assert.equal(x.audit.boundedNativePasses.length,2);
  assert.deepEqual(x.audit.boundedNativePasses.map(e=>e.trialId),
    trials.slice(0,2).map(t=>t.id));
  assert.ok(x.audit.boundedNativePasses.every(e=>
    e.nativePassAccepted && e.actualCandidateSeat===0));
  assert.equal(probeCount,2);
  assert.deepEqual(all,['PassTurnAction','PassTurnAction',
    'PassTurnAction','PassTurnAction']);
  assert.equal(x.audit.competitiveGameQualified,false);
});

test('no selected candidate pass gives no artificial native witness',()=>{
  const x=withFrozenCandidateLilliePassProbe(()=>{
    for(const t of trials){
      const seat=t.candidateSlot==='A'?0:1;
      const store=new FakeStore(seat,5);
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PassTurnAction(seat===0?101:202));
    }
    return 'no-eligible-pass';
  },trials,{store:{Store:FakeStore},probe:()=>{
    throw Error('Should never clone an unrelated root');
  }});
  assert.equal(x.audit.boundedNativePasses.length,0);
});

test('native action dispatch remains unchanged and descriptor restores on throw',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withFrozenCandidateLilliePassProbe(()=>{
    const s=new FakeStore(0);
    s.dispatch(new AddPlayerAction());
    throw Error('same-execution-native-failure');
  },trials,{store:{Store:FakeStore},probe:()=>({})}),
  /same-execution-native-failure/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),original);
});
