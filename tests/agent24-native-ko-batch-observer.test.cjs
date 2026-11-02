'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withNativeKODispatchLedger}=
  require('../simulation/twinleaf/agent24-native-ko-batch-observer.cjs');

class AddPlayerAction{}
class DoubleKOAction{}
class NestedAction{}
class FailingAction{}
class KnockOutEffect{
  /** @param {object} player Native victim owner. */
  constructor(player){
    this.player=player;
    this.prizeCount=0;
    this.preventDefault=false;
    this.prizeDestination=undefined;
  }
}

class FakeStore{
  constructor(){
    const first={getPrizeLeft:()=>2};
    const second={getPrizeLeft:()=>2};
    this.state={players:[first,second],phase:2,winner:null,
      isSuddenDeath:false};
  }
  /** @param {object} action */
  dispatch(action){
    if(action instanceof DoubleKOAction){
      this.dispatch(new NestedAction());
      this.reduceEffect(this.state,new KnockOutEffect(this.state.players[0]));
      this.reduceEffect(this.state,new KnockOutEffect(this.state.players[1]));
      this.state.phase=7;
      this.state.winner=0;
    }
    if(action instanceof FailingAction)throw new Error('fake-dispatch-failure');
    return this.state;
  }
  /** @param {object} state @param {object} effect */
  reduceEffect(state,effect){
    if(effect instanceof KnockOutEffect)effect.prizeCount=2;
    return state;
  }
}

/** @returns {{result:object,evidence:object}} */
function collect(){
  return withNativeKODispatchLedger(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    return store.dispatch(new DoubleKOAction());
  },{Store:FakeStore});
}

test('post-reducer receipts preserve both simultaneous claimants in one root',()=>{
  const out=collect();
  assert.equal(out.result.winner,0);
  assert.equal(out.evidence.events.length,1);
  const event=out.evidence.events[0];
  assert.equal(event.action,'DoubleKOAction');
  assert.deepEqual(event.preFirstKOPrizes,[2,2]);
  assert.equal(event.suddenDeathAtFirstKO,false);
  assert.deepEqual(event.koEntitlements,[
    {victimSeat:0,claimantSeat:1,prizeCount:2,
      preventDefault:false,alternatePrizeDestination:false},
    {victimSeat:1,claimantSeat:0,prizeCount:2,
      preventDefault:false,alternatePrizeDestination:false}
  ]);
  assert.equal(event.nativeFinished,true);
  assert.equal(event.finalNativeWinnerSeat,0);
  assert.equal(event.batchProof,'same-dispatch-only');
  assert.equal(event.paperGameOutcomeQualified,false);
});

test('observer never authenticates a full checkState batch or legal match',()=>{
  const {evidence}=collect();
  assert.equal(evidence.sameResolutionBatchAuthenticated,false);
  assert.equal(evidence.sourcePrintingAuthenticated,false);
  assert.equal(evidence.paperGameOutcomeQualified,false);
});

test('native observer restores prior prototype functions after success',()=>{
  const dispatch=FakeStore.prototype.dispatch;
  const reduce=FakeStore.prototype.reduceEffect;
  collect();
  assert.strictEqual(FakeStore.prototype.dispatch,dispatch);
  assert.strictEqual(FakeStore.prototype.reduceEffect,reduce);
});

test('native observer preserves original thrown error and restores prototypes',()=>{
  const dispatch=FakeStore.prototype.dispatch;
  const reduce=FakeStore.prototype.reduceEffect;
  let caught=null;
  try{
    withNativeKODispatchLedger(()=>{
      const s=new FakeStore();
      s.dispatch(new AddPlayerAction());
      s.dispatch(new FailingAction());
    },{Store:FakeStore});
  }catch(error){caught=error;}
  assert.ok(caught);
  assert.match(caught.message,/fake-dispatch-failure/);
  assert.equal(caught.nativeKODispatchEvidence.paperGameOutcomeQualified,false);
  assert.strictEqual(FakeStore.prototype.dispatch,dispatch);
  assert.strictEqual(FakeStore.prototype.reduceEffect,reduce);
});
