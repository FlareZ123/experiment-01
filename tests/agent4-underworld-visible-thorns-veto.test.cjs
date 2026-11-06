'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyVisibleThornsVeto,withPublicThornsUnderworldVeto}=
  require('../simulation/twinleaf/agent4-underworld-visible-thorns-veto.cjs');
const owner=require('../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs');

function ownerView(){
  const vmax={printing:'Shadow Rider Calyrex VMAX CRE',
    abilities:['Underworld Door'],tools:[]};
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:32,
    ownPublic:{active:{printing:'Mewtwo & Mew-GX UNM'},
      bench:[vmax],stadium:[]},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM',
      abilities:['Initialization']},stadium:[]}
  };
}
const intent={kind:'use-underworld-door',
  sourcePrinting:'Shadow Rider Calyrex VMAX CRE',
  position:'bench',benchIndex:0};
test('only visibly locked untooled source with no stadium is vetoed',()=>{
  assert.equal(classifyVisibleThornsVeto(ownerView(),intent).veto,true);
  const stadium=ownerView();stadium.ownPublic.stadium=['Path to the Peak CRE'];
  assert.equal(classifyVisibleThornsVeto(stadium,intent).veto,false);
  const hood=ownerView();hood.ownPublic.bench[0].tools=['Stealthy Hood UNB'];
  assert.equal(classifyVisibleThornsVeto(hood,intent).veto,false);
  const noThorns=ownerView();
  noThorns.opponentPublic.active.printing='Garbodor BKP';
  assert.equal(classifyVisibleThornsVeto(noThorns,intent).veto,false);
  assert.equal(classifyVisibleThornsVeto(ownerView(),null).veto,false);
});
test('guard returns null for locked root, restores original module chooser',()=>{
  const prior=owner.chooseUnderworldDoorRoot;
  owner.chooseUnderworldDoorRoot=()=>intent;
  try{
    const priorStub=owner.chooseUnderworldDoorRoot;
    const o=withPublicThornsUnderworldVeto(()=>{
      assert.equal(owner.chooseUnderworldDoorRoot(ownerView(),{},{}),null);
      assert.deepEqual(owner.chooseUnderworldDoorRoot({
        ...ownerView(),opponentPublic:{active:{printing:'Mew ex',
          abilities:['Restart']},stadium:[]}
      },{},{}),intent);
      return 'native-root';
    });
    assert.equal(o.result,'native-root');
    assert.equal(o.audit.provenVetoes,1);
    assert.equal(o.audit.underworldIntents,2);
    assert.equal(owner.chooseUnderworldDoorRoot,priorStub);
  }finally{owner.chooseUnderworldDoorRoot=prior;}
});
test('guard restores proposer on runner exception',()=>{
  const prior=owner.chooseUnderworldDoorRoot;
  assert.throws(()=>withPublicThornsUnderworldVeto(()=>{
    throw new Error('real native error');
  }),/real native error/);
  assert.equal(owner.chooseUnderworldDoorRoot,prior);
});
