'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,withAuthoritativeRootPrizeExitObserver:observe}=
  require('../simulation/twinleaf/agent3-authoritative-root-prize-exit-observer.cjs');

class AddPlayerAction{}
class TakePrizeAction {
  constructor(ownerSeat,destination){this.ownerSeat=ownerSeat;this.destination=destination;}
}
class NoopAction{}
class ThrowAction{}
function hiddenCard(){
  const card={};
  for(const name of ['name','id','fullName'])
    Object.defineProperty(card,name,{get(){
      throw Error('Read hidden Prize '+name);
    }});
  return card;
}
class Store{
  constructor(){
    this.state={
      players:[0,1].map(id=>({
        id,prizes:[{cards:[hiddenCard()]},{cards:[hiddenCard()]}],
        hand:{cards:[]},deck:{cards:[]},lostzone:{cards:[]},
        discard:{cards:[]},active:{cards:[]},bench:[]
      })),turn:5,phase:3
    };
  }
  dispatch(action) {
    if(action instanceof ThrowAction)throw Error('native abort');
    if(action instanceof TakePrizeAction){
      const owner=this.state.players[action.ownerSeat];
      const physical=owner.prizes[0].cards.splice(0,1);
      owner[action.destination].cards.push(...physical);
    }
    return this.state;
  }
}
for(const seat of [0,1]) {
  for(const destination of ['hand','deck','lostzone']) {
    test('real physical Prize move in seat '+seat+' to '+destination,()=>{
      const store=new Store(),rootBinding={current:store};
      const original=Store.prototype.dispatch;
      const {audit}=observe(()=>{
        store.dispatch(new AddPlayerAction());
        store.dispatch(new NoopAction());
        store.dispatch(new TakePrizeAction(seat,destination));
      },{Store,rootBinding});
      assert.equal(audit.version,VERSION);
      assert.equal(audit.registeredRootStores,1);
      assert.equal(audit.attemptedRootDispatches,3);
      assert.equal(audit.successfulRootDispatches,3);
      assert.equal(audit.rootsWithPrizeCardExit,1);
      assert.equal(audit.exactPhysicalPrizeCardsExited,1);
      assert.equal(audit.byDestination[
        destination==='lostzone'?'lost-zone':destination],1);
      assert.equal(audit.records[0].ownerSeat,seat);
      assert.equal(audit.records[0].prePrizeCards,2);
      assert.equal(audit.records[0].postPrizeCards,1);
      assert.equal(audit.hiddenPrizeFacesRead,false);
      assert.equal(audit.inferredKoCount,null);
      assert.equal(audit.competitivelyQualifiedGames,0);
      assert.strictEqual(Store.prototype.dispatch,original);
    });
  }
  test('foreign Store cannot claim live Prize transfer seat '+seat,()=>{
    const store=new Store(),foreign=new Store();
    const rootBinding={current:store};
    const {audit}=observe(()=>{
      store.dispatch(new AddPlayerAction());
      foreign.dispatch(new AddPlayerAction());
      foreign.dispatch(new TakePrizeAction(seat,'hand'));
      store.dispatch(new TakePrizeAction(seat,'hand'));
    },{Store,rootBinding});
    assert.equal(audit.registeredRootStores,1);
    assert.equal(audit.rootsWithPrizeCardExit,1);
  });
}
test('native abort is never miscounted as successful root and restores hook',()=>{
  const store=new Store(),rootBinding={current:store};
  const original=Store.prototype.dispatch;
  assert.throws(()=>observe(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new ThrowAction());
  },{Store,rootBinding}),error=>{
    assert.equal(error.message,'native abort');
    assert.equal(error.agent3RootPrizeExitAudit.registeredRootStores,1);
    assert.equal(error.agent3RootPrizeExitAudit.attemptedRootDispatches,2);
    assert.equal(error.agent3RootPrizeExitAudit.abortedRootDispatches,1);
    assert.equal(error.agent3RootPrizeExitAudit.rootsWithPrizeCardExit,0);
    return true;
  });
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('actual headless callback attaches true action ordinal rather than Prize event index',()=>{
  const store=new Store(),rootBinding={current:store};
  const original=Store.prototype.dispatch;
  const {audit}=observe(()=>{
    store.dispatch(new AddPlayerAction());
    const noPrize=new NoopAction();
    store.dispatch(noPrize);
    rootBinding.bindAuthoritativePrizeRootOrdinal(store,noPrize,14,0,5);
    const take=new TakePrizeAction(1,'hand');
    store.dispatch(take);
    rootBinding.bindAuthoritativePrizeRootOrdinal(store,take,15,0,5);
  },{Store,rootBinding,bindAcceptedRootOrdinals:true});
  assert.equal(audit.actualHeadlessRootCallbacks,2);
  assert.equal(audit.prizeExitRecordsBoundToAcceptedRoots,1);
  assert.equal(audit.records.length,1);
  assert.equal(audit.records[0].acceptedRootActionOrdinal,15);
  assert.equal(audit.records[0].acceptedRootActorSeat,0);
  assert.equal(audit.records[0].acceptedRootTurnBefore,5);
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.equal(Object.hasOwn(rootBinding,'bindAuthoritativePrizeRootOrdinal'),false);
});

test('headless action identity mismatch fails closed and restores both bindings',()=>{
  const store=new Store(),rootBinding={current:store};
  const original=Store.prototype.dispatch;
  assert.throws(()=>observe(()=>{
    store.dispatch(new AddPlayerAction());
    const actual=new TakePrizeAction(0,'hand');
    store.dispatch(actual);
    rootBinding.bindAuthoritativePrizeRootOrdinal(
      store,new TakePrizeAction(0,'hand'),7,0,5);
  },{Store,rootBinding,bindAcceptedRootOrdinals:true}),
  /exact Store-dispatched action object/);
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.equal(Object.hasOwn(rootBinding,'bindAuthoritativePrizeRootOrdinal'),false);
});

test('duplicate headless callback for one Store action fails closed',()=>{
  const store=new Store(),rootBinding={current:store};
  assert.throws(()=>observe(()=>{
    store.dispatch(new AddPlayerAction());
    const actual=new TakePrizeAction(0,'hand');
    store.dispatch(actual);
    rootBinding.bindAuthoritativePrizeRootOrdinal(store,actual,21,0,5);
    rootBinding.bindAuthoritativePrizeRootOrdinal(store,actual,21,0,5);
  },{Store,rootBinding,bindAcceptedRootOrdinals:true}),
  /Cannot bind the same native root twice/);
  assert.equal(Object.hasOwn(rootBinding,'bindAuthoritativePrizeRootOrdinal'),false);
});

test('foreign Store is rejected by accepted-root callback',()=>{
  const store=new Store(),foreign=new Store(),rootBinding={current:store};
  assert.throws(()=>observe(()=>{
    store.dispatch(new AddPlayerAction());
    const actual=new TakePrizeAction(0,'hand');
    store.dispatch(actual);
    rootBinding.bindAuthoritativePrizeRootOrdinal(foreign,actual,8,0,5);
  },{Store,rootBinding,bindAcceptedRootOrdinals:true}),
  /registered native headless Store/);
  assert.equal(Object.hasOwn(rootBinding,'bindAuthoritativePrizeRootOrdinal'),false);
});
