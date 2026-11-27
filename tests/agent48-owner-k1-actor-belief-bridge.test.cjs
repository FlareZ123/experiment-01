'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {captureOwnerK1, advanceOwnerK1, createOwnerPrizeCompositionGuard} =
  require('../simulation/twinleaf/owner-k1-prize-knowledge.cjs');
const {projectOwnerK1PrizeKnowledge} =
  require('../simulation/twinleaf/2026-11/agent48-owner-k1-sampler-projection.cjs');
const {actorObservation} =
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildTwinleafBeliefInput} =
  require('../simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs');

const REGISTERED = [
  ...Array(20).fill('A SET 001'),
  ...Array(20).fill('B SET 002'),
  ...Array(20).fill('C SET 003')
];

function card(fullName) {
  return {fullName, name:fullName, hp:100, attacks:[], powers:[],
    stage:'BASIC', cardType:['COLORLESS'], retreat:[],
    weakness:[], resistance:[]};
}
function occupied(printing) {
  const c=card(printing);
  return {getPokemonCard:()=>c,cards:[c],damage:0,
    energies:{cards:[]},tools:[]};
}
function empty() {
  return {getPokemonCard:()=>null,cards:[],damage:0,
    energies:{cards:[]},tools:[]};
}
function player(id, activeName, hand, deck, prizes) {
  return {
    id, active:occupied(activeName),
    bench:Array.from({length:5},empty),
    hand:{cards:hand.map(card)},
    deck:{cards:deck.map(card)},
    prizes:prizes.map(name=>({cards:[card(name)]})),
    discard:{cards:[]},lostzone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},
    supporterTurn:0,retreatedTurn:0,energyPlayedTurn:0,
    stadiumPlayedTurn:0,stadiumUsedTurn:0,usedVSTAR:false
  };
}
function fixture() {
  class ChooseCardsPrompt {}
  // Seat 1 has a real owner-search prompt. Its registered 60 are exactly
  // partitioned into visible C, hand B, deck A18/B19/C19, and Prize A2.
  const owner=player(101,'C SET 003',['B SET 002'],[
    ...Array(18).fill('A SET 001'),
    ...Array(19).fill('B SET 002'),
    ...Array(19).fill('C SET 003')
  ],['A SET 001','A SET 001']);
  const opponent=player(100,'X SET 004',['Y SET 005'],
    Array(56).fill('Z SET 006'),['P SET 007','P SET 007']);
  const pending=new ChooseCardsPrompt();
  Object.assign(pending,{playerId:101,id:'seat1-search-1',
    cards:owner.deck,result:undefined});
  return {owner,opponent,state:{
    activePlayer:1,turn:6,phase:5,prompts:[pending],
    players:[opponent,owner]
  }};
}

test('authenticated physical-seat K1 reaches actor observation and belief sampler',()=>{
  const {state}=fixture();
  const captured=captureOwnerK1(state,1,REGISTERED);
  assert.equal(captured.prizeInferenceCertified,true);
  assert.deepEqual(captured.knownPrized,
    [{printing:'A SET 001',copies:2}]);

  const projected=projectOwnerK1PrizeKnowledge(captured,{
    expectedSeat:1,currentTurn:6,currentPrizeCount:2
  });
  assert.equal(projected.ownerSeat,1);
  assert.equal(projected.ownerK1Snapshot.ownerSeat,1);
  const observed=actorObservation(state,1,{
    ownerK1Snapshot:projected.ownerK1Snapshot
  });
  assert.equal(observed.actorSeat,1);
  assert.equal(observed.ownerK1.exactMembershipKnown,true);
  assert.deepEqual(observed.ownerK1.knownPrintings,
    [{printing:'A SET 001',copies:2}]);
  const belief=buildTwinleafBeliefInput({
    actorSeat:1,seat:1,observation:observed,
    registered60:REGISTERED,
    beliefKnowledgeBySeat:[{verified:true,mode:'K0'},projected]
  });
  assert.equal(belief.exactPrizeMembership,true);
  assert.deepEqual(belief.knownPrizeCards,['A SET 001','A SET 001']);
  assert.equal(belief.knownHand[0],'B SET 002');
  assert.equal(belief.deckCount,56);
  // A wrong-seat ledger must fail even if the actor view itself is correct.
  assert.throws(()=>buildTwinleafBeliefInput({
    actorSeat:1,seat:1,observation:observed,registered60:REGISTERED,
    beliefKnowledgeBySeat:[{verified:true,mode:'K0'},
      {...projected,ownerSeat:0}]
  }),/different physical seat/);
});

