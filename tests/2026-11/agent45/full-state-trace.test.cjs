'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {snapshotFullState,createFullStateTraceRecorder,formatFullStateTrace}=
  require('../../../simulation/twinleaf/2026-11/agent45/full-state-trace.cjs');

test('snapshot preserves concealed zones, card identities, attack data and cycles without invoking getters',()=>{
  let getterCalls=0;
  const card={fullName:'Shadow Rider Calyrex VMAX CRE 75',name:'Shadow Rider Calyrex VMAX',attacks:[{name:'Max Geist',cost:['Psychic','Psychic']}]};
  const state={turn:4,phase:'PLAYER_TURN',players:[{id:101,deck:{cards:[card]},hand:{cards:[{fullName:'Psychic Energy MEE 13'}]},prizes:[{cards:[{fullName:"Boss's Orders PAL 172"}]}],active:{cards:[card],damage:50}}],prompts:[],logs:[{message:'draw'}]};
  state.self=state;
  Object.defineProperty(state,'dangerous',{enumerable:true,get(){getterCalls++;throw new Error('must not execute');}});
  const snap=snapshotFullState(state);
  const json=JSON.stringify(snap);
  assert.equal(getterCalls,0);
  assert.match(json,/Shadow Rider Calyrex VMAX CRE 75/);
  assert.match(json,/Psychic Energy MEE 13/);
  assert.match(json,/Boss's Orders PAL 172/);
  assert.match(json,/Max Geist/);
  assert.ok(json.includes('"$ref":1'));
  assert.ok(json.includes('"$type":"Accessor"'));
});

test('trace records initial state, every contiguous action, prompt, final logs and readable output',()=>{
  const recorder=createFullStateTraceRecorder({label:'diagnostic',seed:123});
  const initial={turn:1,players:[{hand:{cards:[{fullName:'Quick Ball FST 237'}]}}],logs:[]};
  recorder.captureInitial(initial);
  const after={turn:1,players:[{hand:{cards:[]},discard:{cards:[{fullName:'Quick Ball FST 237'}]}}],logs:[{message:'Quick Ball played'}]};
  recorder.captureStep({state:after,action:{kind:'PlayCardAction',card:{fullName:'Quick Ball FST 237'}},actionOrdinal:1,playerSlot:0,turnBefore:1,turnAfter:1,pendingPrompt:{message:'Choose a Pokémon'}});
  recorder.captureFinal(after);
  const trace=recorder.result();
  assert.equal(trace.complete,true);
  assert.equal(trace.stepCount,1);
  assert.equal(trace.steps[0].beforeState.kind,'initial');
  assert.match(JSON.stringify(trace.steps[0].afterState),/Quick Ball FST 237/);
  assert.match(JSON.stringify(trace.nativeLogs),/Quick Ball played/);
  const text=recorder.text();
  assert.match(text,/TWINLEAF OFFLINE FULL-STATE TRACE/);
  assert.match(text,/SELECTED ACTION/);
  assert.match(text,/Choose a Pokémon/);
  assert.match(formatFullStateTrace(trace),/FINAL NATIVE LOGS/);
});

test('trace rejects skipped action ordinals and marks bounded snapshots as truncated',()=>{
  const recorder=createFullStateTraceRecorder();
  recorder.captureInitial({turn:0,logs:[]});
  assert.throws(()=>recorder.captureStep({state:{},action:{},actionOrdinal:2}),/contiguous/);
  const snap=snapshotFullState({a:{b:{c:1}}},{maxDepth:1});
  assert.equal(snap.truncated,true);
});
