'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseEarlyCarmine,withSourceEarlyCarmine}=
  require('../simulation/twinleaf/agent49-source-early-carmine-native.cjs');

class PassTurnAction{}
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
function card(fullName,legal=true){
  return {fullName,canPlay:()=>legal};
}
function player(id,heldCarmine=false){
  return {id,hand:{cards:heldCarmine?[
    card('Carmine TWM'),card('Double Dragon Energy ROS')
  ]:[card('Other Source Card')]},
  deck:{cards:Array.from({length:10},(_,i)=>card('Draw '+i))},
  discard:{cards:[]},lostZone:{cards:[]},supporterTurn:0};
}
class FakeStore{
  constructor(sourceSeat=0,held=true){
    this.state={turn:1,activePlayer:sourceSeat,prompts:[],
      players:[player(100,sourceSeat===0&&held),player(101,sourceSeat===1&&held)]};
  }
  dispatch(action){
    if(action instanceof PlayCardAction){
      const p=this.state.players[this.state.activePlayer];
      const played=p.hand.cards.splice(action.handIndex,1)[0];
      p.discard.cards.push(played,...p.hand.cards);
      p.hand.cards.length=0;
      p.hand.cards.push(...p.deck.cards.splice(0,5));
      p.supporterTurn++;
    }
  }
}
class FakeAi{
  constructor(id,store){this.client={id};this.store=store;}
  decodeNextAction(){return new PassTurnAction();}
}
function observer(state,seat){
  const owner=state.players[seat],opponent=state.players[1-seat];
  return {decisionKind:'owner-root',actorSeat:seat,
    globalTurn:state.turn,ownHand:owner.hand.cards.map(c=>c.fullName),
    ownTurnResources:{supporterPlayedTurn:owner.supporterTurn,
      supporterPlayLocked:false},
    ownPublic:{deckCount:owner.deck.cards.length,prizeCount:6,
      publicTurnRestrictions:{supporterPlayLocked:false}},
    opponentPublic:{prizeCount:6,handCount:opponent.hand.cards.length}};
}
const trial=slot=>({id:'11:4900:'+slot+':new-moon-lockbreaker-v1',
  rank:11,candidateSlot:slot});
test('only genuine first-own-turn owner Carmine Pass is a proposed action',()=>{
  const view=observer(new FakeStore().state,0);
  assert.deepEqual(chooseEarlyCarmine(view),{
    handIndex:0,printing:'Carmine TWM',expectedOtherHandCount:1
  });
  assert.equal(chooseEarlyCarmine({...view,globalTurn:3}),null);
  assert.equal(chooseEarlyCarmine({...view,
    ownTurnResources:{...view.ownTurnResources,supporterPlayedTurn:1}}),null);
  assert.equal(chooseEarlyCarmine({...view,ownHand:['Other Source Card']}),null);
  assert.equal(chooseEarlyCarmine({...view,
    ownPublic:{...view.ownPublic,deckCount:0}}),null);
});
for(const slot of ['A','B']){
  test('source Carmine native Store transfers physical owner hand and draws 5 in candidate slot '+slot,()=>{
    const sourceSeat=slot==='A'?1:0;
    const origDecode=Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction');
    const origDispatch=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
    const headless={runMatch:()=>{
      const store=new FakeStore(sourceSeat);
      // Source-seat turn is global turn 1 or 2, but Supporter use count
      // starts at zero in either orientation.
      if(sourceSeat===1)store.state.turn=2;
      store.dispatch(new AddPlayerAction());
      const ai=new FakeAi(store.state.players[sourceSeat].id,store);
      const selected=ai.decodeNextAction(store.state);
      assert.equal(selected.constructor.name,'PlayCardAction');
      store.dispatch(selected);
      return {selected,sourceSeat};
    }};
    const run=()=>withSourceEarlyCarmine(()=>headless.runMatch({}),{
      trials:[trial(slot)],headless,SimpleTacticsAi:FakeAi,Store:FakeStore,
      PlayCardAction,observe:observer
    });
    const {audit,result}=run();
    assert.equal(audit.firstOwnTurnPasses,1);
    assert.equal(audit.heldCarminePasses,1);
    assert.equal(audit.paperEligibleProposals,1);
    assert.equal(audit.nativeCommitted,1);
    assert.equal(audit.nativeEffectsComplete,1);
    assert.equal(audit.accepted[0].otherCardsPhysicallyMoved,1);
    assert.equal(audit.accepted[0].otherCardsDiscarded,1);
    assert.equal(audit.accepted[0].netDeckChange,-5);
    assert.equal(audit.accepted[0].afterOwnerHandSize,5);
    assert.equal(result.sourceSeat,sourceSeat);
    assert.deepEqual(Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction'),origDecode);
    assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),origDispatch);
  });
}
test('native canPlay veto preserves Pass and cannot claim accepted source action',()=>{
  const headless={runMatch:()=>{
    const store=new FakeStore(0);
    store.state.players[0].hand.cards[0].canPlay=()=>false;
    store.dispatch(new AddPlayerAction());
    const action=new FakeAi(100,store).decodeNextAction(store.state);
    assert.equal(action.constructor.name,'PassTurnAction');
    return action;
  }};
  const result=withSourceEarlyCarmine(()=>headless.runMatch({}),{
    trials:[trial('B')],headless,SimpleTacticsAi:FakeAi,Store:FakeStore,
    PlayCardAction,observe:observer
  });
  assert.equal(result.audit.nativeCanPlayRejected,1);
  assert.equal(result.audit.nativeCommitted,0);
  assert.equal(result.audit.nativeEffectsComplete,0);
});

test('late Carmine rescue executes after a canonical policy replaces the decoder',()=>{
  const headless={runMatch:()=>{
    const store=new FakeStore(0);
    store.dispatch(new AddPlayerAction());
    const selected=new FakeAi(100,store).decodeNextAction(store.state);
    assert.equal(selected.constructor.name,'PlayCardAction');
    store.dispatch(selected);
    return selected;
  }};
  const original=Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction');
  const canonical=()=>{
    const before=Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction');
    const actorTypedPass=function(){return new PassTurnAction();};
    Object.defineProperty(FakeAi.prototype,'decodeNextAction',
      {...before,value:actorTypedPass});
    try{return headless.runMatch({});}
    finally{Object.defineProperty(FakeAi.prototype,'decodeNextAction',before);}
  };
  const result=withSourceEarlyCarmine(canonical,{
    trials:[trial('B')],headless,SimpleTacticsAi:FakeAi,Store:FakeStore,
    PlayCardAction,observe:observer
  });
  assert.equal(result.audit.lateDecoderInstallations,1);
  assert.equal(result.audit.nativeCommitted,1);
  assert.equal(result.audit.nativeEffectsComplete,1);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeAi.prototype,'decodeNextAction'),original);
});
