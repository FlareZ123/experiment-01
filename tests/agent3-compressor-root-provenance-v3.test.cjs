'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withSourceCompressorRootProvenance:observe}=
 require('../simulation/twinleaf/agent3-compressor-root-provenance-v3.cjs');
const {withSourceCompressorSettlementAudit:legacyObserve}=
 require('../simulation/twinleaf/agent3-compressor-discard-settlement.cjs');
class AddPlayerAction{constructor(clientId){this.clientId=clientId;}}
class PlayCardAction{constructor(id,handIndex=0){this.id=id;this.handIndex=handIndex;}}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class ChooseCardsPrompt{
 constructor(owner){this.id=11;this.result=undefined;this.player=owner;this.cards=owner.deck;this.options={min:0,max:3};}
}
const card=(name,id)=>({name,id,fullName:name+' fixture'});
class Store{
 constructor(seat=0){
  const p=(id)=>({hand:{cards:[card('Battle Compressor',id)]},
   supporter:{cards:[]},deck:{cards:[card('Lightning Energy',id+10)]},discard:{cards:[]}});
  this.state={players:[p(101),p(202)],activePlayer:seat,turn:1,prompts:[]};
 }
 dispatch(a){
  if(a.fail)throw Error('rejected');
  if(a instanceof PlayCardAction){
   const p=this.state.players[this.state.activePlayer];
   p.supporter.cards.push(p.hand.cards.splice(a.handIndex,1)[0]);
   this.state.prompts.push(new ChooseCardsPrompt(p));
  }
  if(a instanceof ResolvePromptAction){
   const p=this.state.players[this.state.activePlayer],prompt=this.state.prompts[0];
   assert.equal(a.id,prompt.id);
   for(const c of a.result){p.deck.cards.splice(p.deck.cards.indexOf(c),1);p.discard.cards.push(c);}
   prompt.result=a.result;
  }
 }
}
function play(store,id){
 store.dispatch(new PlayCardAction(id));
 store.dispatch(new ResolvePromptAction(11,[...store.state.players[store.state.activePlayer].deck.cards]));
}
test('both owner seats certify only their genuine root card-play and issued prompt',()=>{
 for(const seat of [0,1]){
  const store=new Store(seat);
  const r=observe(seat,()=>{
   store.dispatch(new AddPlayerAction(101));
   store.dispatch(new AddPlayerAction(202));
   play(store,seat===0?101:202);
  },{StoreClass:Store});
  assert.equal(r.audit.acceptedSourcePlays,1);
  assert.equal(r.audit.linkedPromptsIssued,1);
  assert.equal(r.audit.positiveLinkedSettlements,1);
  assert.equal(r.audit.receipts[0].physicallyMoved.length,1);
 }
});
test('speculative clone, unmatched prompt, and rejected action cannot fake real settlement',()=>{
 const store=new Store(0),before=Store.prototype.dispatch;
 const r=observe(0,()=>{
  store.dispatch(new AddPlayerAction(101));
  play(new Store(0),101);
  const owner=store.state.players[0];
  owner.supporter.cards.push(card('Battle Compressor',99));
  store.state.prompts.push(new ChooseCardsPrompt(owner));
  store.dispatch(new ResolvePromptAction(11,[...owner.deck.cards]));
 },{StoreClass:Store});
 assert.equal(r.audit.ignoredSpeculativeDispatches,2);
 assert.equal(r.audit.positiveLinkedSettlements,0);
 assert.strictEqual(Store.prototype.dispatch,before);
 assert.throws(()=>observe(0,()=>{
  store.dispatch(new AddPlayerAction(101));
  store.dispatch({fail:true});
 },{StoreClass:Store}),/rejected/);
 assert.strictEqual(Store.prototype.dispatch,before);
});

test('legacy broad observer fabricates positive receipt from a speculative Store clone',()=>{
 const store=new Store(0);
 const original=Store.prototype.dispatch;
 const nested=legacyObserve(0,()=>observe(0,()=>{
  store.dispatch(new AddPlayerAction(101));
  store.dispatch(new AddPlayerAction(202));
  const speculative=new Store(0);
  play(speculative,101);
 },{StoreClass:Store}),{StoreClass:Store});
 assert.equal(nested.audit.acceptedPositiveResolutions,1);
 assert.equal(nested.audit.physicalMovedCopies,1);
 assert.equal(nested.result.audit.liveRootIdentified,true);
 assert.equal(nested.result.audit.ignoredSpeculativeDispatches,2);
 assert.equal(nested.result.audit.acceptedSourcePlays,0);
 assert.equal(nested.result.audit.positiveLinkedSettlements,0);
 assert.strictEqual(Store.prototype.dispatch,original);
});

