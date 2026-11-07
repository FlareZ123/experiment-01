'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,
  createPostPrizeResponseActionSequenceObserver,
  joinPostPrizeResponseActionSequences
}=require('../simulation/evaluation/agent3-postprize-response-action-sequence.cjs');

class PlayCardAction{}
class ResolvePromptAction{}
class PassTurnAction{}

function prizes(count){
  return Array.from({length:count},()=>({cards:[{}]}));
}
function card(name){
  return {name,fullName:name};
}
function makeStore(options={}){
  return {state:{
    turn:options.turn??1,
    players:[
      {
        prizes:prizes(options.candidatePrizes??6),
        hand:{cards:(options.hand??['Fog Crystal']).map(card)},
        discard:{cards:(options.discard??[]).map(card)},
        deck:{cards:Array.from({length:options.deckCount??5},(_,i)=>({id:i}))}
      },
      {
        prizes:prizes(options.sourcePrizes??6),
        hand:{cards:[]},discard:{cards:[]},deck:{cards:[]}
      }
    ],
    prompts:options.prompts??[],
    publicBoard:options.publicBoard??[{active:'Candidate'},{active:'Source'}]
  }};
}
function observer(store,rootBinding){
  return createPostPrizeResponseActionSequenceObserver({
    registeredTrials:[{id:'trial1',candidateSlot:'A'}],
    rootBinding,
    publicBoardSnapshot:state=>state.publicBoard
  });
}
test('captures every post-dispatch candidate response root after an exact source Prize exit',()=>{
  const rootBinding={currentTrialId:'trial1'};
  const obs=observer(null,rootBinding);
  const store=makeStore();
  obs.onRootActionDispatched(store,new ResolvePromptAction(),0,1,1);

  store.state.players[0].prizes=prizes(5);
  obs.onRootActionDispatched(store,new ResolvePromptAction(),1,1,1);

  store.state.turn=2;
  store.state.players[0].hand.cards=[card('Psychic Energy'),card('Basic Psychic Energy')];
  store.state.players[0].discard.cards=[card('Fog Crystal')];
  store.state.players[0].deck.cards=Array.from({length:4},(_,i)=>({id:i}));
  store.state.prompts=[{constructor:{name:'ChooseCardsPrompt'},playerId:0}];
  obs.onRootActionDispatched(store,new PlayCardAction(),2,0,2);

  store.state.players[0].hand.cards=[card('Psychic Energy'),card('Basic Psychic Energy')];
  store.state.prompts=[];
  obs.onRootActionDispatched(store,new ResolvePromptAction(),3,0,2);

  store.state.turn=3;
  obs.onRootActionDispatched(store,new PassTurnAction(),4,0,2);

  const result=obs.result();
  assert.equal(VERSION,'agent3-postprize-response-action-sequence-v1');
  assert.equal(result.version,VERSION);
  assert.equal(result.sequences.length,1);
  const [sequence]=result.sequences;
  assert.equal(sequence.registeredTrialId,'trial1');
  assert.equal(sequence.sourceSeat,1);
  assert.equal(sequence.candidateSeat,0);
  assert.deepEqual(sequence.sourcePrizeRootOrdinals,[1]);
  assert.equal(sequence.prizesTaken,1);
  assert.equal(sequence.firstResponseRootOrdinal,2);
  assert.equal(sequence.completedByPass,true);
  assert.equal(sequence.turnEndObserved,true);
  assert.deepEqual(sequence.actions.map(action=>action.rootOrdinal),[2,3,4]);
  assert.equal(sequence.actions[0].pendingPromptTypesAfterAction[0].type,
    'ChooseCardsPrompt');
  assert.deepEqual(sequence.actions[1].pendingPromptTypesAfterAction,[]);
  assert.equal(result.hiddenHandReadBeforeCandidateResponse,false);
  assert.equal(result.policyInputModified,false);
  assert.equal(result.paperLegalityCertified,false);
});

test('multiple source Prize exits in one turn stay attached to the same response',()=>{
  const rootBinding={currentTrialId:'trial1'};
  const obs=observer(null,rootBinding);
  const store=makeStore();
  obs.onRootActionDispatched(store,new ResolvePromptAction(),0,1,1);
  store.state.players[0].prizes=prizes(4);
  obs.onRootActionDispatched(store,new ResolvePromptAction(),1,1,1);
  store.state.players[0].prizes=prizes(3);
  obs.onRootActionDispatched(store,new ResolvePromptAction(),2,1,1);
  store.state.turn=2;
  obs.onRootActionDispatched(store,new PlayCardAction(),3,0,2);
  const [sequence]=obs.result().sequences;
  assert.deepEqual(sequence.sourcePrizeRootOrdinals,[1,2]);
  assert.equal(sequence.prizesTaken,3);
  assert.equal(sequence.firstResponseRootOrdinal,3);
});

