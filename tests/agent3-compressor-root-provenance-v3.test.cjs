'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withSourceCompressorRootProvenance}=
  require('../simulation/twinleaf/agent3-compressor-root-provenance-v3.cjs');

class AddPlayerAction {constructor(clientId){this.clientId=clientId;}}
class PlayCardAction {constructor(clientId,handIndex=0){this.clientId=clientId;this.handIndex=handIndex;}}
class ResolvePromptAction {constructor(cards){this.cards=cards;}}
class ChooseCardsPrompt {
  constructor(owner) {
    this.result=undefined;this.player=owner;this.cards=owner.deck;
    this.options={min:0,max:3};
  }
}
const card=(name,id)=>({name,id,fullName:name+' Test'});
function owner(id) {
  const lightning=card('Lightning Energy',id+10);
  const exeggcute=card('Exeggcute',id+11);
  return {id,hand:{cards:[card('Battle Compressor',id+1)]},
    supporter:{cards:[]},deck:{cards:[lightning,exeggcute]},
    discard:{cards:[]}};
}
class FakeStore {
  constructor(seat=0) {
    const players=[owner(101),owner(202)];
    this.state={players,activePlayer:seat,turn:1,prompts:[]};
  }
  dispatch(action) {
    if(action.fail)throw Error('rejected action');
    if(action instanceof PlayCardAction) {
      const active=this.state.players[this.state.activePlayer];
      const selected=active.hand.cards.splice(action.handIndex,1)[0];
      active.supporter.cards.push(selected);
      this.state.prompts.push(new ChooseCardsPrompt(active));
    }
    if(action instanceof ResolvePromptAction) {
      const active=this.state.players[this.state.activePlayer];
      const prompt=this.state.prompts.find(p=>p.result===undefined);
      for(const selected of action.cards) {
        const at=active.deck.cards.indexOf(selected);
        assert.ok(at>=0);
        active.deck.cards.splice(at,1);
        active.discard.cards.push(selected);
      }
      prompt.result=action.cards;
    }
    return 'accepted';
  }
}
function playCompressor(store,clientId) {
  store.dispatch(new PlayCardAction(clientId,0));
  const cards=store.state.players[store.state.activePlayer].deck.cards;
  store.dispatch(new ResolvePromptAction([...cards]));
}
test('ignores every speculative Store even when it pays a Compressor prompt',()=>{
  const root=new FakeStore(0);
  const original=FakeStore.prototype.dispatch;
  const observed=withSourceCompressorRootProvenance(0,()=>{
    root.dispatch(new AddPlayerAction(101));
    const speculative=new FakeStore(0);
    playCompressor(speculative,101);
    return root.dispatch(new AddPlayerAction(202));
  },{StoreClass:FakeStore});
  assert.equal(observed.audit.liveRootIdentified,true);
  assert.equal(observed.audit.selectedSourcePlays,0);
  assert.equal(observed.audit.positiveLinkedSettlements,0);
  assert.equal(observed.audit.receipts.length,0);
  assert.equal(observed.audit.ignoredSpeculativeDispatches,2);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
});
test('attributes genuine root card play to exactly its own settled prompt for both seats',()=>{
  for(const seat of [0,1]) {
    const root=new FakeStore(seat);
    const audit=withSourceCompressorRootProvenance(seat,()=>{
      root.dispatch(new AddPlayerAction(101));
      root.dispatch(new AddPlayerAction(202));
      playCompressor(root,seat===0?101:202);
    },{StoreClass:FakeStore}).audit;
    assert.equal(audit.selectedSourcePlays,1);
    assert.equal(audit.acceptedSourcePlays,1);
    assert.equal(audit.linkedPromptsIssued,1);
    assert.equal(audit.positiveLinkedSettlements,1);
    assert.deepEqual(audit.receipts[0].physicallyMoved.map(x=>x.name),
      ['Lightning Energy','Exeggcute']);
    assert.equal(audit.receipts[0].sameIssuedPrompt,true);
  }
});
test('other physical seat Compressor cannot count for owner',()=>{
  const root=new FakeStore(0);
  const audit=withSourceCompressorRootProvenance(1,()=>{
    root.dispatch(new AddPlayerAction(101));
    playCompressor(root,101);
  },{StoreClass:FakeStore}).audit;
  assert.equal(audit.selectedSourcePlays,0);
  assert.equal(audit.positiveLinkedSettlements,0);
});
test('unmatched owner-root prompt resolution cannot count without source PlayCardAction',()=>{
  const root=new FakeStore(0);
  const audit=withSourceCompressorRootProvenance(0,()=>{
    root.dispatch(new AddPlayerAction(101));
    const source=root.state.players[0];
    source.supporter.cards.push(source.hand.cards[0]);
    root.state.prompts.push(new ChooseCardsPrompt(source));
    root.dispatch(new ResolvePromptAction([...source.deck.cards]));
  },{StoreClass:FakeStore}).audit;
  assert.equal(audit.positiveLinkedSettlements,0);
  assert.equal(audit.receipts.length,0);
});
test('native exception restores original dispatch hook',()=>{
  const root=new FakeStore(0),original=FakeStore.prototype.dispatch;
  assert.throws(()=>withSourceCompressorRootProvenance(0,()=>{
    root.dispatch(new AddPlayerAction(101));
    root.dispatch({fail:true,constructor:{name:'PassTurnAction'}});
  },{StoreClass:FakeStore}),/rejected action/);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
});
