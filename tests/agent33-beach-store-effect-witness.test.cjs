'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withBeachStoreEffectWitness,effectSettled,
  beachStoreAbortEvidence}=
  require('../simulation/twinleaf/agent33-beach-store-effect-witness.cjs');
class AddPlayerAction {}
class UseStadiumAction {
  constructor(clientId){this.clientId=clientId;}
}
class FakeStore{
  constructor(seat=0,mode='normal'){
    this.mode=mode;
    this.state={
      turn:5,phase:3,activePlayer:seat,
      players:[101,202].map(id=>({id,stadium:{cards:[]},
        hand:{cards:[1,2,3]},deck:{cards:Array(12).fill(0)},
        stadiumUsedTurn:0}))
    };
    this.state.players[1-seat].stadium.cards.push({name:'Tropical Beach'});
  }
  dispatch(action){
    if(action instanceof AddPlayerAction)return true;
    if(!(action instanceof UseStadiumAction))throw Error('Unexpected fake');
    const state=this.state;
    const owner=state.players[state.activePlayer];
    if(owner.id!==action.clientId)throw Error('Not owner');
    if(this.mode==='throw')throw new Error('Store deliberately rejected');
    if(this.mode!=='no-effect'){
      const delta=7-owner.hand.cards.length;
      owner.hand.cards.push(...owner.deck.cards.splice(0,delta));
      owner.stadiumUsedTurn=state.turn;
      state.phase=4;
    }
    return true;
  }
}
for(const seat of [0,1]){
 test('pure mock accepted Beach Store draw/end-turn counts, seat '+seat,()=>{
  const prev=FakeStore.prototype.dispatch;
  let result;
  const out=withBeachStoreEffectWitness(()=>{
    const x=new FakeStore(seat);x.dispatch(new AddPlayerAction());
    x.dispatch(new UseStadiumAction(x.state.players[seat].id));
    result=x;
    return 'complete';
  },{Store:FakeStore});
  assert.equal(out.result,'complete');
  assert.strictEqual(FakeStore.prototype.dispatch,prev);
  assert.equal(result.state.players[seat].hand.cards.length,7);
  assert.equal(result.state.players[seat].deck.cards.length,8);
  assert.equal(out.audit.acceptedStadiumUses,1);
  assert.equal(out.audit.beachDrawAndEndTurnSettled,1);
  assert.equal(out.audit.unsettledBeachUses,0);
  assert.equal(out.audit.competitiveGameQualified,false);
 });
}
test('dispatch success without effect settlement is never positive proof',()=>{
 const out=withBeachStoreEffectWitness(()=>{
  const x=new FakeStore(0,'no-effect');x.dispatch(new AddPlayerAction());
  x.dispatch(new UseStadiumAction(101));return null;
 },{Store:FakeStore});
 assert.equal(out.audit.acceptedStadiumUses,1);
 assert.equal(out.audit.beachDrawAndEndTurnSettled,0);
 assert.equal(out.audit.unsettledBeachUses,1);
});
test('rejected native dispatch is retained, then original method restored',()=>{
 const previous=FakeStore.prototype.dispatch;
 let caught;
 try{
  withBeachStoreEffectWitness(()=>{
    const x=new FakeStore(0,'throw');x.dispatch(new AddPlayerAction());
    x.dispatch(new UseStadiumAction(101));
  },{Store:FakeStore});
 }catch(e){caught=e;}
 assert.ok(caught);
 assert.strictEqual(FakeStore.prototype.dispatch,previous);
 assert.equal(beachStoreAbortEvidence(caught)?.unsettledBeachUses,1);
 assert.equal(beachStoreAbortEvidence(caught)?.acceptedStadiumUses,0);
});
test('no observed live Store is never implied by a synthetic callback',()=>{
 const out=withBeachStoreEffectWitness(()=>123,{Store:FakeStore});
 assert.equal(out.audit.observedLiveStore,false);
 assert.equal(out.audit.beachDrawAndEndTurnSettled,0);
});
test('an unchanged player position cannot falsely certify a turn end',()=>{
 assert.equal(effectSettled({
   stadiumNames:['Tropical Beach'],handCount:3,deckCount:12,
   turn:5,phase:3,activePlayer:0
 },{
   handCount:7,deckCount:8,usedTurn:5,
   turn:5,phase:3,activePlayer:0
 }),false);
});
test('no private card identities appear in the public receipt',()=>{
 const out=withBeachStoreEffectWitness(()=>{
  const x=new FakeStore(0);x.dispatch(new AddPlayerAction());
  x.dispatch(new UseStadiumAction(101));return 'ok';
 },{Store:FakeStore});
 assert.ok(out.audit.events[0].stadiumNames.includes('Tropical Beach'));
 assert.equal(JSON.stringify(out.audit).includes('secret-hand'),false);
});
