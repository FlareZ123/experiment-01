'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {snapshotFullState,summarizePolicyConfiguration,summarizeNativeStateForText,createFullStateTraceRecorder,formatFullStateTrace}=
  require('../../../simulation/twinleaf/2026-11/agent45/full-state-trace.cjs');

test('snapshot preserves concealed zones, card identities, attack data and cycles without invoking getters',()=>{
  let getterCalls=0;
  const card={fullName:'Shadow Rider Calyrex VMAX CRE 75',name:'Shadow Rider Calyrex VMAX',attacks:[{name:'Max Geist',cost:['Psychic','Psychic']}]};
  const state={turn:4,phase:'PLAYER_TURN',players:[{id:101,deck:{cards:[card]},hand:{cards:[{fullName:'Psychic Energy MEE 13'}]},prizes:[{cards:[{fullName:"Boss's Orders PAL 172"}]}],active:{cards:[card],damage:50}}],prompts:[],logs:[{message:'draw'}]};
  state.self=state;
  Object.defineProperty(state,'dangerous',{enumerable:true,get(){getterCalls++;throw new Error('must not execute');}});
  const snap=snapshotFullState(state);
  const json=JSON.stringify(snap);
  assert.equal(getterCalls,0);
  assert.match(json,/Shadow Rider Calyrex VMAX CRE 75/);
  assert.match(json,/Psychic Energy MEE 13/);
  assert.match(json,/Boss's Orders PAL 172/);
  assert.match(json,/Max Geist/);
  assert.ok(json.includes('"$ref":1'));
  assert.ok(json.includes('"$type":"Accessor"'));
});

test('trace records initial state, every contiguous action, prompt, final logs and readable output',()=>{
  const recorder=createFullStateTraceRecorder({label:'diagnostic',seed:123,policyConfiguration:[{seat:0,tacticOrder:['AttackTactic','PlayBasicTactic'],promptResolverOrder:['ChooseCardsPromptResolver']}]});
  const initial={turn:1,phase:'PLAYER_TURN',activePlayer:0,players:[{id:101,deck:{cards:[{fullName:'Psychic Energy'}]},hand:{cards:[{fullName:'Quick Ball FST 237'}]},discard:{cards:[]},lostzone:{cards:[]},prizes:[{cards:[{fullName:"Boss's Orders PAL 172"}]}],stadium:{cards:[]},supporter:{cards:[]}}],prompts:[{playerId:101,message:'Choose a Pokémon',cards:[{fullName:'Shadow Rider Calyrex V'}],choices:['Active','Bench 1']}],logs:[]};
  const board=[{active:{name:'Shadow Rider Calyrex',printedAttacks:[{name:'Max Geist',cost:['Psychic','Psychic']}]},bench:[],stadium:[]}];
  const humanSummary=summarizeNativeStateForText(initial,board);
  recorder.captureInitial(initial,board,humanSummary);
  const after={turn:1,players:[{hand:{cards:[]},discard:{cards:[{fullName:'Quick Ball FST 237'}]}}],logs:[{message:'Quick Ball played'}]};
  recorder.captureStep({state:after,action:{kind:'PlayCardAction',card:{fullName:'Quick Ball FST 237'}},actionOrdinal:1,playerSlot:0,playerId:101,actionType:'PlayCardAction',turnBefore:1,turnAfter:1,phaseBefore:'PLAYER_TURN',phaseAfter:'PLAYER_TURN',publicBoard:board,humanSummary,pendingPrompt:{message:'Choose a Pokémon'}});
  recorder.captureFinal(after);
  const trace=recorder.result();
  assert.equal(trace.complete,true);
  assert.equal(trace.stepCount,1);
  assert.match(JSON.stringify(trace.policyConfiguration),/AttackTactic/);
  assert.equal(trace.steps[0].beforeState.kind,'initial');
  assert.match(JSON.stringify(trace.steps[0].afterState),/Quick Ball FST 237/);
  assert.match(JSON.stringify(trace.nativeLogs),/Quick Ball played/);
  assert.match(JSON.stringify(trace.steps[0].nativeLogDelta),/Quick Ball played/);
  assert.match(JSON.stringify(trace.initialPublicBoard),/Max Geist/);
  assert.match(JSON.stringify(trace.steps[0].publicBoard),/Max Geist/);
  assert.match(JSON.stringify(trace.initialHumanSummary),/Psychic Energy/);
  assert.match(JSON.stringify(trace.initialHumanSummary),/Boss's Orders PAL 172/);
  assert.match(JSON.stringify(trace.initialHumanSummary),/Max Geist/);
  assert.match(JSON.stringify(trace.initialHumanSummary),/Bench 1/);
  const text=recorder.text();
  assert.match(text,/TWINLEAF OFFLINE FULL-STATE TRACE/);
  assert.match(text,/PER-SEAT POLICY CONFIGURATION/);
  assert.match(text,/SELECTED ACTION/);
  assert.match(text,/GAME STATE AFTER ACTION/);
  assert.match(text,/NATIVE LOG DELTA/);
  assert.match(text,/Quick Ball played/);
  assert.match(text,/Quick Ball FST 237/);
  assert.doesNotMatch(text,/AFTER NATIVE STATE/);
  assert.match(text,/phase PLAYER_TURN -> PLAYER_TURN/);
  assert.match(text,/actor 101 \/ seat 0 \| PlayCardAction/);
  assert.match(text,/Choose a Pokémon/);
  assert.match(formatFullStateTrace(trace),/FINAL NATIVE LOGS/);
});

test('trace rejects skipped action ordinals and marks bounded snapshots as truncated',()=>{
  const recorder=createFullStateTraceRecorder();
  recorder.captureInitial({turn:0,logs:[]});
  assert.throws(()=>recorder.captureStep({state:{},action:{},actionOrdinal:2}),/contiguous/);
  const snap=snapshotFullState({a:{b:{c:1}}},{maxDepth:1});
  assert.equal(snap.truncated,true);
});

test('failure stages preserve the rejected action and error while keeping cumulative logs out of repeated snapshots',()=>{
  const recorder=createFullStateTraceRecorder({label:'failed-decision'});
  const initial={turn:2,players:[],logs:[]};
  recorder.captureInitial(initial);
  const failed={turn:2,players:[],logs:[{message:'last accepted action'}]};
  const error=new Error('synthetic decoder failure');
  recorder.captureStep({state:failed,action:null,actionOrdinal:1,playerSlot:1,playerId:202,actionType:null,turnBefore:2,turnAfter:2,phaseBefore:'PLAYER_TURN',phaseAfter:'PLAYER_TURN',pendingPrompt:{message:'Choose a card'},error,failureStage:'bot-decoder'});
  recorder.captureFinal(failed);
  const trace=recorder.result();
  assert.equal(trace.steps[0].failureStage,'bot-decoder');
  assert.match(JSON.stringify(trace.steps[0].error),/synthetic decoder failure/);
  assert.ok(JSON.stringify(trace.steps[0].afterState).includes('"logs":{"$type":"OmittedForTrace","itemCount":1}'));
  assert.match(JSON.stringify(trace.nativeLogs),/last accepted action/);
  assert.equal(trace.complete,true);
  assert.match(recorder.text(),/FAILURE STAGE: bot-decoder/);
});

test('configurable recorder bounds make incomplete snapshots explicit',()=>{
  const recorder=createFullStateTraceRecorder({limits:{maxDepth:0,maxNodes:2}});
  recorder.captureInitial({turn:1,players:[{id:101}],logs:[]});
  recorder.captureFinal({turn:1,players:[],logs:[]});
  const trace=recorder.result();
  assert.equal(trace.initialState.truncated,true);
  assert.equal(trace.complete,false);
});

test('action-count cap stops trace capture without claiming completeness',()=>{
  const recorder=createFullStateTraceRecorder({limits:{maxSteps:1}});
  recorder.captureInitial({turn:1,logs:[]});
  recorder.captureStep({state:{turn:1,logs:[]},action:{kind:'PassAction'},actionOrdinal:1,turnBefore:1,turnAfter:1});
  assert.throws(()=>recorder.captureStep({state:{turn:1,logs:[]},action:{kind:'PassAction'},actionOrdinal:2}),/maxSteps exceeded/);
  recorder.captureFinal({turn:1,logs:[]});
  const trace=recorder.result();
  assert.equal(trace.stepCount,1);
  assert.equal(trace.stepLimitExceeded,true);
  assert.equal(trace.complete,false);
  assert.match(formatFullStateTrace(trace),/step limit exceeded: true/);
});

test('policy configuration summary preserves both-seat tactic and resolver order plus arbiter modes',()=>{
  function AttackTactic() {}
  class PlayBasicTactic {}
  function ChooseCardsPromptResolver() {}
  let getterCalls=0;
  const accessorNamedTactic={};
  Object.defineProperty(accessorNamedTactic,'name',{get(){getterCalls++;throw new Error('name getter must not run');}});
  const scores={Z:1,A:2};
  Object.defineProperty(scores,'secret',{enumerable:true,get(){getterCalls++;throw new Error('score getter must not run');}});
  const summary=summarizePolicyConfiguration([
    {tactics:[AttackTactic,PlayBasicTactic,{name:'EnergyAttachmentTactic'},accessorNamedTactic],
      promptResolvers:[ChooseCardsPromptResolver],scores,
      arbiter:{flipMode:'random',shuffleMode:'seeded'}},
    {tactics:[],promptResolvers:[],scores:{},arbiter:null}
  ]);
  assert.equal(getterCalls,0);
  assert.deepEqual(summary,[
    {seat:0,tacticOrder:['AttackTactic','PlayBasicTactic','EnergyAttachmentTactic','Object'],
      promptResolverOrder:['ChooseCardsPromptResolver'],scoreKeys:['A','Z','secret'],scoreValues:{A:2,Z:1,secret:undefined},
      arbiter:{flipMode:'random',shuffleMode:'seeded'}},
    {seat:1,tacticOrder:[],promptResolverOrder:[],scoreKeys:[],scoreValues:{},arbiter:null}
  ]);
});

test('compact human summary reads inherited data without invoking accessors',()=>{
  let getterCalls=0;
  const accessorCard={};
  Object.defineProperty(accessorCard,'fullName',{get(){getterCalls++;throw new Error('card getter must not run');}});
  const inheritedCard=Object.create({fullName:'Inherited Psychic Energy'});
  const state={turn:1,players:[{id:101,hand:{cards:[accessorCard]},deck:{cards:[inheritedCard]}}],prompts:[]};
  const summary=summarizeNativeStateForText(state);
  assert.equal(getterCalls,0);
  assert.equal(summary.players[0].hand[0],'Object');
  assert.equal(summary.players[0].deck[0],'Inherited Psychic Energy');
});

test('per-action log delta marks a native log-array reset',()=>{
  const recorder=createFullStateTraceRecorder();
  recorder.captureInitial({turn:1,logs:[{message:'setup 1'},{message:'setup 2'},{message:'setup 3'}]});
  recorder.captureStep({state:{turn:2,logs:[{message:'new log epoch'}]},action:{kind:'PassAction'},actionOrdinal:1,turnBefore:1,turnAfter:2});
  const delta=recorder.result().steps[0].nativeLogDelta;
  assert.equal(delta.reset,true);
  assert.equal(delta.countBefore,3);
  assert.equal(delta.countAfter,1);
  assert.match(JSON.stringify(delta.entries),/new log epoch/);
});

test('headless trace integration is opt-in, guarded and fail-open',()=>{
  const headless=fs.readFileSync(path.join(__dirname,'../../../simulation/twinleaf/headless.cjs'),'utf8');
  assert.match(headless,/request\.captureFullStateTrace === true/);
  assert.match(headless,/createFullStateTraceRecorder/);
  assert.match(headless,/summarizeNativeStateForText/);
  assert.equal((headless.match(/if\(fullStateTraceRecorder\) recordFullStateStep\(\{/g)||[]).length,4);
  assert.match(headless,/function captureTracePublicBoard/);
  assert.match(headless,/function captureTraceHumanSummary/);
  assert.match(headless,/try\s*\{\s*fullStateTraceRecorder=createFullStateTraceRecorder/);
  assert.match(headless,/catch\(error\)\s*\{\s*fullStateTraceCaptureError=/);
  assert.match(headless,/fullStateTraceCaptureError/);
  assert.match(headless,/fullStateTraceText:formatFullStateTrace\(fullStateTraceResult\)/);
});

test('public-board snapshot truncation marks the diagnostic incomplete',()=>{
  const recorder=createFullStateTraceRecorder({limits:{maxDepth:1}});
  recorder.captureInitial({turn:1,logs:[]},[{active:{name:'Calyrex',attacks:[{name:'Max Geist',cost:['Psychic']}]}}],{turn:1});
  recorder.captureFinal({turn:1,logs:[]});
  const trace=recorder.result();
  assert.equal(trace.initialPublicBoard.truncated,true);
  assert.equal(trace.complete,false);
});
