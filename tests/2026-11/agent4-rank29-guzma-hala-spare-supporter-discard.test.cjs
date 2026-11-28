'use strict';

// Exact original rank29: Guzma & Hala CEC193 x2 and Trainers' Mail ROS92.
// The optional discard of two other cards cannot consume the physical copy
// being played, but CAN consume the second G&H, creating a real turn-one
// Thunder Mountain + DCE search. Source-policy only, not a native match.
const test=require('node:test');
const assert=require('node:assert/strict');
const {POLICY_VERSION,createPolicy,scoreAction}=
  require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');

function request(seat,hand){
  return {
    role:'opponent',seat,prompt:null,
    observation:{
      actorSeat:seat,globalTurn:2,ownHand:hand,
      ownPublic:{
        active:{printing:'Iron Thorns ex TWM 77',hp:230,damage:0,
          tools:[],energies:[]},
        bench:[],prizeCount:6,stadium:[],deckCount:35,
        publicTurnRestrictions:{}
      },
      opponentPublic:{
        active:{printing:'Shadow Rider Calyrex V CRE 74',hp:210,
          damage:0,energies:['Psychic Energy CRE 232'],tools:[]},
        bench:[],stadium:[],prizeCount:6
      },
      ownTurnResources:{energyPlayedTurn:false,supporterPlayedTurn:0,
        stadiumPlayedTurn:false}
    },
    actionFrontier:{items:[
      {kind:'play-card',token:'gh',actorPrinting:'Guzma & Hala CEC 193',
        publicMetadata:{cardType:'supporter'}},
      {kind:'play-card',token:'hammer',actorPrinting:'Crushing Hammer EPO 92',
        publicMetadata:{cardType:'item'}},
      {kind:'pass',token:'pass'}
    ]}
  };
}
for(const seat of [0,1]){
  const policy=createPolicy({role:'opponent',seat,
    policyVersion:POLICY_VERSION,config:{}});
  test('seat '+seat+': spare G&H plus disposable Trainers Mail enables 2-card turbo',()=>{
    const r=request(seat,[
      'Guzma & Hala CEC 193','Guzma & Hala CEC 193',
      "Trainers' Mail ROS 92"
    ]);
    assert.equal(scoreAction(r.actionFrontier.items[0],r),210);
    assert.equal(scoreAction(r.actionFrontier.items[1],r),125);
    assert.deepEqual(policy.decide(r),{kind:'select-action',token:'gh'});
  });
  test('seat '+seat+': one G&H plus only Trainers Mail cannot claim 2-card turbo',()=>{
    const r=request(seat,['Guzma & Hala CEC 193',"Trainers' Mail ROS 92"]);
    assert.equal(scoreAction(r.actionFrontier.items[0],r),90,
      'mandatory Stadium-only search remains legal');
    assert.deepEqual(policy.decide(r),{kind:'select-action',token:'hammer'});
  });
  test('seat '+seat+': two G&H without another discard still cannot claim 2-card turbo',()=>{
    const r=request(seat,['Guzma & Hala CEC 193','Guzma & Hala CEC 193']);
    assert.equal(scoreAction(r.actionFrontier.items[0],r),90);
    assert.deepEqual(policy.decide(r),{kind:'select-action',token:'hammer'});
  });
}
