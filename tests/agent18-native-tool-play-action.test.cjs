'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildNativeOwnerToolCandidateAction:build}=
  require('../simulation/twinleaf/agent18-native-tool-play-action.cjs');
class FakePlayCardAction{
  constructor(ownerId,handIndex,target){
    this.ownerId=ownerId;this.handIndex=handIndex;this.target=target;
  }
}
const types={PlayCardAction:FakePlayCardAction,
  PlayerType:{BOTTOM_PLAYER:1},SlotType:{ACTIVE:2,BENCH:3}};
const catalog={toolPrintings:new Set(['Stealthy Hood UNB',
  'Muscle Band XY'])};
function owner(){
  return {
    decisionKind:'owner-root',ownHand:['Stealthy Hood UNB',
      'Psychic Energy MEE','Muscle Band XY'],
    ownTurnResources:{toolPlayLocked:false},
    ownPublic:{
      active:{printing:'Bunnelby PRC',tools:[]},
      bench:[{printing:'Lillipup CEC',tools:[]},null,
        {printing:'Vileplume AOR',tools:['Old Tool']}],
      publicTurnRestrictions:{toolPlayLocked:false}
    }
  };
}
/** @param {string} printing @param {number} handIndex @param {string} slot @param {number} index */
function candidate(printing,handIndex,slot,index){
  return {kind:'attach-tool-candidate',printing,handIndex,slot,index,
    nativeDispatchImplemented:false};
}
test('encodes exact original native rank2 Active Stealthy Hood from detached view',()=>{
  const view=owner(),before=JSON.stringify(view);
  const action=build(view,catalog,candidate('Stealthy Hood UNB',0,
    'active',0),'owner2',types);
  assert.deepStrictEqual(action,new FakePlayCardAction('owner2',0,
    {player:1,slot:2,index:0}));
  assert.equal(JSON.stringify(view),before);
});
test('encodes a Bench recipient without modifying or selecting original game',()=>{
  const view=owner();
  const action=build(view,catalog,candidate('Muscle Band XY',2,
    'bench',0),'owner10',types);
  assert.deepStrictEqual(action,new FakePlayCardAction('owner10',2,
    {player:1,slot:3,index:0}));
});
test('rejects nonexistent or mismatched owner-held printed Tools',()=>{
  const view=owner();
  for(const c of [
    candidate('Stealthy Hood UNB',7,'active',0),
    candidate('Muscle Band XY',0,'active',0),
    candidate('Psychic Energy MEE',1,'active',0),
    candidate('Missing Tool',0,'active',0)
  ]) assert.throws(()=>build(view,catalog,c,'owner',types));
});
test('rejects occupied recipient, nonexistent recipient and invalid Active index',()=>{
  const view=owner();
  for(const c of [
    candidate('Stealthy Hood UNB',0,'bench',2),
    candidate('Stealthy Hood UNB',0,'bench',1),
    candidate('Stealthy Hood UNB',0,'active',1),
    candidate('Stealthy Hood UNB',0,'bench',-1),
    candidate('Stealthy Hood UNB',0,'opponent-active',0)
  ]) assert.throws(()=>build(view,catalog,c,'owner',types));
});
test('rejects both actor Tool locks and wrong decision phase',()=>{
  const view=owner(),c=candidate('Stealthy Hood UNB',0,'active',0);
  view.ownTurnResources.toolPlayLocked=true;
  assert.throws(()=>build(view,catalog,c,'owner',types));
  view.ownTurnResources.toolPlayLocked=false;
  view.ownPublic.publicTurnRestrictions.toolPlayLocked=true;
  assert.throws(()=>build(view,catalog,c,'owner',types));
  view.ownPublic.publicTurnRestrictions.toolPlayLocked=false;
  view.decisionKind='owner-prompt';
  assert.throws(()=>build(view,catalog,c,'owner',types));
});
