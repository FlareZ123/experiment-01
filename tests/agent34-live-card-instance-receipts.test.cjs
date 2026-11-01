'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withLiveCardInstanceReceipts}=require(
  '../simulation/twinleaf/agent34-live-card-instance-receipts.cjs');

class AddPlayerAction{}
class PlayCardAction{
  constructor(clientId,handIndex){
    this.clientId=clientId;this.handIndex=handIndex;
  }
}
class Store{
  constructor(players){this.state={players};this.actions=[];}
  dispatch(action){
    this.actions.push(action.constructor.name);
    if(action.constructor.name==='PlayCardAction'){
      const p=this.state.players.find(p=>p.id===action.clientId);
      if(action.handIndex<0)throw Error('bad physical hand index');
      p.hand.cards.splice(action.handIndex,1);
    }
    return 'accepted';
  }
}
function cardClass(){
  return class Card{
    constructor(){this.fullName='Roxie CEC 205';this.name='Roxie';}
    reduceEffect(){}
  };
}
const owner=(id,cards=[])=>({id,hand:{cards}});

test('capture exact printing from real native hand before consumed',()=>{
  const C=cardClass();
  const players=[owner(101,[new C()]),owner(202,[])];
  const prior=Store.prototype.dispatch;
  const {audit}=withLiveCardInstanceReceipts(()=>{
    const store=new Store(players);
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(101,0));
  },{Store});
  assert.strictEqual(Store.prototype.dispatch,prior);
  assert.equal(players[0].hand.cards.length,0);
  assert.equal(audit.acceptedPlayCardRoots,1);
  assert.equal(audit.accepted[0].printing,'Roxie CEC 205');
  assert.equal(audit.accepted[0].cardLeftHand,true);
  assert.equal(audit.accepted[0].ordinal,2);
  assert.equal(audit.headlessOrdinalJoinVerified,false);
  assert.equal(audit.competitiveGameQualified,false);
});

test('both owner seats and independent same-name prototypes',()=>{
  const A=cardClass(),B=cardClass();
  const players=[owner(101,[new A()]),owner(202,[new B()])];
  const {audit}=withLiveCardInstanceReceipts(()=>{
    const store=new Store(players);
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    store.dispatch(new PlayCardAction(101,0));
  },{Store});
  assert.deepEqual(audit.accepted.map(x=>x.seat),[1,0]);
  assert.deepEqual(audit.accepted.map(x=>x.executableConstructor),['Card','Card']);
  assert.notEqual(audit.accepted[0].executablePrototypeToken,
    audit.accepted[1].executablePrototypeToken);
});

test('other simulated Store cannot supply accepted real-root receipts',()=>{
  const C=cardClass();
  const players=[owner(101,[new C()]),owner(202,[new C()])];
  const {audit}=withLiveCardInstanceReceipts(()=>{
    const real=new Store(players),clone=new Store([
      owner(101,[new C()]),owner(202,[])]);
    real.dispatch(new AddPlayerAction());
    clone.dispatch(new PlayCardAction(101,0));
    real.dispatch(new PlayCardAction(202,0));
  },{Store});
  assert.equal(audit.acceptedPlayCardRoots,1);
  assert.equal(audit.auxiliaryDispatchCount,1);
  assert.equal(audit.accepted[0].seat,1);
});

test('Store exceptions retain rejection and restore method exactly',()=>{
  const prior=Store.prototype.dispatch;
  const {audit,error}=(()=>{
    try{
      withLiveCardInstanceReceipts(()=>{
        const real=new Store([owner(101,[]),owner(202,[])]);
        real.dispatch(new AddPlayerAction());
        real.dispatch(new PlayCardAction(101,-1));
      },{Store});
    }catch(error){return {audit:error.agent34CardInstanceAudit,error};}
    throw Error('expected Store rejection');
  })();
  assert.equal(error.message,'bad physical hand index');
  assert.strictEqual(Store.prototype.dispatch,prior);
  assert.equal(audit.rejectedPlayCardRoots,1);
  assert.equal(audit.acceptedPlayCardRoots,0);
  assert.equal(audit.rejected[0].failure,'native-actor-hand-card-unresolved');
});

test('read-only observer does not invoke any extra Store actions',()=>{
  const C=cardClass();
  const before=[owner(101,[new C()]),owner(202,[new C()])];
  const result=withLiveCardInstanceReceipts(()=>{
    const real=new Store(before);
    real.dispatch(new AddPlayerAction());
    real.dispatch(new PlayCardAction(101,0));
    return real.actions;
  },{Store});
  assert.deepEqual(result.result,['AddPlayerAction','PlayCardAction']);
  assert.equal(result.audit.originalDispatchCount,2);
  assert.equal(result.audit.acceptedPlayCardRoots,1);
});
