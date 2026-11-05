'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseMultiBasicPaidRetreatInDeckRace,VERSION}=require(
  '../simulation/twinleaf/agent2-actor-multi-basic-paid-retreat-frontier.cjs');
const P='Psychic Energy MEE';
const catalog={basicEnergies:new Set([P,'Metal Energy MEE']),
  basicEnergyTypes:{Psychic:5,Metal:8},colorlessEnergyType:9,
  specialConditions:{ASLEEP:1,PARALYZED:2}};

/** @returns {object} Exact original rank1 public board, no hidden data. */
function view(){
  return {decisionKind:'owner-root',globalTurn:33,
    ownTurnResources:{retreatedTurn:0},
    ownPublic:{deckCount:19,
      publicTurnRestrictions:{attackLockTurnsRemaining:0},
      active:{printing:'Dialga-GX UPR',
        printed:{retreatCost:[9,9,9]},energies:[P,P,P],tools:[],
        specialConditions:[],publicRestrictions:{},
        attacks:[{name:'Overclock',cost:[8],damage:0},
          {name:'Shred',cost:[8,9,9],damage:80},
          {name:'Timeless-GX',cost:[8,8,8,9,9],damage:150,gxAttack:true}]},
      bench:[{printing:'Mimikyu GRI',energies:[P],
        specialConditions:[],publicRestrictions:{},
        attacks:[{name:'Filch',cost:[9],damage:0}]},
      {printing:'Shadow Rider Calyrex V CRE',energies:[P,P],
        specialConditions:[],publicRestrictions:{},
        attacks:[{name:'Shadow Mist',cost:[5],damage:10},
          {name:'Astral Barrage',cost:[9,9,9],damage:0}]}]},
    opponentPublic:{deckCount:30,
      active:{printing:'Bunnelby PRC',hp:70,damage:0}}};
}
test('generic pure visible planner recognizes actual print-payable source',()=>{
  const v=view(),got=chooseMultiBasicPaidRetreatInDeckRace(v,catalog);
  assert.equal(got?.kind,'paid-retreat');
  assert.equal(got?.benchIndex,1);
  assert.equal(got?.retreatCostUnits,3);
  assert.equal(got?.nominalTurnsToKo,7);
  assert.equal(got?.source,VERSION);
  assert.equal(got?.paperVerified,false);
});
test('negative payment, status, quota, retreat modifier and score guards',()=>{
  const mutators=[
    v=>v.ownPublic.active.energies[2]='Double Colorless Energy NXD',
    v=>v.ownPublic.active.energies.pop(),
    v=>v.ownPublic.active.tools.push('Float Stone BKT'),
    v=>v.ownPublic.active.printed.retreatCost.push(9),
    v=>v.ownTurnResources.retreatedTurn=33,
    v=>v.ownPublic.active.specialConditions.push(1),
    v=>v.ownPublic.active.publicRestrictions.cannotRetreatNextTurn=true,
    v=>v.ownPublic.deckCount=31,
    v=>v.ownPublic.active.attacks[1].cost=[5,9,9],
    v=>v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1,
    v=>v.opponentPublic.active.hp=300,
    v=>v.ownPublic.bench[1].energies=[],
    v=>v.ownPublic.bench[1].publicRestrictions.cannotAttackNextTurn=true
  ];
  for(const mutate of mutators){
    const v=view();mutate(v);
    assert.equal(chooseMultiBasicPaidRetreatInDeckRace(v,catalog),null);
  }
});
test('pure owner observation and unknown opponent identities irrelevant',()=>{
  const a=view(),before=JSON.stringify(a),b=view();
  b.opponentSecret={hand:['unavailable'],deck:['unavailable']};
  assert.deepEqual(chooseMultiBasicPaidRetreatInDeckRace(a,catalog),
    chooseMultiBasicPaidRetreatInDeckRace(b,catalog));
  assert.equal(JSON.stringify(a),before);
});
