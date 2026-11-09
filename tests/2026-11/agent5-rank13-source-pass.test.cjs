'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withSourceOwnerTrainerPassAudit}=
  require('../../simulation/twinleaf/agent5/rank13-owner-pass-trainers.cjs');

class AddPlayerAction {}
class PassTurnAction {}

function fakeGame(){
  const owner={
    id:'original-source',
    hand:{cards:[
      {fullName:'Mysterious Treasure FLI',superType:'TRAINER',trainerType:'ITEM'},
      {fullName:'Grass Energy MEE',superType:'ENERGY'}
    ]}
  };
  const opponent={id:'candidate',hand:{cards:[{fullName:'hidden-secret'}]}};
  class Store{
    constructor(){
      this.state={players:[opponent,owner],activePlayer:1,turn:2,prompts:[]};
    }
    dispatch(action){
      if(action instanceof PassTurnAction){
        // Native pass may change the player's physical hand while advancing
        // the turn; the observer must preserve the snapshot from before it.
        owner.hand.cards.pop();
        this.state.turn=3;
        this.state.activePlayer=0;
      }
      return true;
    }
  }
  const observe=()=>({
    decisionKind:'owner-root',actorSeat:1,globalTurn:2,
    ownHand:['Mysterious Treasure FLI','Grass Energy MEE'],
    ownPublic:{active:{printing:'Kyurem SFA'},deckCount:40,prizeCount:6},
    opponentPublic:{active:{printing:'Gengar & Mimikyu-GX TEU'},handCount:6},
    ownTurnResources:{supporterPlayedTurn:0,itemPlayLocked:false},
    ownerK1:false
  });
  const row={trial:{id:'13:2026:A:new-moon-lockbreaker-v1'},
    rootActionLedger:[{
      actionOrdinal:20,turnBefore:2,turnAfter:2,
      playerSlot:1,action:'PassTurnAction'
    }]};
  return {Store,observe,row,owner};
}

test('native source own-hand Trainer snapshot survives advancing Pass',()=>{
  const env=fakeGame();
  const before=env.Store.prototype.dispatch;
  const output=withSourceOwnerTrainerPassAudit(()=>{
    const store=new env.Store();
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PassTurnAction());
    return {selected:{rawDevelopment:{rows:[env.row]}}};
  },{Store:env.Store,observe:env.observe,sourceSeat:1});
  assert.equal(output.audit.count,1);
  assert.equal(output.audit.rootOrdinalLinked,true);
  assert.equal(output.audit.verifiedNativeTurnTransitions,1);
  assert.equal(output.audit.nativeStoresCaptured,1);
  assert.equal(output.audit.events[0].rootActionOrdinal,20);
  assert.equal(output.audit.events[0].heldCards[0].printing,
    'Mysterious Treasure FLI');
  assert.equal(output.audit.events[0].heldCards[0].isTrainer,true);
  assert.equal(output.audit.events[0].heldCards[1].isTrainer,false);
  assert.equal(output.audit.events[0].actorHandPrintings.length,2);
  assert.equal(env.owner.hand.cards.length,1);
  assert.equal(Object.hasOwn(output.audit.events[0].opponentPublic,'hand'),false);
  assert.strictEqual(env.Store.prototype.dispatch,before);
});

test('observer restores actual prototype on a native callback exception',()=>{
  const env=fakeGame();
  const before=env.Store.prototype.dispatch;
  assert.throws(()=>withSourceOwnerTrainerPassAudit(()=>{
    const store=new env.Store();
    store.dispatch(new AddPlayerAction());
    throw new Error('native-failure');
  },{Store:env.Store,observe:env.observe}),/native-failure/);
  assert.strictEqual(env.Store.prototype.dispatch,before);
});
