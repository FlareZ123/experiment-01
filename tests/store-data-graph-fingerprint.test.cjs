'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {storeDataGraphFingerprint} =
  require('../simulation/twinleaf/store-data-graph-fingerprint.cjs');

function makeStore() {
  class FakeState { constructor() {
    this.phase=2;
    this.turn=4;
    this.players=[{active:{damage:0,damageReductionNextTurn:0,
      preventDamageNextTurn:null,marker:{markers:[]}},
    cannotPlayToolCards:false,playLocksTurnsRemaining:0,
    pendingEndOfTurnEffects:[]}];
    this.logs=[{params:{timestamp:'12:30:02 AM'},message:1}];
    this.promptControllerId=undefined;
  }}
  const state=new FakeState();
  const store={
    state,
    promptItems:[{ids:[4],then:function onPrompt(results) {return results;}}],
    waitItems:[],
    logId:2,
    trainerPromptSources:new Map([[4,{card:{fullName:'Switch SVI'}}]]),
    handler:{onStateChange:()=>{}}
  };
  return store;
}

test('same separate graph gives matching digest without invoking functions',()=>{
  const one=makeStore(),two=makeStore();
  const before=storeDataGraphFingerprint(one);
  const after=storeDataGraphFingerprint(two);
  assert.equal(before.digest,after.digest);
  assert.equal(before.schema,'live-store-data-graph-except-logs-v1');
  assert.ok(before.nodes>5);
  assert.ok(before.opaqueFunctions>=1);
  assert.deepEqual(one.state.players[0].active.marker.markers,[]);
});

test('captures tool lock, reduction, deferred KO and prompt controller omissions',()=>{
  const originals=makeStore();
  const reference=storeDataGraphFingerprint(originals).digest;
  const mutations=[
    s=>{s.state.players[0].cannotPlayToolCards=true;},
    s=>{s.state.players[0].playLocksTurnsRemaining=1;},
    s=>{s.state.players[0].active.damageReductionNextTurn=30;},
    s=>{s.state.players[0].active.preventDamageNextTurn={maxDamage:100};},
    s=>{s.state.players[0].pendingEndOfTurnEffects=[{type:'knock_out'}];},
    s=>{s.state.promptControllerId=101;},
    s=>{s.state.players[0].active.marker.markers.push({name:'LOCK'});}
  ];
  for(const mutate of mutations) {
    const s=makeStore();
    mutate(s);
    assert.notEqual(storeDataGraphFingerprint(s).digest,reference);
  }
});

test('private callback queue and trainer prompt source differences are detected',()=>{
  const expected=storeDataGraphFingerprint(makeStore()).digest;
  const noCallback=makeStore();
  noCallback.promptItems=[];
  assert.notEqual(storeDataGraphFingerprint(noCallback).digest,expected);
  const noSource=makeStore();
  noSource.trainerPromptSources.clear();
  assert.notEqual(storeDataGraphFingerprint(noSource).digest,expected);
});

test('source-log clock text is normalized but log count remains checked',()=>{
  const first=makeStore(),second=makeStore();
  second.state.logs[0].params.timestamp='12:31:22 AM';
  assert.equal(storeDataGraphFingerprint(first).digest,
    storeDataGraphFingerprint(second).digest);
  second.state.logs.push({message:2});
  assert.notEqual(storeDataGraphFingerprint(first).digest,
    storeDataGraphFingerprint(second).digest);
});

test('repeated-object topology, cycles and sparse slots are covered',()=>{
  const a=makeStore(),b=makeStore();
  const shared={counter:1};
  a.state.extra=[shared,shared];
  b.state.extra=[{counter:1},{counter:1}];
  assert.notEqual(storeDataGraphFingerprint(a).digest,
    storeDataGraphFingerprint(b).digest);
  const cyclic=makeStore();
  cyclic.state.loop=cyclic.state;
  const digest=storeDataGraphFingerprint(cyclic).digest;
  assert.equal(digest,storeDataGraphFingerprint(cyclic).digest);
  const full=makeStore(),sparse=makeStore();
  full.state.extra=[undefined];
  sparse.state.extra=new Array(1);
  assert.notEqual(storeDataGraphFingerprint(full).digest,
    storeDataGraphFingerprint(sparse).digest);
});

test('fails closed on symbol-valued fields and unsupported built-ins',()=>{
  const a=makeStore();
  a.state.privateSymbol=Symbol('effect');
  assert.throws(()=>storeDataGraphFingerprint(a),/Symbol values/);
  const b=makeStore();
  b.state.buffer=new Uint8Array([1,2]);
  assert.throws(()=>storeDataGraphFingerprint(b),/Opaque built-in/);
});


test('explicit coverage limit: equal callback text can hide different lexical captures',()=>{
  const withCallback = choice => {
    const s=makeStore();
    s.promptItems=[{
      ids:[4],
      then:function chooseNext() {return choice;}
    }];
    return s;
  };
  const left=withCallback('knock_out');
  const right=withCallback('do_nothing');
  assert.notEqual(left.promptItems[0].then(),right.promptItems[0].then());
  assert.equal(storeDataGraphFingerprint(left).digest,
    storeDataGraphFingerprint(right).digest,
    'Function-source equality is insufficient to prove continuation equivalence');
});
