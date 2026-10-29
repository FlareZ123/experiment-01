'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyShuffleSupporterAfterPass}=require(
 '../simulation/twinleaf/agent2-actor-only-shuffle-supporter-after-pass.cjs');

class AddPlayerAction{constructor(id){this.id=id;}}
class PassTurnAction{constructor(id){this.id=id;}}
class PlayCardAction{
 constructor(id,handIndex,target){
   this.id=id;this.handIndex=handIndex;this.target=target;
 }
}
class SimpleTacticsAi{
 constructor(id){this.client={id};}
 decodeNextAction(){return new PassTurnAction(this.client.id);}
}
class Store{
 constructor(){
   this.state={turn:2,activePlayer:0,prompts:[],
     players:[makePlayer(101,["Lillie's Determination M1L"]),
       makePlayer(202,['Marnie SSH'])]};
   this.trace=[];
 }
 dispatch(action){
   this.trace.push(action.constructor.name);
   if(action instanceof PlayCardAction){
     if(action.target?.index!==0)throw Error('invalid target');
     const owner=this.state.players.find(p=>p.id===action.id);
     const card=owner.hand.cards.splice(action.handIndex,1)[0];
     if(!card)throw Error('missing physical card');
     owner.supporterTurn++;
   }
   return true;
 }
}
function makePlayer(id,names){
 return {id,hand:{cards:names.map(fullName=>({fullName}))},
   supporterTurn:0};
}
function observe(state,seat){
 const owner=state.players[seat],opponent=state.players[1-seat];
 return {decisionKind:'owner-root',globalTurn:state.turn,
   ownHand:owner.hand.cards.map(c=>c.fullName),
   ownPublic:{active:{},deckCount:40,prizeCount:6,
     resolvingSupporter:[],publicTurnRestrictions:{}},
   opponentPublic:{handCount:6,deckCount:40,prizeCount:5},
   ownTurnResources:{supporterPlayedTurn:owner.supporterTurn,
     supporterPlayLocked:false},
   ownerId:owner.id,otherOwnerId:opponent.id};
}
const deps={SimpleTacticsAi,Store,
  cardActions:{PlayCardAction,PlayerType:{ANY:1},SlotType:{BOARD:2}},
  observe};
test('both seats after Pass select printed access only from owned hands',()=>{
 const store=new Store(),before=SimpleTacticsAi.prototype.decodeNextAction;
 const seen=withActorOnlyShuffleSupporterAfterPass(()=>{
   store.dispatch(new AddPlayerAction(101));
   const a=new SimpleTacticsAi(101).decodeNextAction(store.state);
   assert.ok(a instanceof PlayCardAction);
   assert.equal(a.target.index,0);
   store.dispatch(a);
   store.state.turn=3;store.state.activePlayer=1;
   const b=new SimpleTacticsAi(202).decodeNextAction(store.state);
   assert.ok(b instanceof PlayCardAction);
   store.dispatch(b);
   return 'done';
 },deps);
 assert.equal(seen.result,'done');
 assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,before);
 assert.equal(seen.audit.acceptedRoots,2);
 assert.equal(seen.audit.rejectedRoots,0);
 assert.deepEqual(seen.audit.nativeRootOutcomes.map(x=>
   [x.seat,x.family,x.nativeSupporterQuotaAfter]),
   [[0,'lillie',1],[1,'marnie',1]]);
 assert.ok(seen.audit.nativeRootOutcomes.every(x=>
   x.playedPhysicalCardRemainsInHandAfter===false));
});
test('native rejection fails openly and restores decoder',()=>{
 const store=new Store(),before=SimpleTacticsAi.prototype.decodeNextAction;
 let caught;
 try {
   withActorOnlyShuffleSupporterAfterPass(()=>{
     store.dispatch(new AddPlayerAction(101));
     const action=new SimpleTacticsAi(101).decodeNextAction(store.state);
     action.target.index=-1;
     store.dispatch(action);
   },deps);
 }catch(error){caught=error;}
 assert.equal(caught.message,'invalid target');
 assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,before);
 assert.equal(caught.agent2ShuffleSupporterEvidence.rejectedRoots,1);
});
test('previous choice wins and open Pass is preserved when chooser abstains',()=>{
 const store=new Store();
 const skip={...deps,choose:()=>null};
 const x=withActorOnlyShuffleSupporterAfterPass(()=>{
   store.dispatch(new AddPlayerAction(101));
   return new SimpleTacticsAi(101).decodeNextAction(store.state);
 },skip);
 assert.equal(x.result.constructor.name,'PassTurnAction');
 assert.equal(x.audit.acceptedRoots,0);
 assert.equal(x.audit.passRootsObserved,1);
});

test('hypothetical detached Store States preserve their original Pass decisions',()=>{
 const store=new Store();
 const observed=withActorOnlyShuffleSupporterAfterPass(()=>{
   store.dispatch(new AddPlayerAction(101));
   const speculative={...store.state,players:store.state.players.slice()};
   const action=new SimpleTacticsAi(101).decodeNextAction(speculative);
   assert.equal(action.constructor.name,'PassTurnAction');
   return 'ok';
 },deps);
 assert.equal(observed.result,'ok');
 assert.equal(observed.audit.speculativeFallbacks,1);
 assert.equal(observed.audit.passRootsObserved,0);
 assert.equal(observed.audit.attemptedRoots,0);
});
