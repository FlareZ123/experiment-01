'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseFrozenFundedPaleMoon,withTargetedFundedPaleMoon}=
  require('../simulation/twinleaf/agent17-targeted-rank1-pale-moon-native.cjs');

class PassTurnAction {}
class FakeAttackAction {
  constructor(id,attackName){this.id=id;this.attackName=attackName;}
}
class FakeTactics {
  decodeNextAction(){return new PassTurnAction();}
}
function actorView(state,seat){
  return {
    decisionKind:'owner-root',actorSeat:seat,globalTurn:state.turn,
    ownPublic:{
      active:{printing:'Trevenant & Dusknoir-GX SMP',
        energies:['Psychic Energy MEE','Psychic Energy MEE'],
        attacks:[{name:'Night Watch',cost:[5,5,5]},
          {name:'Pale Moon-GX',cost:[5,9]}]},
      publicTurnRestrictions:{gxUsed:false,attackLockTurnsRemaining:0,
        cannotUseGXAttacks:false}
    },
    opponentPublic:{active:{printing:'Rotom V LOR'}}
  };
}
const dependency={
  targetSeat:1,targetTurn:60,SimpleTacticsAi:FakeTactics,
  AttackAction:FakeAttackAction,observe:actorView};
const state=()=>({activePlayer:1,turn:60,prompts:[],
  players:[{id:101},{id:202}]});

test('one original owner root generates printed GX name for genuine Store',()=>{
  const before=FakeTactics.prototype.decodeNextAction;
  const r=withTargetedFundedPaleMoon(()=>new FakeTactics()
    .decodeNextAction(state()),dependency);
  assert.ok(r.result instanceof FakeAttackAction);
  assert.equal(r.result.id,202);
  assert.equal(r.result.attackName,'Pale Moon-GX');
  assert.equal(r.audit.ownerPayableProposals,1);
  assert.equal(FakeTactics.prototype.decodeNextAction,before);
  assert.equal(r.audit.competitiveGamesQualified,0);
});

test('other turns, GX-spent, attack-locked, or insufficient Psychic decline',()=>{
  const at=state();at.turn=62;
  const other=withTargetedFundedPaleMoon(()=>
    new FakeTactics().decodeNextAction(at),dependency);
  assert.ok(other.result instanceof PassTurnAction);
  const base=actorView(state(),1);
  assert.equal(chooseFrozenFundedPaleMoon({
    ...base,ownPublic:{...base.ownPublic,
      publicTurnRestrictions:{...base.ownPublic.publicTurnRestrictions,gxUsed:true}}
  }),null);
  assert.equal(chooseFrozenFundedPaleMoon({
    ...base,ownPublic:{...base.ownPublic,
      publicTurnRestrictions:{...base.ownPublic.publicTurnRestrictions,
        attackLockTurnsRemaining:1}}
  }),null);
  assert.equal(chooseFrozenFundedPaleMoon({
    ...base,ownPublic:{...base.ownPublic,
      active:{...base.ownPublic.active,energies:['Psychic Energy MEE']}}
  }),null);
});

test('restores bot original decoder on an observer exception',()=>{
  const previous=FakeTactics.prototype.decodeNextAction;
  assert.throws(()=>withTargetedFundedPaleMoon(()=>
    new FakeTactics().decodeNextAction(state()),{
    ...dependency,observe:()=>{throw Error('Owner scope failure');}
  }),/Owner scope failure/);
  assert.equal(FakeTactics.prototype.decodeNextAction,previous);
});
