'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {withFirstLiveGuzmaMode0}=
  require('../simulation/twinleaf/agent24-live-source-gh-modal-fork.cjs');
const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(base,name));

test('one real pending source G&H noncancelable mode is changed, exactly once',()=>{
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {SelectOptionPrompt}=load('game/store/prompts/select-option-prompt');
  const old=SimpleTacticsAi.prototype.decodeNextAction;
  SimpleTacticsAi.prototype.decodeNextAction=()=>new ResolvePromptAction(17,null);
  const prompt=new SelectOptionPrompt(101,'CHOOSE_OPTION',[
    'Search for a Stadium card from your deck',
    'Discard 2 cards for a Special Energy and Tool'
  ],{allowCancel:false,defaultValue:0});
  prompt.id=17;
  const state={turn:5,prompts:[prompt]};
  try{
    const selected=withFirstLiveGuzmaMode0(0,true,()=>{
      const bot={client:{id:101}};
      return [
        SimpleTacticsAi.prototype.decodeNextAction.call(bot,state).result,
        SimpleTacticsAi.prototype.decodeNextAction.call(bot,state).result
      ];
    });
    assert.deepEqual(selected.result,[0,null]);
    assert.equal(selected.audit.correctedNativeDecisions,1);
    assert.equal(selected.audit.firstObserved.turn,5);
    assert.deepEqual(selected.audit.firstObserved.offeredValues,prompt.values);
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction.toString(),
      (()=>new ResolvePromptAction(17,null)).toString());
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=old;
  }
});

test('noncandidate actor and cancelable prompt stay unchanged; throw restores',()=>{
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {SelectOptionPrompt}=load('game/store/prompts/select-option-prompt');
  const old=SimpleTacticsAi.prototype.decodeNextAction;
  const prior=()=>new ResolvePromptAction(17,null);
  SimpleTacticsAi.prototype.decodeNextAction=prior;
  const mandatory=new SelectOptionPrompt(101,'CHOOSE_OPTION',
    ['Search for a Stadium card from your deck'],{allowCancel:false});
  mandatory.id=17;
  const cancelable=new SelectOptionPrompt(101,'CHOOSE_OPTION',
    ['Search for a Stadium card from your deck'],{allowCancel:true});
  cancelable.id=17;
  try{
    const other=withFirstLiveGuzmaMode0(1,true,()=>
      SimpleTacticsAi.prototype.decodeNextAction.call(
        {client:{id:101}},{turn:6,prompts:[mandatory]}).result);
    assert.equal(other.result,null);
    assert.equal(other.audit.correctedNativeDecisions,0);
    const permitted=withFirstLiveGuzmaMode0(0,true,()=>
      SimpleTacticsAi.prototype.decodeNextAction.call(
        {client:{id:101}},{turn:6,prompts:[cancelable]}).result);
    assert.equal(permitted.result,null);
    assert.equal(permitted.audit.correctedNativeDecisions,0);
    assert.throws(()=>withFirstLiveGuzmaMode0(0,true,()=>{
      throw new Error('native root rejection');
    }),/native root rejection/);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,prior);
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=old;
  }
});
