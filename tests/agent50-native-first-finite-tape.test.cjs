'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withPostgameRootOrderProbe}=
  require('../simulation/evaluation/agent50-bilateral-postgame-root-observer.cjs');

class NativeScoredBot {
  constructor(client,options) {
    this.client=client;
    this.tactics=[{options,evaluateAction:()=>17}];
    this.resolvers=[];
  }
  decodeNextAction(state) {
    if(state.turn===3)return {kind:'earlier-unscored'};
    // Deliberately mutate the *physical* State before the first generic score.
    // Capturing only at evaluateAction would reconstruct the wrong entry root.
    state.beforeScoreMutation=1;
    const score=this.tactics[0].evaluateAction(state);
    return {kind:'scored',score,draw:Math.random()};
  }
}

function runFixture({replayPolicy=(_seat,work)=>({result:work()}),
  entryOnly=false,fairReplayHooks=false,installFairBotHooks=()=>()=>{},
  supporterReplayHook=false,installSupporterDecisionHook=()=>()=>{}}={}) {
  const source={
    turn:3,activePlayer:0,prompts:[],beforeScoreMutation:0,
    players:[{id:101,hand:{cards:[]},deck:{cards:['hidden-A','hidden-B']}}]
  };
  let authenticCalls=0,complete=false,clones=0;
  const countClones=state=>{clones++;return structuredClone(state);};
  const options={tactics:[],promptResolvers:[],scores:{},arbiter:{}};
  const headless={runMatch() {
    const bot=new NativeScoredBot({id:101},options);
    const early=bot.decodeNextAction(source);
    source.turn=4;
    const later=bot.decodeNextAction(source);
    authenticCalls++;
    return {early,later};
  }};
  const base=headless.runMatch;
  const native=NativeScoredBot.prototype.decodeNextAction;
  const execute=()=>{
    const result=headless.runMatch();
    complete=true;
    return result;
  };
  const result=withPostgameRootOrderProbe(
    NativeScoredBot,execute,countClones,
    {turn:3,seat:0,firstFiniteScoredRoot:true,
      nativeTapeSameWorld:true,nativeTapeFirstFiniteScore:true,
      nativeTapeEntryOnly:entryOnly,
      nativeTapeFairReplayHooks:fairReplayHooks,
      nativeTapeSupporterReplayHook:supporterReplayHook,
      makeRandom:()=>()=>0.5},
    {headless,replayPolicy,installFairBotHooks,
      installSupporterDecisionHook,
      compare:()=>{throw Error('No hidden contrast');}}
  );
  assert.equal(authenticCalls,1);
  assert.equal(complete,true);
  assert.strictEqual(headless.runMatch,base);
  assert.strictEqual(NativeScoredBot.prototype.decodeNextAction,native);
  return {result,source,clones};
}

test('first native finite score replays full authentic tape from decode entry',()=>{
  const {result,source}=runFixture();
  assert.equal(result.events.length,1);
  assert.equal(result.result.early.kind,'earlier-unscored');
  assert.equal(result.result.later.kind,'scored');
  const event=result.events[0],parity=event.nativeSameWorldTape;
  assert.equal(event.nativeTapeScoredRootTurn,4);
  assert.equal(event.nativeTapeFiniteScores,1);
  assert.equal(event.sourceStateChangedBeforeFirstScore,true);
  assert.equal(parity.sameWorldDecisionParityQualified,true);
  assert.equal(parity.selectedActionMatched,true);
  assert.equal(parity.tapeDraws,1);
  assert.equal(parity.consumed,1);
  assert.equal(event.counterfactualCompared,false);
  assert.equal(source.beforeScoreMutation,1);
  assert.equal(event.sourceCaptureFidelity.canonicalGraphMatched,true);
});

test('first native scored tape refuses changed detached policy at same root',()=>{
  const {result}=runFixture({replayPolicy:(_seat,work)=>{
    const data=work();
    return {result:{...data,score:999}};
  }});
  const event=result.events[0];
  assert.equal(event.nativeTapeScoredRootTurn,4);
  assert.equal(event.nativeSameWorldTape.selectedActionMatched,false);
  assert.equal(event.nativeSameWorldTape.sameWorldDecisionParityQualified,false);
  assert.equal(event.counterfactualCompared,false);
});

test('entry-only source finite-score probe skips redundant deep clone under real RNG',()=>{
  const traditional=runFixture();
  const entryOnly=runFixture({entryOnly:true});
  assert.equal(entryOnly.clones+1,traditional.clones);
  assert.equal(entryOnly.result.events[0].nativeSameWorldTape
    .sameWorldDecisionParityQualified,true);
  assert.equal(entryOnly.result.events[0]
    .sourceStateChangedBeforeFirstScore,true);
  assert.deepEqual(
    {early:entryOnly.result.result.early.kind,
      kind:entryOnly.result.result.later.kind,
      score:entryOnly.result.result.later.score},
    {early:traditional.result.result.early.kind,
      kind:traditional.result.result.later.kind,
      score:traditional.result.result.later.score}
  );
});


test('finite score native replay restores research shuffle hooks once',()=>{
  let installed=0,restored=0;
  const {result}=runFixture({
    fairReplayHooks:true,
    installFairBotHooks:()=>{
      installed++;
      return ()=>{restored++;};
    }
  });
  assert.equal(installed,1);
  assert.equal(restored,1);
  assert.equal(result.events[0].nativeSameWorldTape
    .sameWorldDecisionParityQualified,true);
});

test('native replay exception restores research shuffle hooks and vetoes parity',()=>{
  let installed=0,restored=0;
  const {result}=runFixture({
    fairReplayHooks:true,
    installFairBotHooks:()=>{
      installed++;
      return ()=>{restored++;};
    },
    replayPolicy:()=>{throw Error('injected replay error');}
  });
  assert.equal(installed,1);
  assert.equal(restored,1);
  assert.equal(result.events[0].nativeSameWorldTape
    .sameWorldDecisionParityQualified,false);
});

test('both actual-game research replay hooks restore in reverse order',()=>{
  const events=[];
  const {result}=runFixture({
    fairReplayHooks:true,supporterReplayHook:true,
    installFairBotHooks:()=>{
      events.push('fair-on');
      return ()=>events.push('fair-off');
    },
    installSupporterDecisionHook:()=>{
      events.push('supporter-on');
      return ()=>events.push('supporter-off');
    }
  });
  assert.deepEqual(events,[
    'fair-on','supporter-on','supporter-off','fair-off'
  ]);
  assert.equal(result.events[0].nativeSameWorldTape
    .sameWorldDecisionParityQualified,true);
});
