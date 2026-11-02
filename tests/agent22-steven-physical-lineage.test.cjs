'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withSourceStevenPhysicalLineage}=
  require('../simulation/twinleaf/agent22-steven-physical-lineage.cjs');

class ChooseCardsPrompt{
  constructor(id,playerId,cards){
    this.id=id;this.playerId=playerId;this.cards=cards;
    this.message='CHOOSE_CARD_TO_HAND';
    this.options={min:0,max:3};
    this.result=undefined;
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class MockStore{
  constructor(sourceSeat,selected,duplicate){
    const owner={id:77,deck:{cards:[selected]},hand:{cards:[duplicate]},
      discard:{cards:[]},supporter:{cards:[{name:"Steven's Resolve"}]}};
    const opponent={id:99,deck:{cards:[]},hand:{cards:[{fullName:'Secret'}]},
      discard:{cards:[]},supporter:{cards:[]}};
    this.state={turn:4,players:sourceSeat===0?
      [owner,opponent]:[opponent,owner],
      prompts:[new ChooseCardsPrompt(31,owner.id,owner.deck)]};
    this.owner=owner;
  }
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const pending=this.state.prompts[0];
      for(const card of action.result){
        const index=this.owner.deck.cards.indexOf(card);
        assert.ok(index>=0);
        this.owner.deck.cards.splice(index,1);
        this.owner.hand.cards.push(card);
      }
      pending.result=action.result;
    }else if(action instanceof PlayCardAction){
      const [card]=this.owner.hand.cards.splice(action.handIndex,1);
      assert.ok(card);
      this.owner.discard.cards.push(card);
    }
    return true;
  }
}

for(const sourceSeat of [0,1]){
  test('physical card identity distinguishes same-print duplicates in seat '+sourceSeat,()=>{
    const selected={fullName:'Capture Energy RCL'};
    const duplicate={fullName:'Capture Energy RCL'};
    const store=new MockStore(sourceSeat,selected,duplicate);
    const original=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch');
    const wrapped=withSourceStevenPhysicalLineage(sourceSeat,()=>{
      assert.notStrictEqual(MockStore.prototype.dispatch,original.value);
      store.dispatch(new ResolvePromptAction(31,[selected]));
      // The previously held identical printing was never searched.
      store.dispatch(new PlayCardAction(77,0));
      // The actual selected physical copy is now the remaining card.
      store.dispatch(new PlayCardAction(77,0));
      return store.owner.discard.cards.length;
    },{Store:MockStore,authorizedStore:store});
    assert.equal(wrapped.result,2);
    assert.strictEqual(MockStore.prototype.dispatch,original.value);
    assert.equal(wrapped.audit.authenticatedLiveStore,true);
    assert.equal(wrapped.audit.nativeSearchPromptResolutions,1);
    assert.equal(wrapped.audit.nativeSettledSelectedPhysicalCards,1);
    assert.equal(wrapped.audit.physicalTokensLaterPlayed,1);
    assert.equal(wrapped.audit.nativeSourcePlayRootsOnTrackedCards,1);
    assert.equal(wrapped.audit.laterPlays.length,1);
    assert.equal(wrapped.audit.laterPlays[0].printing,'Capture Energy RCL');
    assert.equal(wrapped.audit.laterPlays[0].physicallyRemovedFromSourceHand,true);
    assert.ok(!JSON.stringify(wrapped.audit).includes('Secret'));
    assert.equal(wrapped.audit.competitiveGameQualified,false);
  });
}

test('native accepted empty Steven search is recorded without invented cards',()=>{
  const store=new MockStore(0,{fullName:'A'},{fullName:'B'});
  const result=withSourceStevenPhysicalLineage(0,()=>{
    store.dispatch(new ResolvePromptAction(31,[]));
  },{Store:MockStore,authorizedStore:store});
  assert.equal(result.audit.nativeSearchPromptResolutions,1);
  assert.equal(result.audit.searches[0].nativeSubmittedCards,0);
  assert.equal(result.audit.nativeSettledSelectedPhysicalCards,0);
  assert.equal(result.audit.physicalTokensLaterPlayed,0);
});

test('an unrelated speculative Store cannot contribute false physical roots',()=>{
  const source={fullName:'VS Seeker PHF'};
  const actual=new MockStore(0,source,{fullName:'Capture Energy RCL'});
  const copied={fullName:'VS Seeker PHF'};
  const speculative=new MockStore(0,copied,{fullName:'VS Seeker PHF'});
  const {audit}=withSourceStevenPhysicalLineage(0,()=>{
    speculative.dispatch(new ResolvePromptAction(31,[copied]));
    speculative.dispatch(new PlayCardAction(77,1));
    actual.dispatch(new ResolvePromptAction(31,[source]));
    actual.dispatch(new PlayCardAction(77,1));
  },{Store:MockStore,authorizedStore:actual});
  assert.equal(audit.nativeSearchPromptResolutions,1);
  assert.equal(audit.nativeSettledSelectedPhysicalCards,1);
  assert.equal(audit.physicalTokensLaterPlayed,1);
  assert.equal(audit.authenticatedLiveStore,true);
});

test('Store dispatcher is restored when native execution throws',()=>{
  const original=Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch');
  assert.throws(()=>withSourceStevenPhysicalLineage(0,()=>{
    throw new Error('native failure');
  },{Store:MockStore}),/native failure/);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(MockStore.prototype,'dispatch'),original);
});
