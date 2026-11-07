'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preflightOwnerSearchPlan}=
  require('../simulation/twinleaf/actor-k1-search-plan-veto.cjs');

/** Genuine actorObservation uses a Supporter count, not a turn stamp. */
function view(globalTurn,supporterCount){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn,
    ownHand:["Lillie's Determination M1L"],
    ownPublic:{bench:[null,null,null,null,null]},
    ownTurnResources:{
      supporterPlayedTurn:supporterCount,
      supporterPlayLocked:false,itemPlayLocked:false,
      stadiumPlayLocked:false,toolPlayLocked:false,
      energyPlayLocked:false,stadiumPlayedTurn:0,energyPlayedTurn:0
    }
  };
}
const plan={
  id:'lillie',actionKind:'supporter',
  handPrintings:["Lillie's Determination M1L"],
  deckRequirements:[],freeBenchNeeded:0
};

test('used Supporter count=1 at global turn14 must block another Supporter',()=>{
  const result=preflightOwnerSearchPlan(view(14,1),null,plan);
  assert.equal(result.status,'blocked');
  assert.deepEqual(result.reasons.map(x=>x.kind),['supporter-quota-spent']);
  assert.equal(result.nativeLegalityCertified,false);
});

test('zero Supporter uses at global turn14 does not trigger quota veto',()=>{
  const result=preflightOwnerSearchPlan(view(14,0),null,plan);
  assert.equal(result.status,'not-disproven');
  assert.deepEqual(result.reasons,[]);
  assert.equal(result.nativeLegalityCertified,false);
});

test('opening-turn used count still vetoes; global turn stamps remain separate',()=>{
  const first=preflightOwnerSearchPlan(view(1,1),null,plan);
  assert.equal(first.status,'blocked');
  const energyPlan={id:'energy',actionKind:'energy',
    handPrintings:[],deckRequirements:[],freeBenchNeeded:0};
  const stillAvailable=preflightOwnerSearchPlan(view(14,1),null,energyPlan);
  assert.equal(stillAvailable.status,'not-disproven');
  const energySpent={...view(14,1),
    ownTurnResources:{...view(14,1).ownTurnResources,energyPlayedTurn:14}};
  assert.deepEqual(preflightOwnerSearchPlan(energySpent,null,energyPlan)
    .reasons.map(r=>r.kind),['energy-attachment-quota-spent']);
});