test('action-capped response remains explicitly incomplete',()=>{
  const rootBinding={currentTrialId:'trial1'};
  const obs=observer(null,rootBinding);
  const store=makeStore();
  obs.onRootActionDispatched(store,new ResolvePromptAction(),0,1,1);
  store.state.players[0].prizes=prizes(5);
  obs.onRootActionDispatched(store,new ResolvePromptAction(),1,1,1);
  store.state.turn=2;
  obs.onRootActionDispatched(store,new PlayCardAction(),2,0,2);
  const [sequence]=obs.result().sequences;
  assert.equal(sequence.completedByPass,false);
  assert.equal(sequence.turnEndObserved,false);
  assert.equal(sequence.completedAtRootOrdinal,null);
});

test('Prize exit without a candidate action is retained as pending evidence',()=>{
  const rootBinding={currentTrialId:'trial1'};
  const obs=observer(null,rootBinding);
  const store=makeStore();
  obs.onRootActionDispatched(store,new ResolvePromptAction(),0,1,1);
  store.state.players[0].prizes=prizes(5);
  obs.onRootActionDispatched(store,new ResolvePromptAction(),1,1,1);
  const result=obs.result();
  assert.equal(result.sequences.length,0);
  assert.equal(result.pendingPrizeExits.length,1);
  assert.deepEqual(result.pendingPrizeExits[0].sourcePrizeRootOrdinals,[1]);
});

test('joins post-action hand changes to the exact projected response root',()=>{
  const rootBinding={currentTrialId:'trial1'};
  const obs=observer(null,rootBinding);
  const store=makeStore();
  obs.onRootActionDispatched(store,new ResolvePromptAction(),0,1,1);
  store.state.players[0].prizes=prizes(5);
  obs.onRootActionDispatched(store,new ResolvePromptAction(),1,1,1);
  store.state.turn=2;
  store.state.players[0].hand.cards=[card('Psychic Energy'),card('Basic Psychic Energy')];
  store.state.players[0].discard.cards=[card('Fog Crystal')];
  store.state.prompts=[];
  obs.onRootActionDispatched(store,new PlayCardAction(),2,0,2);

  const rawRows=[{
    trial:{id:'trial1'},
    rootActionLedger:[{actionOrdinal:2,action:'PlayCardAction',card:'Fog Crystal'}],
    decisionTrace:[{actionOrdinal:2,decisionHandBefore:{
      ownHandPrintings:['Fog Crystal','Psychic Energy']
    }}]
  }];
  const projected=[{
    registeredTrialId:'trial1',
    causalSourcePrizeRootOrdinal:1,
    candidateOwnerSeat:0,
    candidateReplyNativeTurn:2,
    firstCandidateResponseRootOrdinal:2
  }];
  const joined=joinPostPrizeResponseActionSequences(
    rawRows,projected,obs.result());
  assert.equal(joined.length,1);
  const action=joined[0].postPrizeResponseActionSequence.firstProjectedResponseAction;
  assert.equal(action.actionType,'PlayCardAction');
  assert.equal(action.playedCard,'Fog Crystal');
  assert.equal(action.playedCardInDiscard,true);
  assert.deepEqual(action.handCardsRemoved,['Fog Crystal']);
  assert.deepEqual(action.handCardsAdded,['Basic Psychic Energy']);
});

test('a snapshot from a different Prize root cannot satisfy the join',()=>{
  const rootBinding={currentTrialId:'trial1'};
  const obs=observer(null,rootBinding);
  const store=makeStore();
  obs.onRootActionDispatched(store,new ResolvePromptAction(),0,1,1);
  store.state.players[0].prizes=prizes(5);
  obs.onRootActionDispatched(store,new ResolvePromptAction(),1,1,1);
  store.state.turn=2;
  obs.onRootActionDispatched(store,new PlayCardAction(),2,0,2);
  const rawRows=[{trial:{id:'trial1'},rootActionLedger:[
    {actionOrdinal:2,action:'PlayCardAction'}],decisionTrace:[]}];
  const projected=[{registeredTrialId:'trial1',causalSourcePrizeRootOrdinal:9,
    candidateOwnerSeat:0,candidateReplyNativeTurn:2,
    firstCandidateResponseRootOrdinal:2}];
  assert.throws(()=>joinPostPrizeResponseActionSequences(
    rawRows,projected,obs.result()),
  /exact causal physical Prize root/);
});
