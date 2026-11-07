'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withProfessorResearchDrawSettlement}=require(
  '../simulation/twinleaf/agent2-professor-research-native-settlement.cjs');

function setup(mode='immediate'){
  const Research={fullName:"Professor's Research JTG"};
  const deck=Array.from({length:12},(_,i)=>({
    fullName:'Psychic Energy MEE',physicalIndex:i
  }));
  const owner={
    id:10,hand:{cards:[Research]},deck:{cards:[...deck]},
    supporter:{cards:[]},discard:{cards:[]},supporterTurn:0
  };
  const state={turn:30,activePlayer:0,players:[owner,{}]};
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(action.kind==='supporter'){
        owner.hand.cards.splice(0,1);
        owner.supporter.cards.push(Research);
        owner.supporterTurn=1;
        if(mode==='immediate')this.drawSeven();
      }else if(action.kind==='continue'&&mode!=='immediate'){
        this.drawSeven();
      }
      return 'accepted';
    }
    drawSeven(){
      const drawn=owner.deck.cards.splice(0,7);
      owner.hand.cards.push(...(mode==='impostor'?
        drawn.map(c=>({...c})):drawn));
    }
  }
  const root={kind:'supporter',token:{
    kind:'play-seeker-recovered-research',seat:0,handIndex:0,
    nativeStoreActionOrdinal:17
  }};
  return {Store,state,root,continuation:{kind:'continue'},
    getActionReceipt:x=>x.token??null};
}

test('actual observed Store mock records exact full physical draw',()=>{
  const x=setup();
  const original=x.Store.prototype.dispatch;
  const result=withProfessorResearchDrawSettlement(()=>{
    const store=new x.Store();
    assert.equal(store.dispatch(x.root),'accepted');
    return store.state.players[0].hand.cards.length;
  },{Store:x.Store,getActionReceipt:x.getActionReceipt});
  assert.equal(result.result,7);
  assert.strictEqual(x.Store.prototype.dispatch,original);
  assert.equal(result.audit.monitoredSelectedResearchActions,1);
  assert.equal(result.audit.exactSevenPhysicalDraws,1);
  assert.equal(result.audit.pendingAtExit,0);
  assert.equal(result.audit.observedReceipts[0].rootOrdinal,17);
  assert.equal(result.audit.observedReceipts[0].ownerPrivateDeckIdentitySerialized,false);
});

test('delayed owner prompt can settle exact same physical draw later',()=>{
  const x=setup('delayed');
  const audit=withProfessorResearchDrawSettlement(()=>{
    const store=new x.Store();
    store.dispatch(x.root);
    store.dispatch(x.continuation);
  },{Store:x.Store,getActionReceipt:x.getActionReceipt}).audit;
  assert.equal(audit.exactSevenPhysicalDraws,1);
  assert.equal(audit.pendingAtExit,0);
});

test('printing-equivalent impostor cannot pass physical effect closure',()=>{
  const x=setup('impostor');
  const audit=withProfessorResearchDrawSettlement(()=>{
    const store=new x.Store();
    store.dispatch(x.root);
    store.dispatch(x.continuation);
  },{Store:x.Store,getActionReceipt:x.getActionReceipt}).audit;
  assert.equal(audit.monitoredSelectedResearchActions,1);
  assert.equal(audit.exactSevenPhysicalDraws,0);
  assert.equal(audit.pendingAtExit,1);
});

test('non-actor actions are ignored and pinned Store restored',()=>{
  const x=setup();
  const original=x.Store.prototype.dispatch;
  const audit=withProfessorResearchDrawSettlement(()=>{
    new x.Store().dispatch({kind:'unrelated'});
  },{Store:x.Store,getActionReceipt:x.getActionReceipt}).audit;
  assert.strictEqual(x.Store.prototype.dispatch,original);
  assert.equal(audit.monitoredSelectedResearchActions,0);
  assert.equal(audit.pendingAtExit,0);
  assert.equal(audit.competitiveGameQualified,false);
});
