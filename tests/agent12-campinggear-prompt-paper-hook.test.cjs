'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {campingGearPaperVerdict,withPaperCampingGearPromptGuard}=
  require('../simulation/twinleaf/agent12-campinggear-prompt-paper-hook.cjs');

class ResolvePromptAction{
  constructor(result){this.id=42;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(cards,printing='Camping Gear BST'){
    this.id=42;this.result=undefined;
    this.player={deck:{cards}};
    this.cards=this.player.deck;
    this.sourceCard={fullName:printing};
  }
  validate(result){
    return Array.isArray(result)&&result.length<=1&&
      result.every(x=>this.cards.cards.includes(x));
  }
}
class MockStore{
  constructor(prompt){this.state={prompts:[prompt]};this.accepted=0;}
  dispatch(){this.accepted++;return this.state;}
}
const A=Object.freeze({name:'A'}),B=Object.freeze({name:'B'});

test('printed unrestricted search requires one despite native min zero',()=>{
  const state={prompts:[new ChooseCardsPrompt([A,B])]};
  const v=campingGearPaperVerdict(state,new ResolvePromptAction([]));
  assert.equal(v.applicable,true);
  assert.equal(v.nativeValid,true);
  assert.equal(v.paperValid,false);
});

test('native-invalid two-card choice is also paper-invalid',()=>{
  const state={prompts:[new ChooseCardsPrompt([A,B])]};
  const v=campingGearPaperVerdict(state,new ResolvePromptAction([A,B]));
  assert.equal(v.nativeValid,false);
  assert.equal(v.paperValid,false);
});

test('one owner-deck card accepted and original Store dispatch restored',()=>{
  const before=MockStore.prototype.dispatch,store=new MockStore(
    new ChooseCardsPrompt([A,B]));
  const x=withPaperCampingGearPromptGuard(
    ()=>store.dispatch(new ResolvePromptAction([A])),{Store:MockStore});
  assert.equal(x.audit.paperValidAccepted,1);
  assert.equal(x.audit.paperInvalidVetoed,0);
  assert.equal(store.accepted,1);
  assert.equal(MockStore.prototype.dispatch,before);
});

test('zero and two are vetoed before original Store mutates',()=>{
  for(const answer of [[],[A,B]]){
    const before=MockStore.prototype.dispatch,store=new MockStore(
      new ChooseCardsPrompt([A,B]));
    let caught=null;
    try{
      withPaperCampingGearPromptGuard(
        ()=>store.dispatch(new ResolvePromptAction(answer)),{Store:MockStore});
    }catch(error){caught=error;}
    assert.match(String(caught?.message),/PAPER_PROMPT_INVALID/);
    assert.equal(caught.agent12PaperPromptAudit.paperInvalidVetoed,1);
    assert.equal(store.accepted,0);
    assert.equal(MockStore.prototype.dispatch,before);
  }
});

test('other printed trainers and untagged prompts retain original behavior',()=>{
  const store=new MockStore(new ChooseCardsPrompt([A,B],'Other Trainer'));
  const x=withPaperCampingGearPromptGuard(
    ()=>store.dispatch(new ResolvePromptAction([A,B])),{Store:MockStore});
  assert.equal(x.audit.inspected,0);
  assert.equal(store.accepted,1);
});

test('source-stamped prompt may not search the wrong zone',()=>{
  const prompt=new ChooseCardsPrompt([A,B]);
  prompt.cards={cards:[A,B]};
  const state={prompts:[prompt]};
  const v=campingGearPaperVerdict(state,new ResolvePromptAction([A]));
  assert.equal(v.ownDeck,false);
  assert.equal(v.paperValid,false);
});

test('native count-only validator cannot certify a foreign physical card',()=>{
  const prompt=new ChooseCardsPrompt([A,B]);
  prompt.validate=answer=>Array.isArray(answer)&&answer.length===1;
  const foreign=Object.freeze({name:'FOREIGN'});
  const verdict=campingGearPaperVerdict({prompts:[prompt]},
    new ResolvePromptAction([foreign]));
  assert.equal(verdict.nativeValid,true);
  assert.equal(verdict.ownDeck,true);
  assert.equal(verdict.one,true);
  assert.equal(verdict.physicalCardInDeck,false);
  assert.equal(verdict.paperValid,false);
});

test('native false negative remains a separate native validation verdict',()=>{
  const prompt=new ChooseCardsPrompt([A,B]);
  prompt.validate=()=>false;
  const verdict=campingGearPaperVerdict({prompts:[prompt]},
    new ResolvePromptAction([A]));
  assert.equal(verdict.physicalCardInDeck,true);
  assert.equal(verdict.nativeValid,false);
  assert.equal(verdict.paperValid,true);
});

test('foreign selected physical card vetoes before the original Store',()=>{
  const prompt=new ChooseCardsPrompt([A,B]);
  prompt.validate=answer=>Array.isArray(answer)&&answer.length===1;
  const store=new MockStore(prompt);
  let error;
  try{
    withPaperCampingGearPromptGuard(()=>
      store.dispatch(new ResolvePromptAction([{name:'FOREIGN'}])),
      {Store:MockStore});
  }catch(caught){error=caught;}
  assert.match(error?.message??'',/PAPER_PROMPT_INVALID/);
  assert.equal(error.agent12PaperPromptAudit.paperInvalidVetoed,1);
  assert.equal(store.accepted,0);
});
