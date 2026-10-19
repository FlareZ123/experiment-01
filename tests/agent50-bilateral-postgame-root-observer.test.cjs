'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withPostgameRootOrderProbe}=
  require('../simulation/evaluation/agent50-bilateral-postgame-root-observer.cjs');
const {actionSignature}=
  require('../simulation/twinleaf/rank10-hidden-order-live-probe.cjs');

class SyntheticBot {
  constructor(client,options) {
    this.client=client;
    this.tactics=[{options}];
    this.resolvers=[];
  }
  decodeNextAction() {
    return {player:this.client.id,play:'generic'};
  }
}

function state(overrides={}) {
  return {
    turn:3,activePlayer:0,prompts:[],
    players:[{id:101,deck:{cards:['a','b']}}],
    ...overrides
  };
}

function scenario({candidateOverrides=false,root=state(),
  cloned=structuredClone,compare=null}={}) {
  const normal=SyntheticBot.prototype.decodeNextAction;
  let gameFinished=false,actualCalls=0;
  const headless={
    runMatch(request) {
      const bot=new SyntheticBot({id:101},{tactics:[],promptResolvers:[]});
      const originalAction=bot.decodeNextAction(request);
      return {winner:null,action:originalAction,source:'authentic-store'};
    }
  };
  const untouched=headless.runMatch;
  const execute=()=>{
    const prior=SyntheticBot.prototype.decodeNextAction;
    SyntheticBot.prototype.decodeNextAction=function outerCandidatePolicy(s) {
      actualCalls++;
      const chosen=prior.call(this,s);
      return candidateOverrides?{...chosen,play:'special'}:chosen;
    };
    try {
      const result=headless.runMatch(root);
      gameFinished=true;
      return result;
    } finally {
      SyntheticBot.prototype.decodeNextAction=prior;
    }
  };
  const checkedCompare=compare??((rootState,actorId,newBot)=>{
    assert.equal(gameFinished,true,
      'No hypothetical decision may run inside the active Store game');
    assert.equal(actorId,101);
    return {
      physicalOrder:actionSignature(newBot().decodeNextAction(rootState)),
      reversedOrder:actionSignature(newBot().decodeNextAction(rootState)),
      liveStatePreserved:true,
      actionSensitiveToHiddenDeckOrder:false,
      tacticScoreComparison:{equalScoreTraces:true}
    };
  });
  const observed=withPostgameRootOrderProbe(
    SyntheticBot,execute,cloned,
    {turn:3,seat:0,makeRandom:()=>()=>0.1},
    {headless,compare:checkedCompare}
  );
  assert.strictEqual(SyntheticBot.prototype.decodeNextAction,normal);
  assert.strictEqual(headless.runMatch,untouched);
  return {observed,actualCalls,gameFinished};
}

test('snapshot is captured after candidate wrapper install and evaluated only after game',()=>{
  const {observed,actualCalls,gameFinished}=scenario();
  assert.equal(actualCalls,1);
  assert.equal(gameFinished,true);
  assert.deepEqual(observed.result,
    {winner:null,action:{player:101,play:'generic'},source:'authentic-store'});
  assert.equal(observed.events.length,1);
  assert.equal(observed.events[0].baselineActionMatchedActual,true);
  assert.equal(observed.events[0].comparedAfterRealGameFinished,true);
  assert.equal(observed.events[0].sourceMatchExecutions,1);
});

test('a candidate-only special tactic creates a visible baseline mismatch',()=>{
  const {observed,actualCalls}=scenario({candidateOverrides:true});
  assert.equal(actualCalls,1);
  assert.equal(observed.result.action.play,'special');
  assert.equal(observed.events[0].baselineActionMatchedActual,false);
  assert.equal(observed.events[0].originalSourceAction.data,
    JSON.stringify({player:101,play:'special'}));
});

test('wrong seat or wrong turn retains game and reports zero opportunities',()=>{
  const {observed,actualCalls}=scenario({
    root:state({activePlayer:1})
  });
  assert.equal(actualCalls,1);
  assert.equal(observed.events.length,0);
  assert.equal(observed.result.action.play,'generic');
});

test('failed source clone does not intercept or replace the real action',()=>{
  const {observed}=scenario({
    cloned:()=>{throw new Error('synthetic clone cannot preserve prototype')}
  });
  assert.equal(observed.result.action.play,'generic');
  assert.equal(observed.events.length,1);
  assert.equal(observed.events[0].baselineActionMatchedActual,false);
  assert.match(observed.events[0].auditError,/cannot preserve prototype/);
});

test('counterfactual evaluator failure is strictly postgame and never loses result',()=>{
  const {observed}=scenario({
    compare:()=>{
      throw new Error('unavailable historical tactic');
    }
  });
  assert.equal(observed.result.action.play,'generic');
  assert.equal(observed.events.length,1);
  assert.match(observed.events[0].auditError,/unavailable historical tactic/);
});

test('postgame counterfactual cannot modify preserved real game evidence',()=>{
  const {observed}=scenario({
    compare:(snapshot,_actor,newBot)=>{
      snapshot.players[0].deck.cards.push('new');
      newBot().decodeNextAction(snapshot);
      return {
        physicalOrder:actionSignature({player:101,play:'generic'}),
        reversedOrder:actionSignature({player:101,play:'alternate'}),
        actionSensitiveToHiddenDeckOrder:true,
        liveStatePreserved:true,
        tacticScoreComparison:{equalScoreTraces:false}
      };
    }
  });
  assert.equal(observed.events[0].baselineActionMatchedActual,true);
  assert.equal(observed.events[0].actionSensitiveToHiddenDeckOrder,true);
  assert.equal(observed.result.action.play,'generic');
  assert.equal(observed.result.source,'authentic-store');
});
