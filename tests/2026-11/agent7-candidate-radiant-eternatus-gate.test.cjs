'use strict';
// Source-certified CRZ105 Radiant Eternatus: Bench play -> mandatory Yes/No
// host prompt -> up to two VMAX direct Bench source-deck choices.
// This is a pure actor policy boundary, not native game or printed-card simulation.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const RADIANT='Radiant Eternatus CRZ 105';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const V='Shadow Rider Calyrex V CRE 74';
const target=(name,{subtypes=['Basic'],types=['Psychic'],attacks=[]}={})=>({
  printing:name,name,hp:210,damage:0,tools:[],abilities:[],energies:[],
  attacks,printed:{types,subtypes,retreatCost:['Colorless']}
});
function setup(seat,{globalTurn=2,bench=[],deckCount=40,
  rival='Snorlax PGO 55',stadium=null,active=target(V,{subtypes:['Basic','V']})}={}){
  const view={actorSeat:seat,globalTurn,decisionKind:'owner-root',
    ownHand:[RADIANT],ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{active,bench,stadium:stadium?[stadium]:[],deckCount,
      handCount:1,discard:[],lostZone:[],publicTurnRestrictions:{vstarUsed:false}},
    opponentPublic:{active:target(rival),bench:[],stadium:[],deckCount:40,
      discard:[],lostZone:[],publicTurnRestrictions:{}}
  };
  const frontier={schema:protocol.FRONTIER_SCHEMA,items:[
    {token:'radiant',kind:'play-card',actorPrinting:RADIANT,
      publicMetadata:{targetSeat:'actor',targetZone:'bench'}},
    {token:'pass',kind:'pass'}
  ]};
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  const request={role:'candidate',seat,observation:view,prompt:null,
    publicEventReceipt:null,actionFrontier:frontier};
  return {view,frontier,policy,request};
}
const source={classification:'actor-choice',sourceKind:'card-effect',
  sourcePrinting:RADIANT,effectName:'Radiant Eternatus'};
const confirm=(seat)=>({
  schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
  promptType:'ConfirmPrompt',description:'WANT_TO_USE_ABILITY',
  source:{...source},publicMetadata:{selectionType:'confirm'},
  choices:[{kind:'confirm',token:'yes',label:'Yes'},
    {kind:'confirm',token:'no',label:'No'}]
});
const card=(token,index,printing=VMAX)=>({
  token,kind:'card',printing,label:printing,
  publicMetadata:{selectionIndex:index,selectedCount:1,
    sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}
});
const deck=(seat)=>({
  schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChooseCardsPrompt',
  description:'CHOOSE_CARD_TO_PUT_ONTO_BENCH',
  source:{...source},
  publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
    ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:2,
    allowCancel:false,isSecret:true},
  choices:[card('first',3),card('second',10),
    card('decoy',4,'Shadow Rider Calyrex V CRE 74'),
    {token:'empty',kind:'empty-selection',label:'Select no cards'}]
});
for(const seat of [0,1]){
  test('turn-two Radiant is the only positive play, seat='+seat,()=>{
    const {policy,request}=setup(seat);
    const response=policy.decideWithAudit(request);
    assert.deepEqual(response.decision,{kind:'select-action',token:'radiant'});
    assert.equal(response.policyAudit.selectionRuleCode,'ROOT_PLAY_MAX_COMPONENT_SCORE');
  });
  test('turn-late, Bench congestion, suppression, deck depletion veto, seat='+seat,()=>{
    for(const opts of [
      {globalTurn:5},{bench:[target(V),target(VMAX,{subtypes:['VMAX','V']}),target(V)]},
      {bench:[target(V),target(V),target(V)]},{deckCount:3},
      {rival:'Iron Thorns ex TWM 77'},
      {stadium:'Path to the Peak CRE 148'},
      {bench:[target(VMAX,{subtypes:['VMAX','V']}),target(VMAX,{subtypes:['VMAX','V']})]}
    ]){
      const {policy,request}=setup(seat,opts);
      assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    }
  });
  test('actual printed VMAXs can be fetched without a V Basic on Bench, seat='+seat,()=>{
    const {policy,request,view}=setup(seat);
    view.decisionKind='owner-prompt';
    view.ownPublic.active=target('Snorlax PGO 55',{types:['Colorless']});
    view.ownPublic.bench=[target(RADIANT,{types:['Dragon']})];
    const yes=confirm(seat),selection=deck(seat);
    assert.doesNotThrow(()=>protocol.validatePrompt(yes,seat));
    assert.doesNotThrow(()=>protocol.validatePrompt(selection,seat));
    request.prompt=yes;
    const accepted=policy.decide(request);
    assert.deepEqual(accepted,{kind:'select-choice',token:'yes'});
    assert.deepEqual(protocol.validateDecision(accepted,yes,new Set()),accepted);
    request.prompt=selection;
    const picks=policy.decide(request);
    assert.deepEqual(picks,{kind:'select-choices',tokens:['first','second']});
    assert.deepEqual(protocol.validateDecision(picks,selection,new Set()),picks);
  });
  test('source-or-effect spoofing rejected, seat='+seat,()=>{
    const {policy,request,view}=setup(seat);
    view.decisionKind='owner-prompt';
    view.ownPublic.bench=[target(RADIANT)];
    const yes=confirm(seat);
    yes.source.sourcePrinting='Radiant Eternatus CRZ 106';
    request.prompt=yes;
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'AMBIGUOUS_SIMPLE_PROMPT'});
    const query=deck(seat);
    query.source.effectName='Climactic Gate';
    request.prompt=query;
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'empty'});
  });
  test('voluntary Gate declines when Bench full or VMAX already established, seat='+seat,()=>{
    const {policy,request,view}=setup(seat);
    view.decisionKind='owner-prompt';
    view.ownPublic.bench=[target(RADIANT),
      target(V),target(V),target(V),target(V)];
    request.prompt=confirm(seat);
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'no'});
    view.ownPublic.bench=[target(RADIANT),
      target(VMAX,{subtypes:['VMAX','V']}),
      target(VMAX,{subtypes:['VMAX','V']})];
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'no'});
  });
}
