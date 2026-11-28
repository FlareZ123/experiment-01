'use strict';
// The pinned setup reducer places the FIRST selected Pokémon Active and each
// subsequent chosen Basic on Bench. Previous generic worker chose in random
// shuffled hand index order, risking Radiant Eternatus Active (Gate lost)
// and Tapu Lele-GX starting in play (Wonder Tag on Bench-from-hand lost).
// This is exact original Hood 60 opening policy, two seats, pure actor prompt.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const R='Radiant Eternatus CRZ 105',V='Shadow Rider Calyrex V CRE 74',
  L='Latias ex SSP 76',T='Tapu Lele-GX GRI 60',M='Mimikyu GRI 58';
function fixture(seat,printings,{min=1,max=6}={}){
  const choices=printings.map((printing,index)=>({
    token:'card'+index,kind:'card',printing,label:printing,
    publicMetadata:{selectionIndex:index,ownerSeat:'actor',
      sourceZone:'hand',isOwnerVisible:true,selectedCount:1}
  }));
  if(min===0)choices.push({token:'empty',kind:'empty-selection',
    label:'Choose no items'});
  const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChooseCardsPrompt',description:'CHOOSE_STARTING_POKEMONS',
    source:{classification:'actor-choice',sourceKind:'engine',
      sourcePrinting:null,effectName:'CHOOSE_STARTING_POKEMONS'},
    publicMetadata:{selectionType:'card-combination',sourceZone:'hand',
      ownerSeat:'actor',isOwnerVisible:true,isSecret:false,
      allowCancel:false,minimumCount:min,maximumCount:max},choices};
  const view={phase:1,actorSeat:seat,globalTurn:0,
    decisionKind:'owner-prompt',ownHand:printings.slice(),
    ownPublic:{active:null,bench:[],discard:[],stadium:[],deckCount:46,
      handCount:printings.length,publicTurnRestrictions:{}},
    opponentPublic:{active:null,bench:[],discard:[],stadium:[],deckCount:46,
      publicTurnRestrictions:{}}};
  assert.doesNotThrow(()=>protocol.validatePrompt(prompt,seat));
  const policy=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  return {policy,request:{role:'candidate',seat,observation:view,prompt,
    publicEventReceipt:null,
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}},prompt};
}
for(const seat of [0,1]){
  test('Radiant first in shuffled hand; lead V, retain Radiant+Lele for Bench triggers '+seat,()=>{
    const {policy,request,prompt}=fixture(seat,[R,V,L,T]);
    const d=policy.decide(request);
    assert.deepEqual(d,{kind:'select-choices',tokens:['card1','card2']});
    assert.deepEqual(protocol.validateDecision(d,prompt,new Set()),d);
  });
  test('Lele before V: lead attacker rather than sacrifice Wonder Tag '+seat,()=>{
    const {policy,request}=fixture(seat,[T,V,M]);
    assert.deepEqual(policy.decide(request),
      {kind:'select-choices',tokens:['card1','card2']});
  });
  test('native setup selection order (non-monotonic indexes) determines Active '+seat,()=>{
    const {policy,request,prompt}=fixture(seat,[M,R,T,V]);
    const decision=policy.decide(request);
    assert.deepEqual(decision,
      {kind:'select-choices',tokens:['card3','card0']});
    assert.deepEqual(protocol.validateDecision(decision,prompt,new Set()),decision);
  });
  test('Radiant and Lele only: lead Lele, retain Radiant Gate option '+seat,()=>{
    const {policy,request}=fixture(seat,[R,T]);
    assert.deepEqual(policy.decide(request),
      {kind:'select-choices',tokens:['card1']});
  });
  test('forced only Radiant Basic: no illegal skip of mandatory Active '+seat,()=>{
    const {policy,request}=fixture(seat,[R]);
    assert.deepEqual(policy.decide(request),
      {kind:'select-choices',tokens:['card0']});
  });
  test('extra post-mulligan optional Bench holds Gate and Wonder Tag '+seat,()=>{
    const {policy,request}=fixture(seat,[R,T],{min:0,max:2});
    assert.deepEqual(policy.decide(request),
      {kind:'select-choice',token:'empty'});
  });
  test('extra optional Bench adds real Basic V, still holds on-play triggers '+seat,()=>{
    const {policy,request}=fixture(seat,[R,V,T],{min:0,max:3});
    assert.deepEqual(policy.decide(request),
      {kind:'select-choices',tokens:['card1']});
  });
  test('full Basics with Radiant in hand does not fill Gate-needed Bench '+seat,()=>{
    const {policy,request}=fixture(seat,[R,T,V,V,V,M],{min:1,max:6});
    assert.deepEqual(policy.decide(request),
      {kind:'select-choices',tokens:['card2','card3']});
  });
}
