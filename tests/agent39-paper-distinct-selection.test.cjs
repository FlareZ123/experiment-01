'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {duplicatePhysicalChoiceReason,withDistinctPhysicalCardSelectionVeto,
  REASON}=require('../simulation/twinleaf/agent39-paper-distinct-selection.cjs');

class ChooseCardsPrompt{
  constructor(id,cards){this.id=id;this.cards={cards};this.result=undefined;}
}
class OtherPrompt{
  constructor(id){this.id=id;this.result=undefined;}
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class AddPlayerAction{}
class Store{
  constructor(){this.state={prompts:[]};this.calls=0;}
  dispatch(action){
    this.calls++;
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      prompt.result=action.result;
    }
  }
}
test('same-name distinct physical cards accepted, duplicate object rejected',()=>{
  const a={name:'Psychic Energy'},b={name:'Psychic Energy'};
  const prompt=new ChooseCardsPrompt(1,[a,b]);
  assert.equal(duplicatePhysicalChoiceReason(prompt,[a,a]),REASON);
  assert.equal(duplicatePhysicalChoiceReason(prompt,[a,b]),null);
  assert.equal(duplicatePhysicalChoiceReason(prompt,[a]),null);
  assert.equal(duplicatePhysicalChoiceReason(prompt,[]),null);
  assert.equal(duplicatePhysicalChoiceReason(new OtherPrompt(1),[a,a]),null);
});
test('Store veto occurs before prompt mutation; valid same-name reply succeeds',()=>{
  const store=new Store(),a={name:'Trainer'},b={name:'Trainer'};
  const prompt=new ChooseCardsPrompt(1,[a,b]);
  store.state.prompts.push(prompt);
  const before=Store.prototype.dispatch;
  const report=withDistinctPhysicalCardSelectionVeto(()=>{
    assert.throws(()=>store.dispatch(new ResolvePromptAction(1,[a,a])),
      /PAPER_PROMPT_INVALID:DUPLICATE_PHYSICAL_CARD_SELECTION/);
    assert.equal(prompt.result,undefined);
    assert.equal(store.calls,0);
    store.dispatch(new ResolvePromptAction(1,[a,b]));
    assert.deepEqual(prompt.result,[a,b]);
    assert.equal(store.calls,1);
    return true;
  },{Store});
  assert.equal(report.audit.totalChooseCardAttempts,2);
  assert.equal(report.audit.negativePaperVetoes,1);
  assert.equal(report.audit.liveNegativePaperVetoes,0);
  assert.equal(Store.prototype.dispatch,before);
});
test('live and auxiliary counts isolated, and unrelated prompt remains unverified',()=>{
  const live=new Store(),aux=new Store(),a={name:'A'};
  const lp=new ChooseCardsPrompt(3,[a]),ap=new ChooseCardsPrompt(3,[a]);
  live.state.prompts.push(lp);aux.state.prompts.push(ap);
  const report=withDistinctPhysicalCardSelectionVeto(()=>{
    live.dispatch(new AddPlayerAction());
    assert.throws(()=>aux.dispatch(new ResolvePromptAction(3,[a,a])),/PAPER_PROMPT_INVALID/);
    assert.throws(()=>live.dispatch(new ResolvePromptAction(3,[a,a])),/PAPER_PROMPT_INVALID/);
    live.state.prompts.push(new OtherPrompt(4));
    live.dispatch(new ResolvePromptAction(4,[a,a]));
  },{Store});
  assert.equal(report.audit.nativeLiveStoreObserved,true);
  assert.equal(report.audit.liveNegativePaperVetoes,1);
  assert.equal(report.audit.negativePaperVetoes,2);
  assert.equal(report.audit.liveChooseCardAttempts,1);
  assert.equal(report.audit.auxiliaryChooseCardAttempts,1);
});
