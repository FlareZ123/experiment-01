'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {eligibleOwnerGuzma,VERSION}=
  require('../simulation/twinleaf/agent35-source-guzma-after-rope.cjs');
const REGISTERED=require(
  '../results/aichi-2026/registrations/agent35-rank6-after-rope-guzma-20261105.json');

function view(){
  return {
    decisionKind:'owner-root',globalTurn:12,
    ownHand:['Guzma BUS','Guzma BUS','Guzma BUS','Plumeria BUS'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      stadium:['Thunder Mountain Prism Star LOT'],
      active:{printing:'Iron Thorns ex TWM',energies:['Speed Lightning Energy RCL']},
      bench:[
        {printing:'Iron Thorns ex TWM',energies:[
          'Capture Energy RCL','Speed Lightning Energy RCL']},
        {printing:'Iron Thorns ex TWM',energies:[]}
      ],
      publicTurnRestrictions:{supporterPlayLocked:false}
    },
    opponentPublic:{bench:[
      {printing:'Unown AOR',energies:[]},null
    ]}
  };
}

test('actual registered owner-visible source state proposes one Guzma',()=>{
  assert.equal(VERSION,'agent35-source-guzma-after-rope-real-store-v1');
  assert.equal(REGISTERED.seed,3858002039);
  assert.equal(REGISTERED.thirdRoot.ownerSeat,0);
  assert.deepEqual(eligibleOwnerGuzma(view(),REGISTERED.thirdRoot),{
    index:0,benchIndex:0
  });
});

test('Guzma eligibility requires live owner hand, turn and unused Supporter',()=>{
  for(const change of [
    v=>{v.decisionKind='opponent-root';},
    v=>{v.globalTurn=11;},
    v=>{v.globalTurn=13;},
    v=>{v.ownHand=[];},
    v=>{v.ownTurnResources.supporterPlayedTurn=1;},
    v=>{v.ownTurnResources.supporterPlayLocked=true;},
    v=>{v.ownPublic.stadium=[];},
    v=>{v.ownPublic.stadium=['Wondrous Labyrinth Prism Star TEU'];},
    v=>{v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;},
    v=>{v.ownPublic.bench=[];},
    v=>{v.ownPublic.bench[0].energies=['Capture Energy RCL'];},
    v=>{v.ownPublic.bench[0].printing='Wobbuffet PHF';},
    v=>{v.opponentPublic.bench=[];}
  ]){
    const v=view();
    change(v);
    assert.equal(eligibleOwnerGuzma(v,REGISTERED.thirdRoot),null);
  }
});

test('never infer third-root eligibility from only opponent hidden cards',()=>{
  const v=view();
  v.opponentPublic={bench:[]};
  v.opponentHiddenHand=['Unown AOR'];
  assert.equal(eligibleOwnerGuzma(v,REGISTERED.thirdRoot),null);
});
