'use strict';

// Original Aichi rank29 lists Plumeria BUS120 x4. Playing one Supporter
// removes ONE physical Plumeria from hand; the others remain legal discard
// targets for its "Discard 2 cards" cost. This is a source-policy unit
// regression, NOT a native game or claim to optimal discard decisions.
const test=require('node:test');
const assert=require('node:assert/strict');
const {POLICY_VERSION,createPolicy,scoreAction}=
  require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');

function scenario(seat,hand){
  return {
    role:'opponent',seat,prompt:null,
    observation:{
      actorSeat:seat,globalTurn:5,ownHand:hand,
      ownPublic:{
        active:{printing:'Iron Thorns ex TWM 77',
          hp:230,damage:0,energies:[],tools:[]},
        bench:[],prizeCount:6,stadium:[],publicTurnRestrictions:{}
      },
      opponentPublic:{
        active:{printing:'Shadow Rider Calyrex V CRE 74',hp:210,
          damage:0,energies:['Psychic Energy CRE 232'],tools:[]},
        bench:[],prizeCount:6,stadium:[]
      },
      ownTurnResources:{supporterPlayedTurn:0}
    },
    actionFrontier:{items:[
      {kind:'play-card',token:'plumeria',actorPrinting:'Plumeria BUS 120',
        publicMetadata:{cardType:'supporter'}},
      {kind:'pass',token:'pass'}
    ]}
  };
}

for(const seat of [0,1]){
  const policy=createPolicy({role:'opponent',seat,
    policyVersion:POLICY_VERSION,config:{}});
  test('seat '+seat+': spare Plumeria + Trainers Mail legally pay 2-card cost while preserving Thunder',()=>{
    const r=scenario(seat,[
      'Plumeria BUS 120','Plumeria BUS 120',
      "Trainers' Mail ROS 92",'Thunder Mountain Prism Star LOT 191'
    ]);
    assert.equal(scoreAction(r.actionFrontier.items[0],r),190);
    assert.deepEqual(policy.decide(r),
      {kind:'select-action',token:'plumeria'});
  });
  test('seat '+seat+': singleton Plumeria plus one disposable and protected Thunder remains unrealistic',()=>{
    const r=scenario(seat,[
      'Plumeria BUS 120',"Trainers' Mail ROS 92",
      'Thunder Mountain Prism Star LOT 191'
    ]);
    assert.equal(scoreAction(r.actionFrontier.items[0],r),0);
    assert.deepEqual(policy.decide(r),
      {kind:'select-action',token:'pass'});
  });
  test('seat '+seat+': duplicate alone cannot pay a two-card cost',()=>{
    const r=scenario(seat,[
      'Plumeria BUS 120','Plumeria BUS 120',
      'Thunder Mountain Prism Star LOT 191'
    ]);
    assert.equal(scoreAction(r.actionFrontier.items[0],r),0);
    assert.deepEqual(policy.decide(r),
      {kind:'select-action',token:'pass'});
  });
}
