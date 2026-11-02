'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION,withStrandedFusionMewPassRetreat
} = require('../simulation/twinleaf/agent21-owner-stranded-mew-native-pass-retreat.cjs');

class PassTurnAction {
  constructor(playerId){this.playerId=playerId;}
}
class RetreatAction {
  constructor(playerId,benchIndex){
    this.playerId=playerId;this.benchIndex=benchIndex;
  }
}
class FakeStore {
  constructor(state){this.state=state;this.actions=[];}
  dispatch(action){
    this.actions.push(action.constructor.name);
    if(action instanceof RetreatAction){
      const owner=this.state.players[this.state.activePlayer];
      const old=owner.active;
      owner.active=owner.bench[action.benchIndex];
      owner.bench[action.benchIndex]=old;
      owner.retreatedTurn=this.state.turn;
      owner.discard.cards.push({fullName:'Double Colorless Energy SUM'});
    }
    return 'store-accepted';
  }
}
function state(seat){
  const mk=name=>({getPokemonCard:()=>({fullName:name})});
  const owner={
    id:seat===0?101:202,
    active:mk('Dedenne GX UNB'),bench:[mk('Mew VMAX FST')],
    discard:{cards:[]},retreatedTurn:0
  };
  const opponent={
    id:seat===0?202:101,
    active:mk('Tapu Lele-GX GRI'),bench:[],
    discard:{cards:[]},retreatedTurn:0
  };
  return {turn:47,activePlayer:seat,phase:'PLAYER_TURN',prompts:[],
    players:seat===0?[owner,opponent]:[opponent,owner]};
}
const deps= {
  Store:FakeStore,actions:{PassTurnAction,RetreatAction},
  phase:{GamePhase:{PLAYER_TURN:'PLAYER_TURN'}},
  types:{CardType:{COLORLESS:9},EnergyType:{BASIC:0,SPECIAL:1},
    SpecialCondition:{ASLEEP:1,PARALYZED:2}},
  observe:(s,seat)=>({decisionKind:'owner-root',sourceSeat:seat}),
  choose:()=>({kind:'paid-retreat',benchIndex:0,
    printing:'Mew VMAX FST',paymentPrinting:'Double Colorless Energy SUM'})
};

for(const seat of [0,1]){
  test('real Store boundary substitutes owner Pass with paid retreat in seat '+seat,()=>{
    const prior=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
    const s=new FakeStore(state(seat));
    const originalId=s.state.players[seat].id;
    const {result,audit}=withStrandedFusionMewPassRetreat(()=>{
      return s.dispatch(new PassTurnAction(originalId));
    },deps);
    assert.equal(result,'store-accepted');
    assert.deepEqual(s.actions,['RetreatAction']);
    assert.equal(s.state.players[seat].active.getPokemonCard().fullName,
      'Mew VMAX FST');
    assert.equal(audit.nativePassActionsSeen,1);
    assert.equal(audit.eligibleOwnerOffers,1);
    assert.equal(audit.dispatchedRetreatActions,1);
    assert.equal(audit.nativeSettledPromotions,1);
    assert.equal(audit.competitiveQualified,false);
    assert.equal(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch').value,
      prior.value,'Store prototype restored after selected boundary');
  });
}

test('ineligible Pass retains real native Pass and does not fake a new action',()=>{
  const s=new FakeStore(state(0));
  const no={...deps,choose:()=>null};
  const {audit}=withStrandedFusionMewPassRetreat(()=>
    s.dispatch(new PassTurnAction(101)),no);
  assert.deepEqual(s.actions,['PassTurnAction']);
  assert.equal(audit.nativePassActionsSeen,1);
  assert.equal(audit.eligibleOwnerOffers,0);
  assert.equal(audit.dispatchedRetreatActions,0);
});

test('owner-id mismatch cannot redirect another player onto the acting bench',()=>{
  const s=new FakeStore(state(1));
  const {audit}=withStrandedFusionMewPassRetreat(()=>
    s.dispatch(new PassTurnAction(101)),deps);
  assert.deepEqual(s.actions,['PassTurnAction']);
  assert.equal(audit.eligibleOwnerOffers,0);
  assert.equal(audit.nativeSettledPromotions,0);
});

test('a native rejection propagates and restores original Store dispatcher',()=>{
  class RejectingStore extends FakeStore{
    dispatch(action){
      if(action instanceof RetreatAction)throw new Error('native refuses paid retreat');
      return super.dispatch(action);
    }
  }
  const prior=RejectingStore.prototype.dispatch;
  const s=new RejectingStore(state(1));
  assert.throws(()=>withStrandedFusionMewPassRetreat(()=>
    s.dispatch(new PassTurnAction(202)),
  {...deps,Store:RejectingStore}),/native refuses paid retreat/);
  assert.strictEqual(RejectingStore.prototype.dispatch,prior);
});

test('pending unrelated native prompt prevents Pass replacement',()=>{
  const s=new FakeStore(state(0));
  s.state.prompts=[{result:undefined,playerId:101}];
  const {audit}=withStrandedFusionMewPassRetreat(()=>
    s.dispatch(new PassTurnAction(101)),deps);
  assert.deepEqual(s.actions,['PassTurnAction']);
  assert.equal(audit.nativePassActionsSeen,0);
  assert.match(VERSION,/symmetric-owner-pass/);
});
