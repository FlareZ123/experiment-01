'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {cloneBotOptions,withPostgameRootOrderProbe,
  probeFreshPlayCardInClonedStore}=
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
  cloned=structuredClone,compare=null,replayPolicy=null,
  replayCommonPolicy=false,isolateReplayPolicyPerWorld=false}={}) {
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
    {turn:3,seat:0,makeRandom:()=>()=>0.1,
      replayCommonPolicy,isolateReplayPolicyPerWorld},
    {headless,compare:checkedCompare,
      ...(replayPolicy?{replayPolicy}:{})}
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

test('distinct live tactic configurations fail closed instead of faking a bot',()=>{
  class MixedOptionsBot extends SyntheticBot {
    constructor(client,options) {
      super(client,options);
      this.tactics.push({options:structuredClone(options)});
    }
    decodeNextAction(state) {
      return super.decodeNextAction(state);
    }
  }
  const baseline=MixedOptionsBot.prototype.decodeNextAction;
  const headless={
    runMatch(s){
      const bot=new MixedOptionsBot({id:101},{
        tactics:[],promptResolvers:[],scores:{hand:{hasEnergy:7}},
        arbiter:{flipMode:0}
      });
      return {realAction:bot.decodeNextAction(s)};
    }
  };
  const original=headless.runMatch;
  const result=withPostgameRootOrderProbe(
    MixedOptionsBot,()=>headless.runMatch(state()),structuredClone,
    {turn:3,seat:0,makeRandom:()=>()=>0.2},{headless}
  );
  assert.equal(result.events.length,1);
  assert.equal(result.events[0].baselineActionMatchedActual,false);
  assert.match(result.events[0].auditError,/Live tactic options differ/);
  assert.equal(result.result.realAction.play,'generic');
  assert.strictEqual(headless.runMatch,original);
  assert.strictEqual(MixedOptionsBot.prototype.decodeNextAction,baseline);
});

test('snapshot mutation triggers a fail-closed owner-visible root warning',()=>{
  const source=state();
  const {observed,actualCalls}=scenario({
    root:source,cloned:real=>{
      real.players[0].deck.cards[0]='mutated-by-clone';
      return structuredClone(real);
    }
  });
  assert.equal(actualCalls,1);
  assert.equal(source.players[0].deck.cards[0],'mutated-by-clone');
  assert.equal(observed.events.length,1);
  assert.equal(observed.events[0].baselineActionMatchedActual,false);
  assert.equal(observed.events[0].liveStatePreserved,false);
  assert.match(observed.events[0].auditError,
    /capture mutated the actual Store State graph/);
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

test('complete audit accepts one identical game replay and records a postgame decision flip',()=>{
  const {auditDevelopmentArm}=
    require('../simulation/evaluation/agent50-bilateral-hidden-order-audit.cjs');
  const trial={id:'6:0:A:champion-reference',rank:6,candidateSlot:'A',
    candidateId:'champion-reference',seed:407516727};
  const headless={
    runMatch(s) {
      const bot=new SyntheticBot({id:101},{tactics:[],promptResolvers:[]});
      return bot.decodeNextAction(s);
    }
  };
  const execute=()=>{
    const selected=headless.runMatch(state());
    assert.deepEqual(selected,{player:101,play:'generic'});
    return {
      trial,rootActionLedgerSha256:'a'.repeat(64),
      sourceDealFingerprint:'b'.repeat(64),
      verifiedFirstTurn:true,sourceActuallyFirst:false,
      actualStarterSeat:0,actionCount:2,turns:3,
      finished:false,winner:null,endReason:'bounded',
      finalPrizes:[6,6]
    };
  };
  const wrapper=(Bot,work,clone,target)=>withPostgameRootOrderProbe(
    Bot,work,clone,target,{
      headless,
      compare:(source,actorId,newBot)=>{
        assert.equal(actorId,101);
        return {
          physicalOrder:actionSignature(newBot().decodeNextAction(source)),
          reversedOrder:actionSignature({player:101,play:'different'}),
          liveStatePreserved:true,actionSensitiveToHiddenDeckOrder:true,
          tacticScoreComparison:{equalScoreTraces:false}
        };
      }
    }
  );
  const row=auditDevelopmentArm(trial,execute,wrapper,SyntheticBot,
    structuredClone,()=>()=>0.25);
  assert.equal(row.classification,'hidden-order-action-sensitivity-observed');
  assert.equal(row.noninterferenceVerified,true);
  assert.equal(row.comparisonQualified,true);
  assert.equal(row.competitiveGameQualified,false);
});


test('captured mutable scores and arbiter data are isolated in every world',()=>{
  const Tactic=class Tactic{};
  const Resolver=class Resolver{};
  const original={
    tactics:[Tactic],promptResolvers:[Resolver],
    scores:{hand:{hasSupporter:7},opponent:{hand:11}},
    arbiter:{flipMode:0,shuffleMode:2}
  };
  const boundary=cloneBotOptions(original);
  assert.notStrictEqual(boundary.scores,original.scores);
  assert.notStrictEqual(boundary.arbiter,original.arbiter);
  assert.strictEqual(boundary.tactics[0],Tactic);
  assert.strictEqual(boundary.promptResolvers[0],Resolver);
  original.scores.hand.hasSupporter=900;
  original.arbiter.shuffleMode=900;
  assert.equal(boundary.scores.hand.hasSupporter,7);
  assert.equal(boundary.arbiter.shuffleMode,2);
  const physical=cloneBotOptions(boundary);
  const reversed=cloneBotOptions(boundary);
  physical.scores.opponent.hand=999;
  physical.arbiter.flipMode=999;
  physical.tactics.push(class Other{});
  assert.equal(reversed.scores.opponent.hand,11);
  assert.equal(reversed.arbiter.flipMode,0);
  assert.deepEqual(reversed.tactics,[Tactic]);
});

test('first finite-score root skips unscored turn and preserves both native actions',()=>{
  class ScoredBot extends SyntheticBot {
    constructor(client,options){
      super(client,options);
      this.tactics[0].evaluateAction=()=>1.25;
    }
    decodeNextAction(s){
      if(s.turn<4)return {player:this.client.id,play:'unscored'};
      const score=this.tactics[0].evaluateAction();
      return {player:this.client.id,play:score===1.25?'scored':'bad'};
    }
  }
  const originalDecode=ScoredBot.prototype.decodeNextAction;
  const originalTactic=new ScoredBot({id:101},
    {tactics:[],promptResolvers:[]}).tactics[0].evaluateAction;
  const headless={runMatch(){
    const bot=new ScoredBot({id:101},
      {tactics:[],promptResolvers:[]});
    const early=bot.decodeNextAction(state({turn:3}));
    const late=bot.decodeNextAction(state({turn:4}));
    assert.equal(bot.tactics[0].evaluateAction(),1.25);
    return {early,late};
  }};
  const originalRun=headless.runMatch;
  let postgameCompare=0;
  const output=withPostgameRootOrderProbe(
    ScoredBot,()=>headless.runMatch(),structuredClone,{
      turn:3,seat:0,firstFiniteScoredRoot:true,makeRandom:()=>()=>0.2
    },{headless,compare:(snapshot,actor,newBot)=>{
      postgameCompare++;
      assert.equal(snapshot.turn,4);
      assert.equal(actor,101);
      const physical=actionSignature(newBot().decodeNextAction(snapshot));
      return {
        physicalOrder:physical,reversedOrder:physical,
        liveStatePreserved:true,actionSensitiveToHiddenDeckOrder:false,
        tacticScoreComparison:{equalScoreTraces:true}
      };
    }}
  );
  assert.deepEqual(output.result,{
    early:{player:101,play:'unscored'},
    late:{player:101,play:'scored'}
  });
  assert.equal(output.events.length,1);
  assert.equal(output.events[0].chosenRootTurn,4);
  assert.equal(output.events[0].actualScorerAttempts,1);
  assert.equal(output.events[0].actualFiniteScores,1);
  assert.equal(output.events[0].baselineActionMatchedActual,true);
  assert.equal(postgameCompare,1);
  assert.strictEqual(ScoredBot.prototype.decodeNextAction,originalDecode);
  assert.strictEqual(headless.runMatch,originalRun);
  assert.equal(originalTactic(),1.25);
});

test('first finite-score root keeps every undefined-scored owner action',()=>{
  class UnscoredBot extends SyntheticBot {
    constructor(client,options){
      super(client,options);
      this.tactics[0].evaluateAction=()=>undefined;
    }
    decodeNextAction(){
      this.tactics[0].evaluateAction();
      return {player:this.client.id,play:'unscored'};
    }
  }
  const headless={runMatch(){
    const bot=new UnscoredBot({id:101},
      {tactics:[],promptResolvers:[]});
    return {turn3:bot.decodeNextAction(state({turn:3})),
      turn4:bot.decodeNextAction(state({turn:4}))};
  }};
  const output=withPostgameRootOrderProbe(UnscoredBot,
    ()=>headless.runMatch(),structuredClone,
    {turn:3,seat:0,firstFiniteScoredRoot:true,makeRandom:()=>()=>0.2},
    {headless,compare:()=>{throw Error('No scored root must skip compare');}}
  );
  assert.equal(output.events.length,0);
  assert.equal(output.result.turn3.play,'unscored');
  assert.equal(output.result.turn4.play,'unscored');
});

test('fresh bot PlayCard is dispatched on clone only with exact raw owner card',()=>{
  const root=state({players:[{
    id:101,deck:{cards:['a','b']},
    hand:{cards:[{fullName:'Basic Psychic Energy'},{fullName:'Fog Crystal'}]},
    energyPlayedTurn:3,supporterTurn:0
  }]});
  class MockAction {
    constructor(id,handIndex,target){
      this.id=id;
      this.handIndex=handIndex;
      this.target=target;
    }
  }
  class MockStore {
    constructor(){this.state=null;}
    dispatch(action){
      assert.equal(action.target.player,2);
      this.state.players[0].hand.cards.splice(action.handIndex,1);
    }
  }
  const sig={type:'PlayCardAction',data:JSON.stringify({
    id:101,handIndex:0,target:{player:2,slot:1,index:0}
  })};
  const result=probeFreshPlayCardInClonedStore(root,sig,
    structuredClone,{Store:MockStore,PlayCardAction:MockAction,
      makeRandom:()=>()=>0.4});
  assert.equal(result.proposedCardPrinting,'Basic Psychic Energy');
  assert.equal(result.dispatchReturnedWithoutThrow,true);
  assert.equal(result.handSizeBefore,2);
  assert.equal(result.handSizeAfter,1);
  assert.equal(result.energyPlayedTurn,3);
  assert.equal(result.originalStoreUnchanged,true);
  assert.equal(root.players[0].hand.cards.length,2);
  assert.deepEqual(result.proposedTarget,{player:2,slot:1,index:0});
});

test('fresh cloned Store rejection preserves original root and captures failure',()=>{
  const root=state({players:[{
    id:101,deck:{cards:['a','b']},
    hand:{cards:[{fullName:'Psychic Energy'}]},
    energyPlayedTurn:3,supporterTurn:3
  }]});
  const before=structuredClone(root);
  class MockAction {
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class MockStore {
    constructor(){this.state=null;}
    dispatch(){throw new Error('second manual Energy attachment denied');}
  }
  const previous=Math.random;
  const result=probeFreshPlayCardInClonedStore(root,{
    type:'PlayCardAction',
    data:JSON.stringify({id:101,handIndex:0,
      target:{player:2,slot:1,index:0}})
  },structuredClone,{Store:MockStore,PlayCardAction:MockAction,
    makeRandom:()=>()=>0.8});
  assert.equal(result.dispatchReturnedWithoutThrow,false);
  assert.match(result.dispatchRejection,/second manual Energy attachment denied/);
  assert.equal(result.handSizeAfter,1);
  assert.deepEqual(root,before);
  assert.strictEqual(Math.random,previous);
});

test('postgame comparison cannot inherit future live or prior-world score mutations',()=>{
  const baseline=SyntheticBot.prototype.decodeNextAction;
  const options={
    tactics:[],promptResolvers:[],
    scores:{hand:{hasSupporter:7}},
    arbiter:{shuffleMode:2}
  };
  const headless={runMatch(s){
    const bot=new SyntheticBot({id:101},options);
    const action=bot.decodeNextAction(s);
    // This is a synthetic future action after the observed owner decision.
    options.scores.hand.hasSupporter=37;
    options.arbiter.shuffleMode=9;
    return {action,finished:true};
  }};
  const original=headless.runMatch;
  let comparableWorlds=0;
  const audited=withPostgameRootOrderProbe(
    SyntheticBot,()=>headless.runMatch(state()),structuredClone,
    {turn:3,seat:0,makeRandom:()=>()=>0.3},
    {headless,compare:(_snapshot,actor,newBot)=>{
      assert.equal(actor,101);
      const physical=newBot().tactics[0].options;
      assert.equal(physical.scores.hand.hasSupporter,7);
      assert.equal(physical.arbiter.shuffleMode,2);
      physical.scores.hand.hasSupporter=-1;
      physical.arbiter.shuffleMode=-1;
      const reversed=newBot().tactics[0].options;
      assert.equal(reversed.scores.hand.hasSupporter,7);
      assert.equal(reversed.arbiter.shuffleMode,2);
      comparableWorlds=2;
      return {
        physicalOrder:actionSignature({player:101,play:'generic'}),
        reversedOrder:actionSignature({player:101,play:'generic'}),
        liveStatePreserved:true,actionSensitiveToHiddenDeckOrder:false,
        tacticScoreComparison:{equalScoreTraces:true}
      };
    }}
  );
  assert.equal(comparableWorlds,2);
  assert.equal(audited.events[0].baselineActionMatchedActual,true);
  assert.equal(audited.result.action.play,'generic');
  assert.strictEqual(headless.runMatch,original);
  assert.strictEqual(SyntheticBot.prototype.decodeNextAction,baseline);
});


test('postgame policy replay reconstructs live action without touching authentic Store',()=>{
  const baseline=SyntheticBot.prototype.decodeNextAction;
  const root=state();
  let finished=false,policyReplays=0;
  const headless={runMatch(s){
    const bot=new SyntheticBot({id:101},{tactics:[],promptResolvers:[]});
    return {source:'real-game',action:bot.decodeNextAction(s)};
  }};
  const execute=()=>{
    const original=SyntheticBot.prototype.decodeNextAction;
    SyntheticBot.prototype.decodeNextAction=function actualCommonPolicy(s){
      return {...original.call(this,s),play:'stone-protected'};
    };
    try{return headless.runMatch(root);}
    finally{
      SyntheticBot.prototype.decodeNextAction=original;
      finished=true;
    }
  };
  const replayPolicy=(seat,work)=>{
    assert.equal(finished,true,'Policy replay must be postgame only');
    assert.equal(seat,0);
    policyReplays++;
    const original=SyntheticBot.prototype.decodeNextAction;
    SyntheticBot.prototype.decodeNextAction=function detachedCommonPolicy(s){
      return {...original.call(this,s),play:'stone-protected'};
    };
    try{return {result:work()};}
    finally{SyntheticBot.prototype.decodeNextAction=original;}
  };
  const compare=(_source,actor,newBot)=>{
    assert.equal(actor,101);
    const physical=actionSignature(newBot().decodeNextAction(root));
    const reversed=actionSignature(newBot().decodeNextAction(root));
    return {
      physicalOrder:physical,reversedOrder:reversed,
      liveStatePreserved:true,actionSensitiveToHiddenDeckOrder:false,
      tacticScoreComparison:{equalScoreTraces:true}
    };
  };
  const observed=withPostgameRootOrderProbe(
    SyntheticBot,execute,structuredClone,
    {turn:3,seat:0,makeRandom:()=>()=>0.1,replayCommonPolicy:true},
    {headless,compare,replayPolicy}
  );
  assert.equal(policyReplays,1);
  assert.equal(observed.result.action.play,'stone-protected');
  assert.equal(observed.events[0].replayCommonPolicy,true);
  assert.equal(observed.events[0].baselineActionMatchedActual,true);
  assert.strictEqual(SyntheticBot.prototype.decodeNextAction,baseline);
});

test('independent detached worlds each start with a fresh common policy closure',()=>{
  const original=SyntheticBot.prototype.decodeNextAction;
  let createdContexts=0;
  const replayPolicy=(seat,work)=>{
    assert.equal(seat,0);
    createdContexts++;
    let decisionsInThisContext=0;
    const before=SyntheticBot.prototype.decodeNextAction;
    SyntheticBot.prototype.decodeNextAction=function (source){
      decisionsInThisContext++;
      assert.equal(decisionsInThisContext,1,
        'Only one hypothetical decision may use a policy closure');
      return {...before.call(this,source),play:'special'};
    };
    try {return {result:work()};}
    finally{SyntheticBot.prototype.decodeNextAction=before;}
  };
  const compare=(source,actor,newBot,_clone,_random,worldScope)=>{
    assert.equal(actor,101);
    assert.equal(typeof worldScope,'function');
    const physical=worldScope(()=>
      actionSignature(newBot().decodeNextAction(source)));
    const reversed=worldScope(()=>
      actionSignature(newBot().decodeNextAction(source)));
    return {physicalOrder:physical,reversedOrder:reversed,
      liveStatePreserved:true,actionSensitiveToHiddenDeckOrder:false,
      tacticScoreComparison:{equalScoreTraces:true}};
  };
  const {observed}=scenario({
    candidateOverrides:true,replayCommonPolicy:true,
    isolateReplayPolicyPerWorld:true,replayPolicy,compare
  });
  assert.equal(createdContexts,2);
  assert.equal(observed.events[0].baselineActionMatchedActual,true);
  assert.equal(observed.events[0].isolatedReplayPolicyPerWorld,true);
  assert.strictEqual(SyntheticBot.prototype.decodeNextAction,original);
});
