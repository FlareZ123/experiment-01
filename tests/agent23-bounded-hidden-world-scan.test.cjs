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

const dependencies={
  fingerprint:state=>structuredClone(state),
  actorView:(state,seat)=>({
    turn:state.turn,activePlayer:state.activePlayer,
    hand:state.players[seat].hand.cards.map(x=>x.fullName),
    ownDeckCount:state.players[seat].deck.cards.length,
    opponentHandCount:state.players[1-seat].hand.cards.length,
    opponentDeckCount:state.players[1-seat].deck.cards.length
  })
};

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

test('owner-only decision negative control survives every one-swap world',()=>{
  const game=state(),before=structuredClone(game);
  const actorSafeBot=()=>({tactics:[],decodeNextAction:s=>{
    const own=s.players[0];
    return own.hand.cards.length===1?
      {type:'PASS_TURN'}:{type:'USE_ABILITY_ACTION',name:'Perfection'};
  }});
  const out=scanBoundedOpponentHiddenWorlds(game,101,actorSafeBot,
    structuredClone,()=>()=>0.5,{...dependencies,limit:16});
  assert.equal(out.testedSingleExchanges,2);
  assert.equal(out.exhaustiveSingleExchangeCoverage,true);
  assert.equal(out.actionReversals,0);
  assert.equal(out.scoreOnlyChanges,0);
  assert.equal(out.currentOwnerObservationEquivalent,true);
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

test('native optional policy callback is installed before each fresh bot',()=>{
  const game=state();
  let installations=0,active=false,constructions=0;
  const withPolicy=work=>{
    assert.equal(active,false,'Nested alternate-world policy state');
    installations++;
    active=true;
    try{return work();}
    finally{active=false;}
  };
  const newBot=()=>{
    assert.equal(active,true,'Bot was constructed outside its policy hooks');
    constructions++;
    return sensitiveBot();
  };
  const out=scanBoundedOpponentHiddenWorlds(game,101,newBot,
    structuredClone,()=>()=>0.5,withPolicy);
  assert.equal(out.perWorldPolicyIsolation,true);
  assert.equal(out.actionReversals,1);
  assert.equal(out.testedSingleExchanges,2);
  assert.equal(installations,4);
  assert.equal(constructions,4);
});

test('small budget covers distinct hidden-hand printing compositions first',()=>{
  const hand=[energy(1,'Repeated Energy'),energy(2,'Repeated Energy')];
  const deck=[trainer(3,'Repeated Trainer'),trainer(4,'Repeated Trainer'),
    trainer(5,'Different Trainer')];
  const out=selectBoundedHiddenExchanges(hand,deck,2);
  assert.equal(out.available,6);
  assert.equal(out.eligibleDistinctHandCompositions,2);
  assert.equal(out.testedDistinctHandCompositions,2);
  assert.equal(out.exchanges.length,2);
  const incoming=new Set(out.exchanges.map(x=>deck[x.deckIndex].fullName));
  assert.deepEqual(incoming,new Set(['Repeated Trainer','Different Trainer']));
  assert.equal(out.exhaustive,false);
  const larger=selectBoundedHiddenExchanges(hand,deck,6);
  assert.equal(larger.exchanges.length,6);
  assert.equal(larger.testedDistinctHandCompositions,2);
  assert.equal(larger.exhaustive,true);
});

test('bounded scan spreads exposure across owner-unseen physical hand indices',()=>{
  const hand=Array.from({length:4},(_,i)=>energy(10+i,'Hand Energy '+i));
  const deck=Array.from({length:9},(_,i)=>trainer(30+i,'Deck Trainer '+i));
  const selected=selectBoundedHiddenExchanges(hand,deck,4);
  assert.equal(selected.available,36);
  assert.equal(selected.exchanges.length,4);
  assert.equal(new Set(selected.exchanges.map(x=>x.handIndex)).size,4);
  assert.equal(new Set(selected.exchanges.map(x=>x.deckIndex)).size,4);
  assert.equal(selected.exhaustive,false);
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

test('counterfactual is rejected if actor-observable public count differs',()=>{
  const source=state();
  const newView=(s,seat)=>({
    ...dependencies.actorView(s,seat),
    opponentHiddenIdentity:s.players[1-seat].hand.cards[0]?.fullName
  });
  assert.throws(()=>scanBoundedOpponentHiddenWorlds(
    source,101,sensitiveBot,structuredClone,()=>()=>0.5,
    {...dependencies,actorView:newView,limit:1}),
  /Concealed swap changed the owner-visible observation/);
});

test('reject shallow live aliases before exchanging physical hidden cards',()=>{
  const game=state(),before=structuredClone(game);
  assert.throws(()=>scanBoundedOpponentHiddenWorlds(game,101,
    sensitiveBot,()=>game,()=>()=>0.5,dependencies),
  /Clone returned the live Store object/);
  assert.deepEqual(game,before);
  assert.throws(()=>scanBoundedOpponentHiddenWorlds(game,101,
    sensitiveBot,source=>({
      ...source,players:source.players.map(p=>({...p}))
    }),()=>()=>0.5,dependencies),
  /Clone reused a live concealed-zone object/);
  assert.deepEqual(game,before);
});

test('invalid or excessive counterfactual budgets fail fast',()=>{
  assert.throws(()=>selectBoundedHiddenExchanges([],[],0));
  assert.throws(()=>selectBoundedHiddenExchanges([],[],65));
  assert.throws(()=>selectBoundedHiddenExchanges([],[],1.5));
});
