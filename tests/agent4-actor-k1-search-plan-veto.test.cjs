'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {preflightOwnerSearchPlan,compareOwnerSearchPlans} =
  require('../simulation/twinleaf/actor-k1-search-plan-veto.cjs');

const THUNDER='Thunder Mountain Prism Star LOT';
const DCE='Double Colorless Energy SUM';
const GUZMA='Guzma & Hala CEC';

function actor(seat=0){
  return {
    actorSeat:seat,globalTurn:2,decisionKind:'owner-root',
    ownHand:[GUZMA,'Bicycle PLS'],
    ownPublic:{bench:[null,null,null,null,null]},
    ownTurnResources:{
      supporterPlayLocked:false,supporterPlayedTurn:-1,
      itemPlayLocked:false,toolPlayLocked:false,
      stadiumPlayLocked:false,stadiumPlayedTurn:-1,
      energyPlayLocked:false,energyPlayedTurn:-1
    },
    opponentPublic:{handCount:5}
  };
}
function k1(seat,target,available){
  return {
    ownerSeat:seat,epoch:1,observedAt:{turn:2,promptId:'12'},
    registeredPrintings:[{printing:target,copies:1}],
    knownPrintings:available?[{printing:target,copies:1}]:[],
    knownPrized:available?[]:[{printing:target,copies:1}],
    exactMembershipKnown:true,deckMembershipStale:false,
    prizeInferenceCertified:true
  };
}
const setup={
  id:'Guzma Hala fetch Thunder',actionKind:'supporter',
  handPrintings:[GUZMA],
  deckRequirements:[{printing:THUNDER,copies:1}]
};
const alternative={id:'Preserve supporter',actionKind:'other'};

test('K0 unknown Prize assignment cannot pre-veto a planned Stadium search',()=>{
  const view=actor();
  const result=preflightOwnerSearchPlan(view,null,setup);
  assert.equal(result.status,'not-disproven');
  assert.deepEqual(result.reasons,[]);
  assert.equal(result.nativeLegalityCertified,false);
  assert.equal(compareOwnerSearchPlans(view,null,[setup,alternative])
    .firstNotDisproven,setup.id);
});

test('rank24 Tag Call owner K1 blocks only the absent target-dependent line',()=>{
  const view=actor(),memory=k1(0,THUNDER,false);
  const response=compareOwnerSearchPlans(view,memory,[setup,alternative]);
  assert.equal(response.firstNotDisproven,alternative.id);
  assert.equal(response.ledger[0].status,'blocked');
  assert.deepEqual(response.ledger[0].reasons,[{
    kind:'known-owner-deck-target-deficit',printing:THUNDER,
    needed:1,available:0,prizeStatus:'known-prized'
  }]);
  assert.equal(response.ledger[1].status,'not-disproven');
  assert.equal(response.qualifiedGame,false);
});

test('original rank6 G&H K1 can expose a different sole DCE resource failure',()=>{
  const view=actor(),memory=k1(0,DCE,false);
  const desired={...setup,deckRequirements:[{printing:DCE,copies:1}]};
  assert.equal(preflightOwnerSearchPlan(view,memory,desired).status,'blocked');
  const unknown=preflightOwnerSearchPlan(view,memory,setup);
  assert.equal(unknown.status,'blocked',
    'Searching a concrete target absent from a fresh owner deck also fails');
  assert.equal(unknown.reasons[0].prizeStatus,'unknown',
    'No evidence establishes why the other resource is outside deck');
});

test('an available singleton and a same-printing two-copy partial-Prize stay live',()=>{
  const view=actor();
  assert.equal(preflightOwnerSearchPlan(view,k1(0,THUNDER,true),setup)
    .status,'not-disproven');
  const partial={
    ...k1(0,THUNDER,true),
    registeredPrintings:[{printing:THUNDER,copies:2}],
    knownPrized:[{printing:THUNDER,copies:1}]
  };
  assert.equal(preflightOwnerSearchPlan(view,partial,setup).status,
    'not-disproven');
  assert.equal(preflightOwnerSearchPlan(view,partial,{
    ...setup,deckRequirements:[{printing:THUNDER,copies:2}]}).status,
  'blocked');
});

test('new owner knowledge with stale deck contents cannot invent current scarcity',()=>{
  const view=actor();
  const original=k1(0,THUNDER,true);
  const stale={...original,deckMembershipStale:true,exactMembershipKnown:false};
  assert.equal(preflightOwnerSearchPlan(view,stale,setup).status,
    'not-disproven');
  const knownAllPrized={...k1(0,THUNDER,false),
    deckMembershipStale:true,exactMembershipKnown:false};
  assert.deepEqual(
    preflightOwnerSearchPlan(view,knownAllPrized,setup).reasons,
    [{kind:'all-registered-copies-known-prized',printing:THUNDER,needed:1}]);
});

test('spent Supporter, locks, hand, Bench and ordinary attachment guard independent resources',()=>{
  const view=actor(),other={id:'Plan',actionKind:'other',
    handPrintings:['Missing SET'],freeBenchNeeded:4};
  view.ownPublic.bench=[{printing:'Bench A'},null,null,null,null];
  assert.equal(preflightOwnerSearchPlan(view,null,other).status,'blocked');
  view.ownPublic.bench=[{printing:'Bench A'},{printing:'Bench B'},
    null,null,null];
  const negative=preflightOwnerSearchPlan(view,null,other);
  assert.deepEqual(negative.reasons.map(r=>r.kind),[
    'required-hand-printing-unavailable','insufficient-public-bench-space']);
  view.ownTurnResources.supporterPlayedTurn=2;
  assert.equal(preflightOwnerSearchPlan(view,null,setup).reasons[0].kind,
    'supporter-quota-spent');
  view.ownTurnResources.itemPlayLocked=true;
  assert.equal(preflightOwnerSearchPlan(view,null,{
    id:'Played item',actionKind:'item'}).reasons[0].kind,'item-locked');
  view.ownTurnResources.energyPlayedTurn=2;
  assert.equal(preflightOwnerSearchPlan(view,null,{
    id:'Attach',actionKind:'energy'}).reasons[0].kind,
    'energy-attachment-quota-spent');
});

test('opponent hidden zones cannot change plan, wrong seat or future K1 is rejected',()=>{
  const view=actor(1),memory=k1(1,THUNDER,false);
  const expected=preflightOwnerSearchPlan(view,memory,setup);
  view.opponentPublic.hiddenDeck=['fictional opponent secret'];
  view.opponentPublic.hiddenHand=['another secret'];
  assert.deepEqual(preflightOwnerSearchPlan(view,memory,setup),expected);
  assert.throws(()=>preflightOwnerSearchPlan(view,k1(0,THUNDER,false),setup),
    /physical seat/);
  assert.throws(()=>preflightOwnerSearchPlan(view,{
    ...memory,observedAt:{turn:3,promptId:'12'}},setup),/future/);
  assert.throws(()=>compareOwnerSearchPlans(view,memory,[setup,setup]),
    /distinct/);
});
