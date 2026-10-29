'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerSupporterOpportunity,withOwnerSupporterOpportunity}=
  require('../simulation/twinleaf/agent7-owner-supporter-opportunity.cjs');

const SUPPORTER=8;
const held=(name,printing)=>({name,fullName:printing,trainerType:SUPPORTER});
const energy={name:'Psychic Energy',fullName:'Psychic Energy SVE'};
const makeState=(cards,turn=3)=>({
  players:[
    {id:101,hand:{cards},supporterTurn:0,cannotPlaySupporterCards:false},
    {id:202,hand:{cards:[]},supporterTurn:0}
  ],
  activePlayer:0,turn,phase:3,prompts:[]
});
function observation(state,seat=0){
  const owner=state.players[seat];
  return {
    actorSeat:seat,decisionKind:'owner-root',globalTurn:state.turn,
    ownHand:owner.hand.cards.map(c=>c.fullName),
    ownTurnResources:{
      supporterPlayedTurn:owner.supporterTurn,
      supporterPlayLocked:owner.cannotPlaySupporterCards
    },
    ownPublic:{publicTurnRestrictions:{
      supporterPlayLocked:owner.cannotPlaySupporterCards
    }}
  };
}

test('opening player first turn screens ordinary Supporters, preserving Carmine',()=>{
  const state=makeState([
    held("Lillie's Determination","Lillie's Determination MEG"),
    held('Carmine','Carmine TWM'),energy
  ],1);
  const result=ownerSupporterOpportunity(state,0,observation(state),SUPPORTER);
  assert.deepEqual(result.held.map(c=>c.structurallyOpen),[false,true]);
  assert.equal(result.structurallyOpenCount,1);
  assert.equal(result.nativeNullTargetPositiveCount,0);
  state.turn=3;
  state.players[0].supporterTurn=1;
  assert.equal(ownerSupporterOpportunity(state,0,observation(state),SUPPORTER)
    .structurallyOpenCount,0);
  state.players[0].supporterTurn=0;
  state.players[0].cannotPlaySupporterCards=true;
  assert.equal(ownerSupporterOpportunity(state,0,observation(state),SUPPORTER)
    .structurallyOpenCount,0);
});

test('canPlay(null) is independently labelled, not silently promoted to legality',()=>{
  const state=makeState([
    {...held('Carmine','Carmine TWM'),canPlay:()=>true},
    {...held('Guzma','Guzma BUS'),canPlay:()=>false}
  ]);
  const output=ownerSupporterOpportunity(state,0,observation(state),
    SUPPORTER,{nativeCanPlay:true});
  assert.equal(output.structurallyOpenCount,2);
  assert.equal(output.nativeNullTargetPositiveCount,1);
  assert.equal(output.held[1].nativeNullTargetCanPlay,false);
});

test('genuine Store proposal, settlement and Pass are counted without altering policy',()=>{
  class AddPlayerAction{}
  class PlayCardAction{constructor(id,handIndex){
    this.id=id;this.handIndex=handIndex;
  }}
  class PassTurnAction{}
  class Store{
    constructor(state){this.state=state;}
    dispatch(action){
      if(action instanceof PlayCardAction){
        const owner=this.state.players[0];
        owner.hand.cards.splice(action.handIndex,1);
        owner.supporterTurn++;
      }
      return action.constructor.name;
    }
  }
  class Ai{
    constructor(client){this.client=client;}
    decodeNextAction(state){
      return state.players[0].supporterTurn===0?
        new PlayCardAction(101,0):new PassTurnAction();
    }
  }
  const state=makeState([
    held('Carmine','Carmine TWM'),
    held("Lillie's Determination","Lillie's Determination MEG")
  ]);
  const store=new Store(state),bot=new Ai({id:101});
  const oldDecode=Ai.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  const output=withOwnerSupporterOpportunity(()=>{
    assert.equal(store.dispatch(new AddPlayerAction()),'AddPlayerAction');
    assert.equal(store.dispatch(bot.decodeNextAction(state)),'PlayCardAction');
    assert.equal(store.dispatch(bot.decodeNextAction(state)),'PassTurnAction');
    return 42;
  },{SimpleTacticsAi:Ai,Store,GamePhase:{PLAYER_TURN:3},
    TrainerType:{SUPPORTER},observe:observation});
  assert.equal(output.result,42);
  assert.equal(output.audit.decisionsSeen,2);
  assert.equal(output.audit.bySeat[0].firstTurnRoots,1);
  assert.equal(output.audit.bySeat[0].proposedSupporters,1);
  assert.equal(output.audit.bySeat[0].acceptedSupporters,1);
  assert.equal(output.audit.bySeat[0].passWithHeld,1);
  assert.equal(output.audit.bySeat[0].passWithStructurallyOpen,0);
  assert.equal(output.audit.acceptedSupporterSamples[0].settled,true);
  assert.strictEqual(Ai.prototype.decodeNextAction,oldDecode);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
});

test('owner-private receipt is unchanged when concealed opponent hand changes',()=>{
  const state=makeState([held('Carmine','Carmine TWM')]);
  const before=ownerSupporterOpportunity(state,0,observation(state),SUPPORTER);
  state.players[1].hand.cards=[
    {name:'Secret Box',fullName:'Secret Box TWM'},
    {name:'Iono',fullName:'Iono PAL'}
  ];
  assert.deepEqual(ownerSupporterOpportunity(state,0,observation(state),
    SUPPORTER),before);
});
