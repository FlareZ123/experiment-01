'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withRegisteredFourthSourcePassAudit}=require(
  '../simulation/twinleaf/agent45-original-source-pass-audit.cjs');
class AddPlayerAction{}
class PassTurnAction{}
class FakeStore{
  constructor(){
    this.state={turn:5,activePlayer:0,prompts:[],
      players:[{id:100,hand:['Double Dragon Energy ROS','Guzma BUS']},
        {id:101,hand:['ConcealedOpponentCard']}]};
  }
  dispatch(action){
    if(action.constructor.name==='PassTurnAction'){
      this.state.turn=6;
      this.state.activePlayer=1;
    }
    return true;
  }
}
const root={action:'PassTurnAction',playerSlot:0,turnBefore:5,
  actionOrdinal:19,turnAfter:6};
function observe(state,seat){
  return {decisionKind:'owner-root',actorSeat:seat,globalTurn:state.turn,
    ownHand:[...state.players[seat].hand],
    ownPublic:{active:{printing:'Regidrago V SIT'},bench:[],deckCount:35,
      discard:[]},
    opponentPublic:{active:{printing:'Mew V FST'},handCount:1},
    ownTurnResources:{energyPlayedTurn:0,supporterPlayedTurn:0}};
}
function batch(missingTargetRoot=false){
  const rows=[];
  for(let i=0;i<4;i++){
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction());
    rows.push({trial:{id:String(i)},finished:true,
      rootActionLedger:i===3&&!missingTargetRoot?[root]:[]});
  }
  return {selected:{rawDevelopment:{rows}}};
}
test('fourth frozen Store captures only acting source's Pass after its choice',()=>{
  const old=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const recorded=withRegisteredFourthSourcePassAudit(()=>batch(),{
    Store:FakeStore,observe
  });
  assert.equal(recorded.audit.gameCount,4);
  assert.equal(recorded.audit.gameOrdinal,4);
  assert.equal(recorded.audit.gameId,'3');
  assert.equal(recorded.audit.count,1);
  assert.equal(recorded.audit.rootOrdinalLinked,true);
  assert.equal(recorded.audit.verifiedNativeTurnTransitions,1);
  assert.equal(recorded.audit.events[0].rootActionOrdinal,19);
  assert.deepEqual(recorded.audit.events[0].actorHandPrintings,
    ['Double Dragon Energy ROS','Guzma BUS']);
  assert.equal(JSON.stringify(recorded.audit).includes('ConcealedOpponentCard'),false);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch'),old);
});
test('missing archived root does not manufacture an owned Pass root ordinal',()=>{
  const recorded=withRegisteredFourthSourcePassAudit(
    ()=>batch(true),{Store:FakeStore,observe});
  assert.equal(recorded.audit.rootOrdinalLinked,false);
  assert.equal(recorded.audit.events[0].rootActionOrdinal,null);
  assert.equal(recorded.audit.verifiedNativeTurnTransitions,1);
});
test('observer remains read-only and restores Store even when native batch aborts',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withRegisteredFourthSourcePassAudit(()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    throw Error('native stop');
  },{Store:FakeStore,observe}),/native stop/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch'),original);
});
