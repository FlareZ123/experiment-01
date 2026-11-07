'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {PRINTS}=require('../simulation/evaluation/agent6-copycat-source-zone-observer.cjs');
const {createRealStoreCopycatRootCapture}=
  require('../simulation/evaluation/agent6-copycat-root-state-capture.cjs');
const card=fullName=>({fullName});
const zone=(cards=[])=>({cards});
const source=()=>({
 hand:zone([card(PRINTS.seal)]),active:zone([card(PRINTS.shadowRiderV)]),
 bench:[zone([card(PRINTS.mimikyu)])],
 prizes:[zone([card(PRINTS.dialga)]),...Array.from({length:5},()=>zone([card('Ordinary')]))],
 deck:zone([card(PRINTS.ball),card(PRINTS.shadowRiderV),card(PRINTS.shadowRiderV)]),
 discard:zone(),lostzone:zone(),stadium:zone(),supporter:zone()
});
const realStore=()=>({state:{phase:1,turn:0,prompts:[],players:[source(),{}]},
  calls:[],dispatch(a){this.calls.push(a);return a;}});

test('bind only one real Store, wait for stable first root, detach before native dispatch',()=>{
 const capture=createRealStoreCopycatRootCapture(0,3),store=realStore();
 const originalDispatch=store.dispatch;
 capture.onRootStoreCreated(store);
 assert.throws(()=>capture.onRootStoreCreated(realStore()));
 store.dispatch('setup-1');assert.equal(capture.result(),null);
 store.state={...store.state,phase:2,turn:1,prompts:[{id:2}]};
 store.dispatch('prompt');assert.equal(capture.result(),null);
 store.state.prompts=[];
 store.dispatch('first-real-action');
 assert.equal(store.dispatch,originalDispatch);
 assert.deepEqual(store.calls,['setup-1','prompt','first-real-action']);
 assert.equal(capture.result().physicalLocations.ball,'deck');
 assert.equal(capture.audit().actualStoreDispatchesUntilCapture,3);
 assert.equal(capture.audit().instanceWrapperDetached,true);
 store.state.players[0].deck.cards[0].fullName='MUTATED';
 store.dispatch('second-real-action');
 assert.equal(capture.result().physicalLocations.ball,'deck');
 assert.equal(capture.audit().actualStoreDispatchesUntilCapture,3);
});

test('speculative Store does not trigger real instance hook',()=>{
 const capture=createRealStoreCopycatRootCapture(0,3),actual=realStore(),other=realStore();
 capture.onRootStoreCreated(actual);
 other.state.phase=2;other.state.turn=1;other.dispatch('other');
 assert.equal(capture.result(),null);
 actual.state.phase=2;actual.state.turn=1;actual.dispatch('root');
 assert.ok(capture.result());
 assert.equal(capture.audit().actualStoreDispatchesUntilCapture,1);
});

test('source printing integrity fails before first real action',()=>{
 const capture=createRealStoreCopycatRootCapture(0,3),store=realStore();
 capture.onRootStoreCreated(store);
 store.state.phase=2;store.state.turn=1;
 store.state.players[0].deck.cards.push(card(PRINTS.ball));
 assert.throws(()=>store.dispatch('root'));
 assert.equal(capture.audit().instanceWrapperDetached,false);
 assert.deepEqual(store.calls,[]);
});
