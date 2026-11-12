'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,LILLIE_SELECTOR_VERSION,withBilateralLillieAfterPass,
  executeDevelopmentWithBilateralLillie
}=require('../../simulation/evaluation/2026-11/agent1-bilateral-lillie-common-wrapper.cjs');
const LILLIE="Lillie's Determination M1L";

function makeHarness(){
  class AddPlayerAction{}
  class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
  class PlayCardAction{
    constructor(clientId,handIndex,target){
      this.clientId=clientId;this.handIndex=handIndex;this.target=target;
    }
  }
  class Store{
    constructor(){this.dispatched=[];}
    dispatch(action){this.dispatched.push(action);return 'ok';}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return new PassTurnAction(this.client.id);}
  }
  const observe=(state,seat)=>({
    decisionKind:'owner-root',actorSeat:seat,globalTurn:3,
    ownHand:[LILLIE],
    ownPublic:{deckCount:28,prizeCount:6,resolvingSupporter:[],
      publicTurnRestrictions:{supporterPlayLocked:false}},
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false}
  });
  const deps={SimpleTacticsAi,Store,observe,
    cardActions:{PlayCardAction,PlayerType:{ANY:2},SlotType:{BOARD:3}}};
  return {AddPlayerAction,PassTurnAction,PlayCardAction,Store,SimpleTacticsAi,deps};
}

function playForBothSeats(h){
  const records=[];
  for(const seat of [0,1]){
    const store=new h.Store();
    store.dispatch(new h.AddPlayerAction());
    const id=seat===0?101:202;
    const state={players:[{id:101},{id:202}],activePlayer:seat,prompts:[]};
    const action=new h.SimpleTacticsAi(id).decodeNextAction(state);
    assert.ok(action instanceof h.PlayCardAction);
    assert.equal(action.clientId,id);
    assert.equal(action.handIndex,0);
    store.dispatch(action);
    records.push({seat,action:action.constructor.name,handIndex:action.handIndex});
  }
  return records;
}

test('same actor-only Lillie-after-Pass policy operates for both physical seats',()=>{
  const h=makeHarness();
  const beforeDecode=Object.getOwnPropertyDescriptor(
    h.SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(h.Store.prototype,'dispatch');
  const wrapped=withBilateralLillieAfterPass(()=>playForBothSeats(h),
    {lillieDeps:h.deps});
  assert.deepEqual(wrapped.result,[
    {seat:0,action:'PlayCardAction',handIndex:0},
    {seat:1,action:'PlayCardAction',handIndex:0}
  ]);
  assert.equal(wrapped.policyAudit.version,VERSION);
  assert.equal(wrapped.policyAudit.selectorVersion,LILLIE_SELECTOR_VERSION);
  assert.equal(wrapped.policyAudit.installedForBothPhysicalSeats,true);
  assert.deepEqual(wrapped.policyAudit.observedPhysicalSeats,[0,1]);
  assert.equal(wrapped.policyAudit.attemptedLillieRoots,2);
  assert.equal(wrapped.policyAudit.acceptedLillieRoots,2);
  assert.equal(wrapped.policyAudit.rejectedLillieRoots,0);
  assert.equal(wrapped.policyAudit.selectorInformationSetSafe,true);
  assert.equal(wrapped.policyAudit.competitiveGameQualified,false);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    h.SimpleTacticsAi.prototype,'decodeNextAction'),beforeDecode);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    h.Store.prototype,'dispatch'),beforeDispatch);
});

test('bilateral wrapper composes with inner shared-policy hooks that delegate',()=>{
  const h=makeHarness();
  const beforeDecode=Object.getOwnPropertyDescriptor(
    h.SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(h.Store.prototype,'dispatch');
  const wrapped=withBilateralLillieAfterPass(()=>{
    const previousDecode=Object.getOwnPropertyDescriptor(
      h.SimpleTacticsAi.prototype,'decodeNextAction');
    const previousDispatch=Object.getOwnPropertyDescriptor(
      h.Store.prototype,'dispatch');
    function innerDecode(state){return previousDecode.value.call(this,state);}
    function innerDispatch(action,...args){
      return previousDispatch.value.call(this,action,...args);
    }
    Object.defineProperty(h.SimpleTacticsAi.prototype,'decodeNextAction',
      {...previousDecode,value:innerDecode});
    Object.defineProperty(h.Store.prototype,'dispatch',
      {...previousDispatch,value:innerDispatch});
    try{return playForBothSeats(h);}
    finally{
      Object.defineProperty(h.SimpleTacticsAi.prototype,'decodeNextAction',
        previousDecode);
      Object.defineProperty(h.Store.prototype,'dispatch',previousDispatch);
    }
  },{lillieDeps:h.deps});
  assert.deepEqual(wrapped.policyAudit.observedPhysicalSeats,[0,1]);
  assert.equal(wrapped.policyAudit.acceptedLillieRoots,2);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    h.SimpleTacticsAi.prototype,'decodeNextAction'),beforeDecode);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    h.Store.prototype,'dispatch'),beforeDispatch);
});

test('development adapter preserves original trial output and versions the opt-in',()=>{
  const h=makeHarness();
  const trial={id:'registered-fixture'};
  const candidates=new Map();
  const output=executeDevelopmentWithBilateralLillie(trial,candidates,
    {nativeRootActionLimit:128},{
      executeDevelopment:(actualTrial,actualCandidates,options)=>({
        trial:actualTrial,policyVersion:'agent41-v8-development-v1',
        nativeRootActionLimit:options.nativeRootActionLimit,
        qualifiesForCompetitiveInference:false
      }),
      lillieDeps:h.deps
    });
  assert.equal(output.trial,trial);
  assert.equal(output.nativeRootActionLimit,128);
  assert.equal(output.qualifiesForCompetitiveInference,false);
  assert.equal(output.bilateralLillieAfterPassOptIn,true);
  assert.equal(output.policyVersion,
    'agent41-v8-development-v1+'+LILLIE_SELECTOR_VERSION);
  assert.equal(output.bilateralLillieAfterPassPolicyAudit.version,VERSION);
  assert.equal(output.bilateralLillieAfterPassPolicyAudit.attemptedLillieRoots,0);
});

test('failed native execution restores both prototypes before rethrow',()=>{
  const h=makeHarness();
  const beforeDecode=Object.getOwnPropertyDescriptor(
    h.SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(h.Store.prototype,'dispatch');
  assert.throws(()=>withBilateralLillieAfterPass(()=>{
    throw new Error('fixture failure');
  },{lillieDeps:h.deps}),/fixture failure/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    h.SimpleTacticsAi.prototype,'decodeNextAction'),beforeDecode);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    h.Store.prototype,'dispatch'),beforeDispatch);
});
