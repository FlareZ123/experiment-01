'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compareOpponentHiddenSwap}=
  require('../simulation/twinleaf/opponent-hidden-live-root-probe.cjs');
const {selectBoundedHiddenExchanges,scanBoundedOpponentHiddenWorlds}=
  require('../simulation/twinleaf/agent23-bounded-hidden-world-scan.cjs');

const energy=(id,name)=>({id,fullName:name,energyType:1});
const trainer=(id,name)=>({id,fullName:name,trainerType:2});

/** A genuine-root-shaped pure fixture; all hidden card instances are unique. */
function state(){
  return {turn:3,activePlayer:0,prompts:[],players:[
    {id:101,hand:{cards:[trainer(1,'Owner Supporter')]},
      deck:{cards:[energy(2,'Owner Psychic')]}},
    {id:202,hand:{cards:[energy(3,'Opponent Darkness')]},
      deck:{cards:[trainer(4,'Inert Trainer'),
        trainer(5,'Critical Trainer')]}}
  ]};
}

function sensitiveBot(){
  return {tactics:[],decodeNextAction:world=>
    world.players[1].hand.cards.some(c=>c.fullName==='Critical Trainer')?
      {type:'USE_ABILITY_ACTION',name:'Perfection'}:{type:'PASS_TURN'}};
}

const dependencies={fingerprint:state=>structuredClone(state)};

test('bounded cross-kind enumeration covers an invisible second decisive exchange',()=>{
  const game=state(),before=structuredClone(game);
  const old=compareOpponentHiddenSwap(game,101,sensitiveBot,
    structuredClone,()=>()=>0.5,dependencies);
  assert.equal(old.actionSensitiveToOpponentHiddenHand,false);
  assert.equal(old.opportunity,true);

  let botCount=0,randomCount=0;
  const result=scanBoundedOpponentHiddenWorlds(game,101,()=>{
    botCount++;return sensitiveBot();
  },structuredClone,()=>{
    randomCount++;return()=>0.5;
  },{...dependencies,limit:2});
  assert.equal(result.totalEligibleSingleExchanges,2);
  assert.equal(result.testedSingleExchanges,2);
  assert.equal(result.exhaustiveSingleExchangeCoverage,true);
  assert.equal(result.actionReversals,1);
  assert.equal(result.actionSensitiveToOpponentHiddenHand,true);
  assert.equal(result.firstActionReversal.exchangeKind,'energy-vs-trainer');
  assert.equal(result.liveStatePreserved,true);
  assert.equal(result.baselineReplayStable,true);
  assert.equal(result.completeOwnerObservationHistoryCertified,false);
  assert.equal(result.qualification.competitiveGameQualified,false);
  assert.equal(botCount,4); // Baseline, two worlds, bracketed baseline.
  assert.equal(randomCount,4);
  assert.deepEqual(game,before);
});

test('bounded census visibly censors unexamined hidden single exchanges',()=>{
  const result=scanBoundedOpponentHiddenWorlds(state(),101,
    sensitiveBot,structuredClone,()=>()=>0.5,
    {...dependencies,limit:1});
  assert.equal(result.testedSingleExchanges,1);
  assert.equal(result.totalEligibleSingleExchanges,2);
  assert.equal(result.exhaustiveSingleExchangeCoverage,false);
  assert.equal(result.actionSensitiveToOpponentHiddenHand,false);
  assert.equal(result.completeOwnerObservationHistoryCertified,false);
});

test('same printing yields no eligible physical-identity-only exchange',()=>{
  const game=state();
  game.players[1].deck.cards=[energy(4,'Opponent Darkness')];
  const selected=selectBoundedHiddenExchanges(
    game.players[1].hand.cards,game.players[1].deck.cards);
  assert.equal(selected.available,0);
  assert.equal(selected.exhaustive,true);
  const result=scanBoundedOpponentHiddenWorlds(game,101,
    sensitiveBot,structuredClone,()=>()=>0.25,dependencies);
  assert.equal(result.opportunity,false);
  assert.equal(result.testedSingleExchanges,0);
  assert.equal(result.actionReversals,0);
  assert.equal(result.baselineReplayStable,true);
});

test('bracketed original world fails closed on drifting shared bot state',()=>{
  const game=state(),before=structuredClone(game);
  let calls=0;
  const driftingBot=()=>({tactics:[],decodeNextAction:()=>{
    calls++;return calls===1?{type:'PASS_TURN'}:
      {type:'USE_ABILITY_ACTION',name:'Perfection'};
  }});
  assert.throws(()=>scanBoundedOpponentHiddenWorlds(game,101,
    driftingBot,structuredClone,()=>()=>0.5,
    {...dependencies,limit:1}),/Repeated original hidden world/);
  assert.deepEqual(game,before);
});

test('invalid or excessive counterfactual budgets fail fast',()=>{
  assert.throws(()=>selectBoundedHiddenExchanges([],[],0));
  assert.throws(()=>selectBoundedHiddenExchanges([],[],65));
  assert.throws(()=>selectBoundedHiddenExchanges([],[],1.5));
});
