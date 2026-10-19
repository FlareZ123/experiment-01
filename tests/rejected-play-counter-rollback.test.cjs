'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withRejectedPlayCounterRollback}=
  require('../simulation/twinleaf/rejected-play-counter-rollback.cjs');

class PlayCardAction{
  /** @param {number} id @param {number} handIndex */
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class Store{
  constructor(){
    this.state={activePlayer:0,players:[{
      id:101,hand:{cards:[{name:'Special Energy'}]},
      energyPlayedTurn:0,stadiumPlayedTurn:0,
      lock:true,after:'BLOCKED_BY_EFFECT',
      removeCard:false
    }]};
  }
  /** @param {PlayCardAction} action */
  dispatch(action){
    const p=this.state.players[0];
    if(action.constructor.name==='PlayCardAction'){
      p.energyPlayedTurn=3;
      p.stadiumPlayedTurn=3;
      if(p.removeCard)p.hand.cards.shift();
      if(p.lock)throw Object.assign(new Error(p.after),{message:p.after});
    }
    return 'accepted';
  }
}

test('native-style BLOCKED_BY_EFFECT rejection restores both consumed counters',()=>{
  const original=Store.prototype.dispatch;
  const seen=withRejectedPlayCounterRollback(Store,()=>{
    const instance=new Store();
    assert.throws(()=>instance.dispatch(new PlayCardAction(101,0)),
      e=>e?.message==='BLOCKED_BY_EFFECT');
    assert.equal(instance.state.players[0].energyPlayedTurn,0);
    assert.equal(instance.state.players[0].stadiumPlayedTurn,0);
    return instance.state.players[0].hand.cards.length;
  });
  assert.equal(seen.result,1);
  assert.equal(seen.evidence.energyTurnCountersRestored,1);
  assert.equal(seen.evidence.stadiumTurnCountersRestored,1);
  assert.equal(seen.evidence.rejectedHandPlaysSeen,1);
  assert.equal(Store.prototype.dispatch,original);
});

test('successful plays retain both counters and do not count as rejected',()=>{
  const seen=withRejectedPlayCounterRollback(Store,()=>{
    const s=new Store();
    s.state.players[0].lock=false;
    assert.equal(s.dispatch(new PlayCardAction(101,0)),'accepted');
    return s.state.players[0];
  });
  assert.equal(seen.result.energyPlayedTurn,3);
  assert.equal(seen.result.stadiumPlayedTurn,3);
  assert.equal(seen.evidence.rejectedHandPlaysSeen,0);
});

test('different errors do not trigger narrow rollback',()=>{
  const seen=withRejectedPlayCounterRollback(Store,()=>{
    const s=new Store();
    s.state.players[0].after='INVALID_TARGET';
    assert.throws(()=>s.dispatch(new PlayCardAction(101,0)),
      e=>e?.message==='INVALID_TARGET');
    return s.state.players[0];
  });
  assert.equal(seen.result.energyPlayedTurn,3);
  assert.equal(seen.result.stadiumPlayedTurn,3);
  assert.equal(seen.evidence.rejectedHandPlaysSeen,0);
});

test('card leaving hand prevents correction of partially applied action',()=>{
  const seen=withRejectedPlayCounterRollback(Store,()=>{
    const s=new Store();
    s.state.players[0].removeCard=true;
    assert.throws(()=>s.dispatch(new PlayCardAction(101,0)),
      e=>e?.message==='BLOCKED_BY_EFFECT');
    return s.state.players[0];
  });
  assert.equal(seen.result.energyPlayedTurn,3);
  assert.equal(seen.result.stadiumPlayedTurn,3);
  assert.equal(seen.evidence.rejectedHandPlaysSeen,0);
});

test('the prototype is restored after an uncaught work failure',()=>{
  const original=Store.prototype.dispatch;
  assert.throws(()=>withRejectedPlayCounterRollback(Store,()=>{
    throw new Error('work cancelled');
  }),/work cancelled/);
  assert.equal(Store.prototype.dispatch,original);
});
