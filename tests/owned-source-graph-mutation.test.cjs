'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {snapshotOwnedGraph,compareOwnedGraphSnapshot}=
  require('../simulation/twinleaf/owned-source-graph-mutation.cjs');

test('stable cycles and repeated references count once without mutation',()=>{
  const shared={x:1},root={shared,copy:shared,arr:[shared]};
  shared.parent=root;
  const snap=snapshotOwnedGraph(root);
  assert.equal(snap.entries.size,3);
  const result=compareOwnedGraphSnapshot(snap);
  assert.equal(result.changedObjects,0);
  assert.equal(result.changedFields,0);
});

test('finds scalar, reference and new-property changes on original identities',()=>{
  const linked={health:300};
  const root={linked,flag:false,nested:[linked]};
  const snap=snapshotOwnedGraph(root);
  linked.health=290;
  root.flag=true;
  root.extra=1;
  root.nested.push({health:100});
  const result=compareOwnedGraphSnapshot(snap);
  assert.equal(result.changedFields,5);
  assert.equal(result.byKind['scalar-value'],3);
  assert.equal(result.byKind['added-property'],2);
  assert.equal(result.changedObjects,3);
  assert.deepEqual(result.examples.some(x=>
    x.path==='state.linked.health'&&x.kind==='scalar-value'),true);
});

test('own accessor functions are never invoked while taking snapshots',()=>{
  let calls=0;
  const nested={foo:1};
  const root={nested};
  Object.defineProperty(root,'danger',{
    enumerable:true,configurable:true,
    get(){calls++;throw new Error('unexpected accessor invocation');}
  });
  const snap=snapshotOwnedGraph(root);
  assert.equal(calls,0);
  Object.defineProperty(root,'danger',{
    value:1,writable:true,configurable:true,enumerable:true
  });
  const diff=compareOwnedGraphSnapshot(snap);
  assert.equal(calls,0);
  assert.equal(diff.byKind['descriptor-shape'],1);
});

test('prototype changes are observed even with identical own values',()=>{
  const root={a:1};
  const snap=snapshotOwnedGraph(root);
  Object.setPrototypeOf(root,null);
  const diff=compareOwnedGraphSnapshot(snap);
  assert.equal(diff.byKind.prototype,1);
});

test('an object reference replacement is distinct from equal content',()=>{
  const root={nested:{n:1}};
  const snap=snapshotOwnedGraph(root);
  root.nested={n:1};
  const diff=compareOwnedGraphSnapshot(snap);
  assert.equal(diff.byKind['reference-or-object-value'],1);
});
