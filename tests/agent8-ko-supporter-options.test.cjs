'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {previousTurnResponseOptions}=
  require('../simulation/twinleaf/agent8-ko-supporter-options.cjs');
const isBasic=name=>name==='Psychic Energy MEE';

/** @param {0|1} seat @param {boolean|null} previousKO */
function setup(seat,previousKO){
  return {
    view:{actorSeat:seat,globalTurn:9,decisionKind:'owner-root',
      ownHand:['Raihan EVS','Teammates PRC','Guzma BUS'],
      ownPublic:{deckCount:12,discard:['Psychic Energy MEE']},
      ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false}},
    receipt:{actorSeat:seat,turn:9,
      priorOpponentTurnKO:{any:previousKO,byAttack:false}}
  };
}

for(const seat of [0,1]){
  test('previous-turn public response offers competing lines, seat '+seat,()=>{
    const {view,receipt}=setup(seat,true);
    assert.deepEqual(previousTurnResponseOptions(view,receipt,isBasic),[
      {printing:'Teammates PRC',handIndex:1,searchMaximum:2},
      {printing:'Raihan EVS',handIndex:0,
        attachBasicFromDiscard:true,searchMaximum:1}
    ]);
    receipt.priorOpponentTurnKO.any=false;
    assert.deepEqual(previousTurnResponseOptions(view,receipt,isBasic),[]);
    receipt.priorOpponentTurnKO.any=null;
    assert.deepEqual(previousTurnResponseOptions(view,receipt,isBasic),[]);
  });
}

test('no free conditional Supporter without basic-energy and unused turn',()=>{
  const {view,receipt}=setup(0,true);
  view.ownPublic.discard=['Double Dragon Energy ROS'];
  assert.deepEqual(previousTurnResponseOptions(view,receipt,isBasic),
    [{printing:'Teammates PRC',handIndex:1,searchMaximum:2}]);
  view.ownTurnResources.supporterPlayedTurn=1;
  assert.deepEqual(previousTurnResponseOptions(view,receipt,isBasic),[]);
  view.ownTurnResources.supporterPlayedTurn=0;
  view.ownTurnResources.supporterPlayLocked=true;
  assert.deepEqual(previousTurnResponseOptions(view,receipt,isBasic),[]);
});

test('the detached options refuse mismatched event epochs',()=>{
  const {view,receipt}=setup(0,true);
  receipt.turn=8;
  assert.throws(()=>previousTurnResponseOptions(view,receipt,isBasic));
});
