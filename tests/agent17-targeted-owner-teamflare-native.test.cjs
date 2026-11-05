'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {withTargetedTeamFlareNative} =
  require('../simulation/twinleaf/agent17-targeted-owner-teamflare-native.cjs');

class PassTurnAction {}
class FakePlayCardAction {
  constructor(id,handIndex,target) {
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class FakeTactics {
  decodeNextAction() {return new PassTurnAction();}
}

function actorView(state,seat) {
  return {decisionKind:'owner-root',
    actorSeat:seat,globalTurn:state.turn,
    ownHand:['Team Flare Grunt XY','Arven OBF'],
    ownPublic:{
      active:{printing:'Rotom V LOR'},
      resolvingSupporter:[],
      publicTurnRestrictions:{supporterPlayLocked:false}
    },
    opponentPublic:{
      active:{printing:'Trevenant & Dusknoir-GX SMP',
        energies:['Psychic Energy MEE','Psychic Energy MEE']}
    },
    ownTurnResources:{
      supporterPlayedTurn:0,supporterPlayLocked:false
    }
  };
}
const dependency={
  targetSeat:0,targetTurn:59,SimpleTacticsAi:FakeTactics,
  PlayCardAction:FakePlayCardAction,
  PlayerType:{ANY:0},SlotType:{BOARD:9},observe:actorView
};
const active=()=>({activePlayer:0,turn:59,prompts:[],
  players:[{id:101},{id:202}]});

test('only frozen source Pass becomes exact typed owner Team Flare Grunt',()=>{
  const before=FakeTactics.prototype.decodeNextAction;
  const actor=new FakeTactics(),state=active();
  const {result,audit}=withTargetedTeamFlareNative(()=>
    actor.decodeNextAction(state),dependency);
  assert.equal(FakeTactics.prototype.decodeNextAction,before);
  assert.ok(result instanceof FakePlayCardAction);
  assert.equal(result.id,101);
  assert.equal(result.handIndex,0);
  assert.deepEqual(result.target,{player:0,slot:9,index:0});
  assert.equal(audit.originalPassWindowObserved,1);
  assert.equal(audit.ownerOnlyOffers,1);
  assert.equal(audit.typedNativeProposals,1);
  assert.equal(audit.competitiveGameQualified,false);
});

test('different turns and the other seat retain original Pass',()=>{
  const actor=new FakeTactics();
  const original=FakeTactics.prototype.decodeNextAction;
  const result=withTargetedTeamFlareNative(()=>{
    const a=active();a.turn=61;
    const b=active();b.activePlayer=1;
    return [actor.decodeNextAction(a),actor.decodeNextAction(b)];
  },dependency);
  assert.equal(result.audit.typedNativeProposals,0);
  assert.ok(result.result.every(x=>x instanceof PassTurnAction));
  assert.equal(FakeTactics.prototype.decodeNextAction,original);
});

test('owner Supporter lock or already-used quota declines',()=>{
  const actor=new FakeTactics();
  const locked=()=>({...actorView(active(),0),ownTurnResources:{
    supporterPlayedTurn:1,supporterPlayLocked:false
  }});
  const result=withTargetedTeamFlareNative(()=>
    actor.decodeNextAction(active()),{...dependency,observe:locked});
  assert.ok(result.result instanceof PassTurnAction);
  assert.equal(result.audit.ownerOnlyOffers,0);
});

test('observer failure restores original bot decoder',()=>{
  const before=FakeTactics.prototype.decodeNextAction;
  assert.throws(()=>withTargetedTeamFlareNative(()=>
    new FakeTactics().decodeNextAction(active()),
  {...dependency,observe:()=>{throw Error('Native source contract broken');}}),
  /Native source contract broken/);
  assert.equal(FakeTactics.prototype.decodeNextAction,before);
});