test('abort-side evidence remains partial and preserves actual root custody',()=>{
  const {sourceCompressorAbortAudit}=require(
    '../simulation/twinleaf/agent3-compressor-root-provenance-v3.cjs');
  const original=Store.prototype.dispatch;
  for(const seat of [0,1]){
    const live=new Store(seat);
    const failure=new Error('intentional native abort after a paid prompt');
    let thrown=null;
    try{
      observe(seat,()=>{
        live.dispatch(new AddPlayerAction(101));
        live.dispatch(new AddPlayerAction(202));
        play(live,seat===0?101:202);
        throw failure;
      },{StoreClass:Store});
    }catch(error){thrown=error;}
    assert.strictEqual(thrown,failure);
    const audit=sourceCompressorAbortAudit(thrown);
    assert.equal(audit?.executionDisposition,'NATIVE_ABORT');
    assert.equal(audit?.observationIsPartial,true);
    assert.equal(audit?.sourceSeat,seat);
    assert.equal(audit?.selectedSourcePlays,1);
    assert.equal(audit?.acceptedSourcePlays,1);
    assert.equal(audit?.linkedPromptsIssued,1);
    assert.equal(audit?.unresolvedLinkedPrompt,false);
    assert.equal(audit?.positiveLinkedSettlements,1);
    assert.equal(audit?.receipts.length,1);
    assert.equal(audit?.competitivelyQualified,false);
    assert.strictEqual(Store.prototype.dispatch,original);
  }
});

test('rejected owner root has selected but no accepted receipt at abort',()=>{
  const {sourceCompressorAbortAudit}=require(
    '../simulation/twinleaf/agent3-compressor-root-provenance-v3.cjs');
  const live=new Store(0);
  const original=Store.prototype.dispatch;
  const failed=new PlayCardAction(101);
  failed.fail=true;
  assert.throws(()=>observe(0,()=>{
    live.dispatch(new AddPlayerAction(101));
    live.dispatch(new AddPlayerAction(202));
    live.dispatch(failed);
  },{StoreClass:Store}),error=>{
    const audit=sourceCompressorAbortAudit(error);
    assert.equal(error.message,'rejected');
    assert.equal(audit?.selectedSourcePlays,1);
    assert.equal(audit?.acceptedSourcePlays,0);
    assert.equal(audit?.linkedPromptsIssued,0);
    assert.equal(audit?.positiveLinkedSettlements,0);
    assert.equal(audit?.unresolvedLinkedPrompt,false);
    return true;
  });
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('unsettled live prompt and clone-only settlement remain distinct on abort',()=>{
  const {sourceCompressorAbortAudit}=require(
    '../simulation/twinleaf/agent3-compressor-root-provenance-v3.cjs');
  const original=Store.prototype.dispatch;
  for(const cloneOnly of [false,true]){
    const live=new Store(0);
    const failure=new Error('test abort');
    assert.throws(()=>observe(0,()=>{
      live.dispatch(new AddPlayerAction(101));
      live.dispatch(new AddPlayerAction(202));
      if(cloneOnly)play(new Store(0),101);
      else live.dispatch(new PlayCardAction(101));
      throw failure;
    },{StoreClass:Store}),error=>{
      assert.strictEqual(error,failure);
      const audit=sourceCompressorAbortAudit(error);
      assert.equal(audit?.unresolvedLinkedPrompt,!cloneOnly);
      assert.equal(audit?.linkedPromptsIssued,cloneOnly?0:1);
      assert.equal(audit?.positiveLinkedSettlements,0);
      assert.equal(audit?.ignoredSpeculativeDispatches,cloneOnly?2:0);
      return true;
    });
    assert.strictEqual(Store.prototype.dispatch,original);
  }
});

test('nested error causes expose abort audit without conflating other errors',()=>{
  const {sourceCompressorAbortAudit}=require(
    '../simulation/twinleaf/agent3-compressor-root-provenance-v3.cjs');
  const live=new Store(0);
  let originalError;
  try{
    observe(0,()=>{
      live.dispatch(new AddPlayerAction(101));
      throw new Error('source failure');
    },{StoreClass:Store});
  }catch(error){originalError=error;}
  assert.ok(originalError);
  assert.strictEqual(sourceCompressorAbortAudit(
    new Error('outer wrapper',{cause:originalError})),
    originalError.nativeSourceCompressorRootAudit);
  assert.equal(sourceCompressorAbortAudit(new Error('unrelated')),null);
});

test('printed one-to-three Item discard bounds override native prompt max',()=>{
  for(const amount of [0,1,3,4]){
    const live=new Store(0);
    const deck=live.state.players[0].deck.cards;
    while(deck.length<4)deck.push(card('Basic Energy',100+deck.length));
    const observed=observe(0,()=>{
      live.dispatch(new AddPlayerAction(101));
      live.dispatch(new AddPlayerAction(202));
      live.dispatch(new PlayCardAction(101));
      const prompt=live.state.prompts[0];
      prompt.options={min:0,max:4};
      live.dispatch(new ResolvePromptAction(11,deck.slice(0,amount)));
    },{StoreClass:Store});
    assert.equal(observed.audit.receipts.length,1);
    const receipt=observed.audit.receipts[0];
    assert.equal(receipt.physicallyMoved.length,amount);
    assert.equal(receipt.paperMinimumMet,amount>=1&&amount<=3);
    assert.equal(receipt.printedMinimum,1);
    assert.equal(receipt.printedMaximum,3);
    assert.equal(receipt.nativePromptMinimum,0);
    assert.equal(receipt.nativePromptMaximum,4);
  }
});
