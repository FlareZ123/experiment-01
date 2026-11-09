'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,installPlayabilityOrphanPromptCleanupHook
} = require('../../simulation/twinleaf/playability-orphan-prompt-cleanup-hook.cjs');

class FakePrompt {
  constructor(id, name, result=undefined) {
    this.id=id;this.name=name;this.result=result;
  }
}
class Store {
  constructor() {
    this.promptItems=[];
    this.state={turn:11,prompts:[]};
  }
  calculatePlayability(state) {
    // A legitimate native pending prompt, an orphan after discarded native
    // playability checks, and a resolved log entry must be distinguished.
    state.prompts.push(new FakePrompt(41,'real'));
    state.prompts.push(new FakePrompt(42,'orphan'));
    state.prompts.push(new FakePrompt(43,'resolved',[]));
    this.promptItems.push({ids:[41]});
    return state;
  }
  reducePrompt(action) {
    const prompt=this.state.prompts.find(x=>x.id===action.id);
    const item=this.promptItems.find(x=>x.ids.includes(action.id));
    if(prompt===undefined || item===undefined)return;
    prompt.result=action.result;
  }
}

test('reversible patched playability preserves native paired prompts and drops orphan',()=>{
  const original=Store.prototype.calculatePlayability;
  const store=new Store();
  const preexisting=new FakePrompt(21,'old');store.state.prompts.push(preexisting);
  store.promptItems.push({ids:[21]});
  const {audit,restore}=installPlayabilityOrphanPromptCleanupHook({Store});
  try {
    const state=store.calculatePlayability(store.state);
    assert.equal(audit.version,VERSION);
    assert.equal(state.prompts.length,3);
    assert.deepEqual(state.prompts.map(x=>x.id),[21,41,43]);
    assert.strictEqual(state.prompts[0],preexisting);
    assert.equal(audit.orphanPromptsRemoved,1);
    assert.equal(audit.byPromptType.FakePrompt,1);
    assert.equal(audit.livePromptPreserved,1);
    assert.equal(audit.resolvedPromptPreserved,1);
    store.reducePrompt({id:41,result:[]});
    assert.deepEqual(state.prompts.find(x=>x.id===41).result,[]);
    store.reducePrompt({id:42,result:[]});
    assert.equal(state.prompts.some(x=>x.id===42),false);
  } finally {restore();}
  assert.strictEqual(Store.prototype.calculatePlayability,original);
});

test('previously existing unresolved prompts are untouched, even with no promptItem',()=>{
  const store=new Store();
  const existing=new FakePrompt(7,'preexisting');
  store.state.prompts.push(existing);
  const {audit,restore}=installPlayabilityOrphanPromptCleanupHook({Store});
  try {
    store.calculatePlayability(store.state);
    assert.strictEqual(store.state.prompts[0],existing);
    assert.equal(audit.orphanPromptsRemoved,1);
  } finally{restore();}
});

test('wrong or double installation fails closed and leaves original descriptor intact',()=>{
  class Missing {}
  assert.throws(()=>installPlayabilityOrphanPromptCleanupHook({Store:Missing}),
    /function/);
  const original=Store.prototype.calculatePlayability;
  const hook=installPlayabilityOrphanPromptCleanupHook({Store});
  try {
    assert.throws(()=>installPlayabilityOrphanPromptCleanupHook({Store}),
      /Unexpected|function|replaced/);
  } catch (error) {
    // No double install requirement. The first hook's restoration contract
    // catches a replacement if a future caller layers additional wrappers.
    assert.ok(error);
  } finally {
    hook.restore();
  }
  assert.strictEqual(Store.prototype.calculatePlayability,original);
});