test('opposite physical-seat injection is rejected before belief sampling',()=>{
  const {state}=fixture();
  const captured=captureOwnerK1(state,1,REGISTERED);
  const projected=projectOwnerK1PrizeKnowledge(captured,{
    expectedSeat:1,currentTurn:6,currentPrizeCount:2
  });
  state.prompts=[];
  state.activePlayer=0;
  assert.throws(()=>actorObservation(state,0,{
    ownerK1Snapshot:projected.ownerK1Snapshot
  }),/different physical seat/);
  assert.throws(()=>projectOwnerK1PrizeKnowledge(captured,{
    expectedSeat:0,currentTurn:6,currentPrizeCount:2
  }),/different physical seat/);
});

test('Prize composition change revokes sampler K1 rather than retaining stale membership',()=>{
  const {state}=fixture();
  const captured=captureOwnerK1(state,1,REGISTERED);
  const invalid=advanceOwnerK1(captured,{
    currentOwnPrizeCount:1,
    deckMayHaveChanged:false,
    prizeCompositionMayHaveChanged:true
  });
  const projected=projectOwnerK1PrizeKnowledge(invalid,{
    expectedSeat:1,currentTurn:7,currentPrizeCount:1
  });
  assert.equal(projected.mode,'K0');
  assert.equal(projected.ownerK1Snapshot,null);
  assert.deepEqual(projected.knownPrizePrintings,[]);
});

test('attached Energy in both native stack and Energy view counts once at K1',()=>{
  const {state,owner}=fixture();
  // The native Pokémon stack includes the exact same attached Energy card
  // object projected a second time through its energies collection.
  const energy=card('Psychic Energy SET');
  owner.active.cards.push(energy);
  owner.active.energies.cards.push(energy);
  const index=owner.deck.cards.findIndex(c=>c.fullName==='C SET 003');
  assert.ok(index>=0);
  owner.deck.cards.splice(index,1);
  const registered=REGISTERED.slice();
  registered.splice(registered.lastIndexOf('C SET 003'),1,'Psychic Energy SET');

  const observed=actorObservation(state,1);
  const outside=require('../simulation/twinleaf/owner-k1-prize-knowledge.cjs')
    .knownOutsideDeck(observed);
  assert.equal(outside.filter(x=>x==='Psychic Energy SET').length,1,
    'same attached physical card cannot be counted twice');
  const captured=captureOwnerK1(state,1,registered);
  assert.equal(captured.prizeInferenceCertified,true,
    'a fully accounted source deck search must remain certified');
  assert.deepEqual(captured.knownPrized,[{printing:'A SET 001',copies:2}]);
});

test('same-trial K1 custody survives an ordinary action and fails on a same-count Prize swap',()=>{
  const {state,owner}=fixture();
  const captured=captureOwnerK1(state,1,REGISTERED);
  const guard=createOwnerPrizeCompositionGuard(state,1);
  assert.ok(guard);
  assert.equal(guard.unchanged(state),true);

  // The actor finishes a search, then performs a non-Prize action.
  state.prompts=[];
  state.turn=7;
  owner.hand.cards.push(card('B SET 002'));
  assert.equal(guard.unchanged(state),true);
  const kept=advanceOwnerK1(captured,{
    currentOwnPrizeCount:2,deckMayHaveChanged:true,
    prizeCompositionMayHaveChanged:!guard.unchanged(state)
  });
  assert.equal(kept.prizeInferenceCertified,true);
  assert.equal(projectOwnerK1PrizeKnowledge(kept,{
    expectedSeat:1,currentTurn:7,currentPrizeCount:2
  }).mode,'K1');

  // Physical card exchange changes which unseen card is Prized,
  // even though the number of Prizes remains exactly two.
  owner.prizes[0].cards=[owner.deck.cards.pop()];
  assert.equal(guard.unchanged(state),false);
  const revoked=advanceOwnerK1(kept,{
    currentOwnPrizeCount:2,deckMayHaveChanged:true,
    prizeCompositionMayHaveChanged:!guard.unchanged(state)
  });
  assert.equal(revoked.prizeInferenceCertified,false);
  assert.equal(projectOwnerK1PrizeKnowledge(revoked,{
    expectedSeat:1,currentTurn:7,currentPrizeCount:2
  }).mode,'K0');
});

test('malformed detached Energy/Tool overlap fails closed before Prize inference',()=>{
  const {state,owner}=fixture();
  const energy=card('Psychic Energy SET');
  owner.active.energies.cards=[energy];
  assert.throws(()=>captureOwnerK1(state,1,REGISTERED),
    /Attached Energy must appear/);
  owner.active.cards.push(energy);
  owner.active.energies.cards=[];
  owner.active.tools=[card('Psychic Energy SET')];
  assert.throws(()=>captureOwnerK1(state,1,REGISTERED),
    /Attached Tools must not overlap/);
});
