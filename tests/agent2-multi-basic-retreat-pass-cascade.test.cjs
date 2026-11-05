'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {STEPS,classifyOwnerMultiBasicRetreatPass}=
  require('../simulation/twinleaf/agent2-multi-basic-retreat-pass-cascade.cjs');
const {chooseMultiBasicPaidRetreatInDeckRace}=
  require('../simulation/twinleaf/agent2-actor-multi-basic-paid-retreat-frontier.cjs');
const P='Psychic Energy MEE';
const catalog={colorlessEnergyType:9,
  basicEnergies:new Set([P]),basicEnergyTypes:{Psychic:5},
  specialConditions:{ASLEEP:1,PARALYZED:2}};
/** @returns {object} Detached source-specific physical conditions are not needed. */
function view(){
  return {decisionKind:'owner-root',actorSeat:1,globalTurn:33,
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{deckCount:19,
      publicTurnRestrictions:{attackLockTurnsRemaining:0},
      active:{printed:{retreatCost:[9,9,9]},energies:[P,P,P],tools:[],
        specialConditions:[],publicRestrictions:{},
        attacks:[{name:'Shred',cost:[8,9,9],damage:80}]},
      bench:[{printing:'Supported Basic',energies:[P,P],
        specialConditions:[],publicRestrictions:{},
        attacks:[{name:'Shadow Mist',cost:[5],damage:10}]}]},
    opponentPublic:{deckCount:30,
      active:{hp:70,damage:10}}};
}
test('all eight independent and cumulative stages pass nominal offer',()=>{
  const x=view(),c=classifyOwnerMultiBasicRetreatPass(x,catalog);
  assert.equal(c.wouldNominallyOffer,true);
  assert.equal(c.firstFailure,null);
  assert.deepEqual(Object.values(c.stages),STEPS.map(()=>true));
  assert.deepEqual(Object.values(c.cumulative),STEPS.map(()=>true));
  assert.ok(chooseMultiBasicPaidRetreatInDeckRace(x,catalog));
});
test('independent rejection attribution and source selector agree',()=>{
  const mutations=[
    [0,v=>v.ownTurnResources.retreatedTurn=33],
    [1,v=>v.ownPublic.active.printed.retreatCost=[9]],
    [2,v=>v.ownPublic.active.energies.pop()],
    [3,v=>v.ownPublic.deckCount=31],
    [4,v=>v.opponentPublic.active.hp=0],
    [5,v=>v.ownPublic.active.attacks[0].cost=[5,9,9]],
    [6,v=>v.ownPublic.bench[0].energies=[]],
    [7,v=>v.opponentPublic.active.hp=300]
  ];
  for(const [i,change] of mutations){
    const x=view();change(x);
    const c=classifyOwnerMultiBasicRetreatPass(x,catalog);
    assert.equal(c.firstFailure,STEPS[i]);
    assert.equal(c.wouldNominallyOffer,false);
    assert.equal(chooseMultiBasicPaidRetreatInDeckRace(x,catalog),null);
    assert.equal(c.stages[STEPS[i]],false);
  }
});
test('the true classifier reads no concealed opponent identity',()=>{
  const a=view(),b=view(),original=JSON.stringify(a);
  b.opponentSecret={hand:['secret'],prizes:['secret']};
  assert.deepEqual(classifyOwnerMultiBasicRetreatPass(a,catalog),
    classifyOwnerMultiBasicRetreatPass(b,catalog));
  assert.equal(JSON.stringify(a),original);
});
