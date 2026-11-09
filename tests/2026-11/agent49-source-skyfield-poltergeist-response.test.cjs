'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSourceSkyField,withSourceSkyField}=
  require('../../simulation/twinleaf/agent49-source-skyfield-response-native.cjs');

class PassTurnAction{}
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
const card=(name,canPlay=true)=>({fullName:name,
  canPlay:()=>canPlay});
function state(stadium=false,canPlay=true){
  const source={id:101,hand:{cards:[
    card('Ultra Ball MEG'),card('Sky Field ROS',canPlay),
    card('Wally ROS')]},
  stadium:{cards:stadium?[card('Sky Field ROS')]:[]},
  stadiumPlayedTurn:0};
  const enemy={id:102,hand:{cards:[card('Hidden opponent card')]},
    stadium:{cards:[]},stadiumPlayedTurn:0};
  return {turn:17,activePlayer:0,prompts:[],players:[source,enemy]};
}
class FakeStore{
  constructor(initial=state()){this.state=initial;}
  dispatch(action){
    if(action instanceof PlayCardAction){
      const source=this.state.players[0];
      const x=source.hand.cards.splice(action.handIndex,1)[0];
      source.stadium.cards.push(x);
      source.stadiumPlayedTurn++;
    }
  }
}
class FakeAi{
  constructor(id,store){this.client={id};this.store=store;}
  decodeNextAction(){return new PassTurnAction();}
}
test('Source owner Sky Field selection matches exact physical opportunity',()=>{
  const s=state();
  assert.equal(chooseSourceSkyField(s,0),1);
  assert.equal(chooseSourceSkyField({...s,turn:15},0),null);
  assert.equal(chooseSourceSkyField({...s,activePlayer:1},0),null);
  assert.equal(chooseSourceSkyField({...s,prompts:[{}]},0),null);
  assert.equal(chooseSourceSkyField(state(true),0),null);
  s.players[0].stadiumPlayedTurn=1;
  assert.equal(chooseSourceSkyField(s,0),null);
  s.players[0].stadiumPlayedTurn=0;
  s.players[0].hand.cards[1]=card('Other card');
  assert.equal(chooseSourceSkyField(s,0),null);
});
test('Real native-dispatch source-owned Stadium transfer, no opponent-hidden read',()=>{
  const beforeAi=Object.getOwnPropertyDescriptor(
    FakeAi.prototype,'decodeNextAction');
  const beforeStore=Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch');
  const headless={runMatch:()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    const proposed=new FakeAi(101,store).decodeNextAction(store.state);
    assert.equal(proposed.constructor.name,'PlayCardAction');
    assert.equal(proposed.handIndex,1);
    store.dispatch(proposed);
    assert.deepEqual(store.state.players[0].hand.cards.map(c=>c.fullName),
      ['Ultra Ball MEG','Wally ROS']);
    return proposed;
  }};
  const result=withSourceSkyField(()=>headless.runMatch({}),{
    headless,SimpleTacticsAi:FakeAi,Store:FakeStore,PlayCardAction,
    sourceSeat:0});
  assert.equal(result.audit.firstTurn17PassCount,1);
  assert.equal(result.audit.heldSkyFieldPasses,1);
  assert.equal(result.audit.legalProposals,1);
  assert.equal(result.audit.nativeCommitted,1);
  assert.equal(result.audit.physicalStadiumSettlements,1);
  assert.equal(result.audit.accepted[0].afterSourceHandCount,2);
  assert.deepEqual(result.audit.accepted[0].afterStadiumNames,['Sky Field ROS']);
  assert.equal(result.audit.opponentPrivateCardsExamined,false);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction'),
    beforeAi);
  assert.deepEqual(
    Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),
    beforeStore);
});
test('Native canPlay denial preserves source Pass without claiming payment',()=>{
  const headless={runMatch:()=>{
    const store=new FakeStore(state(false,false));
    store.dispatch(new AddPlayerAction());
    const action=new FakeAi(101,store).decodeNextAction(store.state);
    assert.equal(action.constructor.name,'PassTurnAction');
    return action;
  }};
  const result=withSourceSkyField(()=>headless.runMatch({}),{
    headless,SimpleTacticsAi:FakeAi,Store:FakeStore,PlayCardAction});
  assert.equal(result.audit.nativeCanPlayDenied,1);
  assert.equal(result.audit.nativeCommitted,0);
  assert.equal(result.audit.legalProposals,0);
});
test('Late Stadium decoder remains installed after common policy override',()=>{
  const original=Object.getOwnPropertyDescriptor(
    FakeAi.prototype,'decodeNextAction');
  const headless={runMatch:()=>{
    const store=new FakeStore();
    store.dispatch(new AddPlayerAction());
    const action=new FakeAi(101,store).decodeNextAction(store.state);
    assert.equal(action.constructor.name,'PlayCardAction');
    store.dispatch(action);
    return action;
  }};
  const canonical=()=>{
    const previous=Object.getOwnPropertyDescriptor(
      FakeAi.prototype,'decodeNextAction');
    Object.defineProperty(FakeAi.prototype,'decodeNextAction',{
      ...previous,value:()=>new PassTurnAction()});
    try{return headless.runMatch({});}
    finally{
      Object.defineProperty(FakeAi.prototype,'decodeNextAction',previous);
    }
  };
  const result=withSourceSkyField(canonical,{
    headless,SimpleTacticsAi:FakeAi,Store:FakeStore,PlayCardAction});
  assert.equal(result.audit.physicalStadiumSettlements,1);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeAi.prototype,'decodeNextAction'),original);
});
