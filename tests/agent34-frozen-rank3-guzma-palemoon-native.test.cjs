'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseFrozenGuzmaReply,withFrozenRank3GuzmaReply}=
  require('../simulation/twinleaf/agent34-frozen-rank3-guzma-palemoon-native.cjs');
class PassTurnAction {}
class AddPlayerAction {}
class FakeTactics { decodeNextAction(){return new PassTurnAction();} }
class FakeStore {
  constructor(state){this.state=state;}
  dispatch(action){return action;}
}
class PlayCard {
  constructor(clientId,handIndex,target){
    this.clientId=clientId;this.handIndex=handIndex;this.target=target;
  }
}
const view=()=>({
  decisionKind:'owner-root',globalTurn:61,
  ownHand:['Psychic Energy MEE','Guzma BUS'],
  ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
  ownPublic:{active:{printing:'Rotom V LOR'},
    bench:[{printing:'Snorlax VIV'}]},
  opponentPublic:{active:{printing:'Trevenant & Dusknoir-GX SMP'},
    bench:[{printing:'Shadow Rider Calyrex VMAX CRE'}]}
});
const deps={
  targetSeat:0,targetTurn:61,
  Store:FakeStore,SimpleTacticsAi:FakeTactics,
  PlayCardAction:PlayCard,PlayerType:{ANY:4},SlotType:{BOARD:9},
  observe:()=>view()
};
test('only a funded owner-visible Guzma root is offered',()=>{
  const v=view();
  assert.equal(chooseFrozenGuzmaReply(v).handIndex,1);
  assert.equal(chooseFrozenGuzmaReply({...v,ownHand:[]}),null);
  assert.equal(chooseFrozenGuzmaReply({...v,globalTurn:63}),null);
  assert.equal(chooseFrozenGuzmaReply({...v,
    ownTurnResources:{supporterPlayedTurn:1}}),null);
  assert.equal(chooseFrozenGuzmaReply({...v,
    opponentPublic:{...v.opponentPublic,bench:[]}}),null);
});
test('proposed action requires first genuine Store claim and restores prototypes',()=>{
  const beforeStore=FakeStore.prototype.dispatch;
  const beforeBot=FakeTactics.prototype.decodeNextAction;
  const state={turn:61,activePlayer:0,prompts:[],
    players:[{id:101},{id:202}]};
  const store=new FakeStore(state);
  const out=withFrozenRank3GuzmaReply(()=>{
    assert.ok(new FakeTactics().decodeNextAction({...state}) instanceof PassTurnAction);
    store.dispatch(new AddPlayerAction());
    return new FakeTactics().decodeNextAction(state);
  },deps);
  assert.ok(out.result instanceof PlayCard);
  assert.equal(out.result.clientId,101);
  assert.equal(out.result.handIndex,1);
  assert.deepEqual(out.result.target,{player:4,slot:9,index:0});
  assert.equal(out.audit.speculativeStateVetoes,1);
  assert.equal(out.audit.ownerEligibleOffers,1);
  assert.strictEqual(FakeStore.prototype.dispatch,beforeStore);
  assert.strictEqual(FakeTactics.prototype.decodeNextAction,beforeBot);
});
