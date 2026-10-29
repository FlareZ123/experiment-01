'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {ownerSupporterOpportunity,withNativeOwnerSupporterOpportunity}=
  require('../simulation/twinleaf/agent2-native-owner-supporter-opportunity.cjs');

const SUPPORTER=7;
class AddPlayerAction{constructor(id){this.id=id;}}
class PassTurnAction{constructor(id){this.id=id;}}
class PlayCardAction{constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}}
class AttackAction{constructor(id){this.id=id;}}
function player(id,cards=[]){
  return {id,hand:{cards},deck:{cards:['x']},supporterTurn:0,
    cannotPlaySupporterCards:false};
}
function supporter(name,value=true){
  return {name,fullName:name+' TEST',trainerType:SUPPORTER,
    canPlay(_target,_state,_actor){return value;}};
}
class Store{
  constructor(){
    this.state={turn:0,activePlayer:0,phase:0,
      players:[player(101),player(202)],prompts:[]};
    this.trace=[];
  }
  dispatch(action){
    this.trace.push(action.constructor.name);
    if(action.constructor.name==='PassTurnAction'){
      this.state.turn++;
      this.state.activePlayer=1-this.state.activePlayer;
    }
    if(action.constructor.name==='PlayCardAction'){
      const owner=this.state.players.find(p=>p.id===action.id);
      const card=owner.hand.cards.splice(action.handIndex,1)[0];
      if(card.trainerType===SUPPORTER)owner.supporterTurn++;
    }
    if(action.constructor.name==='AttackAction')throw Error('native rejected');
    return true;
  }
}
test('owner-only engine affordability distinguishes held, quota, locks',()=>{
  const state={turn:2,activePlayer:0,prompts:[],players:[
    player(101,[supporter('Draw'),supporter('Targeted',false),
      {name:'Item',trainerType:1}]),
    player(202,[supporter('Secret')])
  ]};
  const before=JSON.stringify(state);
  const opportunity=ownerSupporterOpportunity(state,0,SUPPORTER);
  assert.equal(opportunity.heldCount,2);
  assert.equal(opportunity.nativeNullTrueCount,1);
  assert.deepEqual(opportunity.supporters.map(s=>s.nativeNullCanPlay),
    ['true','false']);
  assert.equal(JSON.stringify(state),before);
  state.players[0].supporterTurn=1;
  assert.equal(ownerSupporterOpportunity(state,0,SUPPORTER).nativeNullTrueCount,0);
  state.players[0].supporterTurn=0;
  state.players[0].cannotPlaySupporterCards=true;
  assert.equal(ownerSupporterOpportunity(state,0,SUPPORTER).nativeNullTrueCount,0);
});
test('accepted native first roots and Pass capture both seats before advancing',()=>{
  const store=new Store();
  store.state.players[0].hand.cards=[supporter('Draw')];
  store.state.players[1].hand.cards=[supporter('Secret',false)];
  store.state.turn=1;
  const original=Store.prototype.dispatch;
  const run=()=>{
    store.dispatch(new AddPlayerAction(101));
    store.dispatch(new PassTurnAction(101));
    store.dispatch(new PlayCardAction(202,0));
    store.dispatch(new PassTurnAction(202));
    return 'ok';
  };
  const {result,audit}=withNativeOwnerSupporterOpportunity(run,
    {Store,supporterType:SUPPORTER});
  assert.equal(result,'ok');
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.equal(audit.counts.firstRoots,2);
  assert.equal(audit.counts.acceptedPasses,2);
  assert.equal(audit.counts.passesWithNativeNullTrue,1);
  assert.deepEqual(audit.passes.map(e=>[e.ownerSeat,e.turn]),[[0,1],[1,2]]);
  assert.equal(audit.supporterRoots[0].nativeQuotaAfter,1);
  assert.equal(audit.firstRoots[0].supporters[0].printing,'Draw TEST');
  assert.equal(audit.firstRoots[1].supporters[0].printing,'Secret TEST');
  assert.equal(audit.counts.rejectedRootActions,0);
});
test('native rejection remains rejected; exact descriptor restored',()=>{
  const store=new Store();
  store.state.turn=3;
  store.state.players[0].hand.cards=[supporter('Draw')];
  const original=Store.prototype.dispatch;
  let caught;
  try{
    withNativeOwnerSupporterOpportunity(()=>{
      store.dispatch(new AddPlayerAction(101));
      store.dispatch(new AttackAction(101));
    },{Store,supporterType:SUPPORTER});
  }catch(error){caught=error;}
  assert.equal(caught.message,'native rejected');
  assert.strictEqual(Store.prototype.dispatch,original);
  const audit=caught.agent2OwnerSupporterOpportunityEvidence;
  assert.equal(audit.counts.rejectedRootActions,1);
  assert.equal(audit.counts.firstRoots,0);
});
