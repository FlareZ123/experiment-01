'use strict';
// Source-bound repeatable Underworld Door engine: root before ending turn,
// then one real hand Basic Psychic Energy -> Psychic Bench assignment. The
// pinned host owns dynamic type, native prompt preflight and physical transfer.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const BASIC='Shadow Rider Calyrex V CRE 74';
const PSI='Psychic Energy MEE 13';
const BWP='Tropical Beach BWP 50';
const pokemon=(printing,{types=['Psychic'],subtypes=['Basic','V'],
    abilities=[],attacks=[],energies=[]}={})=>({
  name:printing.split(' CRE')[0],printing,hp:320,damage:0,
  tools:[],abilities,attacks,energies,printed:{types,subtypes,retreatCost:['Colorless']}
});
function game(seat,{hand=[PSI],deckCount=25,bench=[
  pokemon(BASIC)],source=VMAX,stadium=false}={}){
  const active=pokemon(VMAX,{subtypes:['VMAX','V'],abilities:['Underworld Door'],
    energies:[PSI,PSI,PSI],attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],
      damage:10,damageCalculation:'+',text:'30 more per Psychic Energy'}]});
  const opp=pokemon('Regidrago VSTAR SIT 136',{types:['Dragon'],subtypes:['VSTAR','V']});
  const view={actorSeat:seat,decisionKind:'owner-root',phase:2,globalTurn:4,
    ownHand:hand.slice(),ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{active,bench,stadium:[],discard:[],lostZone:[],deckCount,
      handCount:hand.length,publicTurnRestrictions:{vstarUsed:false}},
    opponentPublic:{active:opp,bench:[],stadium:stadium?[BWP]:[],
      deckCount:25,discard:[],lostZone:[],publicTurnRestrictions:{}}
  };
  const items=[
    {kind:'use-ability',token:'door',actorPrinting:source,
      publicMetadata:{abilityName:'Underworld Door',sourceSeat:'actor',sourceZone:'active'}},
    ...(stadium?[{kind:'use-stadium',token:'beach',
      actorPrinting:BWP,publicMetadata:{stadiumEffectLive:true,stadiumPrinting:BWP}}]:[]),
    {kind:'pass',token:'pass'}
  ];
  const request={role:'candidate',seat,observation:view,prompt:null,
    publicEventReceipt:null,actionFrontier:{schema:'aichi-action-frontier-v1',items}};
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  return {view,request,policy};
}
const cardChoice=(token,idx,printing=PSI)=>({
  token,kind:'energy',printing,
  publicMetadata:{sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
    energyType:'BASIC',zone:'bench',benchIndex:idx,
    choiceIndex:idx,selectedCount:1}
});
const attachPrompt=(seat,choices)=>({
  schema:'aichi-prompt-projection-v1',actingSeat:seat,
  promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY_TO_BENCH',
  source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:VMAX,effectName:'Underworld Door'},
  choices,
  publicMetadata:{selectionType:'energy-attachment',
    count:choices.length,minimumCount:1,maximumCount:1,
    sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
    energyType:'BASIC',zone:'bench',allowCancel:true}
});
for(const seat of [0,1]){
  test('Underworld Door from own source VMAX before an attack, seat='+seat,()=>{
    const {policy,request}=game(seat);
    const result=policy.decideWithAudit(request);
    assert.deepEqual(result.decision,{kind:'select-action',token:'door'});
    assert.equal(result.policyAudit.selectionRuleCode,
      'ROOT_UNDERWORLD_DOOR_BEFORE_ATTACK');
    const audit=result.policyAudit.evaluations.find(x=>x.token==='door');
    assert.equal(audit.status,'rule-selected');
  });
  test('Underworld Door before terminal opponent-owned Beach, seat='+seat,()=>{
    const {policy,request}=game(seat,{stadium:true});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'door'});
  });
  for(const change of [
    {hand:[]},{hand:['Double Colorless Energy FCO 114']},
    {bench:[]},{bench:[pokemon('Iron Thorns ex TWM 77',
      {types:['Lightning'],subtypes:['Basic','ex']})]},
    {source:'Shadow Rider Calyrex VMAX CRE'}, {deckCount:2}
  ]){
    test('unavailable source-energy-Bench-draw guard seat='+seat+' case='+JSON.stringify(change),()=>{
      const {policy,request}=game(seat,change);
      assert.notDeepEqual(policy.decide(request),{kind:'select-action',token:'door'});
    });
  }
  test('Underworld Door prioritizes Mimikyu Regidrago counter recipient, seat='+seat,()=>{
    const bench=[
      pokemon('Shadow Rider Calyrex VMAX CRE 75',{types:['Psychic'],subtypes:['VMAX','V'],energies:[PSI]}),
      pokemon('Mimikyu GRI 58',{types:['Psychic'],subtypes:['Basic']})
    ];
    const {view,policy,request}=game(seat,{bench});
    view.decisionKind='owner-prompt';
    request.prompt=attachPrompt(seat,[cardChoice('rider',0),cardChoice('mimikyu',1),
      {kind:'cancel',token:'cancel',label:'Cancel selection'}]);
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'mimikyu'});
  });
  test('Underworld Door validates source and visibility, seat='+seat,()=>{
    const {policy,request,view}=game(seat);
    view.decisionKind='owner-prompt';
    const base=attachPrompt(seat,[cardChoice('psychic',0)]);
    request.prompt=base;
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'psychic'});
    base.source.sourcePrinting='Shadow Rider Calyrex VMAX CRE';
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'UNTRUSTED_UNDERWORLD_ATTACHMENT_SOURCE'});
    base.source.sourcePrinting=VMAX;
    base.choices[0].publicMetadata.isOwnerVisible=false;
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'NO_VALID_UNDERWORLD_ATTACHMENT'});
    base.choices[0].publicMetadata.isOwnerVisible=true;
    base.choices[0].printing='Psychic Energy CRE 232';
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'NO_VALID_UNDERWORLD_ATTACHMENT'});
  });
  test('Underworld Door selects host-provided cancel only if no valid assignment, seat='+seat,()=>{
    const {policy,request,view}=game(seat,{bench:[]});
    view.decisionKind='owner-prompt';
    request.prompt=attachPrompt(seat,[{kind:'cancel',token:'cancel',label:'Cancel selection'}]);
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'cancel'});
  });
}

for(const seat of [0,1]){
  test('strict worker ABI admits Underworld native prompt and selected energy, seat='+seat,()=>{
    const {policy,request,view}=game(seat);
    view.decisionKind='owner-prompt';
    view.pendingPromptType='AttachEnergyPrompt';
    request.prompt=attachPrompt(seat,[
      {...cardChoice('psychic',0),label:'Attach Basic Psychic to Bench 1'},
      {kind:'cancel',token:'cancel',label:'Cancel selection'}
    ]);
    request.prompt.schema=protocol.PROMPT_SCHEMA;
    assert.doesNotThrow(()=>protocol.validatePrompt(request.prompt,seat));
    const chosen=policy.decide(request);
    assert.deepEqual(chosen,{kind:'select-choice',token:'psychic'});
    assert.deepEqual(protocol.validateDecision(
      chosen,request.prompt,new Set()),chosen);
    const cancel=attachPrompt(seat,[{kind:'cancel',token:'cancel',label:'Cancel selection'}]);
    cancel.schema=protocol.PROMPT_SCHEMA;
    assert.doesNotThrow(()=>protocol.validatePrompt(cancel,seat));
    assert.deepEqual(protocol.validateDecision(
      {kind:'select-choice',token:'cancel'},cancel,new Set()),
      {kind:'select-choice',token:'cancel'});
  });
}
