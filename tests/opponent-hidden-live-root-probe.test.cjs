'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compareOpponentHiddenSwap,chooseHiddenHandDeckSwap}=
  require('../simulation/twinleaf/opponent-hidden-live-root-probe.cjs');

const E=(id,name)=>({id,fullName:name,energyType:1});
const T=(id,name)=>({id,fullName:name,trainerType:2});

/** Pure mock of an owner-observation-equivalent live root. */
function state(){
  return {turn:3,activePlayer:0,prompts:[],players:[
    {id:101,hand:{cards:[T(1,'Owner Supporter')]},
      deck:{cards:[E(2,'Owner Psychic')]},active:{cards:[]}},
    {id:202,hand:{cards:[E(3,'Opponent Darkness')]},
      deck:{cards:[T(4,'Opponent Trainer'),E(5,'Opponent Lightning')]}}
  ]};
}

function bot(){
  return {tactics:[],decodeNextAction:world=>{
    const hidden=world.players[1].hand.cards;
    return hidden.some(card=>card.trainerType!==undefined)?
      {type:'USE_ABILITY_ACTION',name:'Perfection'}:
      {type:'PASS_TURN'};
  }};
}

test('postgame hidden swap changes a complete decision and conserves live state',()=>{
  const source=state();
  const before=structuredClone(source);
  let calls=0;
  const result=compareOpponentHiddenSwap(source,101,()=>{
    calls++;return bot();
  },structuredClone,()=>()=>0.5,
  {fingerprint:s=>structuredClone(s)});
  assert.equal(calls,2);
  assert.equal(result.opportunity,true);
  assert.equal(result.chosenExchangeKinds,'energy-vs-trainer');
  assert.equal(result.actionSensitiveToOpponentHiddenHand,true);
  assert.equal(result.actionSensitiveToHiddenDeckOrder,false);
  assert.equal(result.physicalOrder.type,'Object');
  assert.notDeepEqual(result.physicalOrder,result.counterfactualOrder);
  assert.equal(result.opponentHandIdentityUnobservedVerified,false);
  assert.equal(result.liveStatePreserved,true);
  assert.deepEqual(source,before);
});

test('absent or identical hidden swap abstains without fake action contrast',()=>{
  const source=state();
  source.players[1].hand.cards=[E(3,'Same')];
  source.players[1].deck.cards=[E(4,'Same')];
  const result=compareOpponentHiddenSwap(source,101,bot,
    structuredClone,()=>()=>0.25,{fingerprint:s=>structuredClone(s)});
  assert.equal(result.opportunity,false);
  assert.equal(result.counterfactualOrder,null);
  assert.equal(result.actionSensitiveToOpponentHiddenHand,false);
  assert.equal(result.classification,'no-distinct-opponent-hand-deck-swap');
  assert.equal(result.tacticScoreComparison,null);
});

test('prefer cross-type hand/deck swap over same-type print differences',()=>{
  const selection=chooseHiddenHandDeckSwap(
    [E(1,'Lightning Energy')],[E(2,'Darkness Energy'),T(3,'Battle VIP Pass')]);
  assert.deepEqual(selection,{
    handIndex:0,deckIndex:1,kindPair:'energy-vs-trainer'
  });
});

test('detached bot decision remains unaffected by previous policy RNG draws',()=>{
  const source=state();
  let seedFactoryCalls=0;
  const rand=()=>{seedFactoryCalls++;return ()=>0.125;};
  const first=compareOpponentHiddenSwap(source,101,bot,
    structuredClone,rand,{fingerprint:s=>structuredClone(s)});
  const second=compareOpponentHiddenSwap(source,101,bot,
    structuredClone,rand,{fingerprint:s=>structuredClone(s)});
  assert.deepEqual(first.physicalOrder,second.physicalOrder);
  assert.deepEqual(first.counterfactualOrder,second.counterfactualOrder);
  assert.equal(seedFactoryCalls,4);
});
