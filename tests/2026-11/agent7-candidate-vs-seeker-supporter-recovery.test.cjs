'use strict';
// Real candidate VS Seeker PHF109 is an Item that recovers one visible
// discarded Supporter. Requires no extra Supporter use until the retrieved
// Supporter itself is played. Pure actor source and prompt contract only.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const VS='VS Seeker PHF 109';
const L="Lillie's Determination MEG 119";
const A='Arven SVI 166',G='Guzma BUS 115',I='Iono PAL 185';
const pokemon=(name='Shadow Rider Calyrex V CRE 74')=>({
  name,printing:name,hp:210,damage:0,tools:[],energies:[],
  abilities:[],attacks:[],printed:{types:['Psychic'],
    subtypes:['Basic','V'],retreatCost:['Colorless']}
});
function fixture(seat,{hand=[VS],discard=[L,A,I],supporterUsed=false,
  rival='Snorlax PGO 55'}={}){
  const view={actorSeat:seat,decisionKind:'owner-root',globalTurn:3,
    ownHand:hand,ownTurnResources:{supporterPlayedTurn:supporterUsed?3:0},
    ownPublic:{active:pokemon(),bench:[],stadium:[],discard,deckCount:25,
      lostZone:[],handCount:hand.length,
      publicTurnRestrictions:{vstarUsed:false}},
    opponentPublic:{active:pokemon(rival),bench:[],stadium:[],deckCount:25,
      discard:[],lostZone:[],publicTurnRestrictions:{}}
  };
  const frontier={schema:protocol.FRONTIER_SCHEMA,items:[
    {kind:'play-card',token:'seeker',actorPrinting:VS,
      publicMetadata:{cardType:'trainer',handIndex:0}},
    {kind:'pass',token:'pass'}
  ]};
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  return {policy,view,frontier,request:{role:'candidate',seat,observation:view,
    publicEventReceipt:null,prompt:null,actionFrontier:frontier}};
}
const source={classification:'actor-choice',sourceKind:'card-effect',
  sourcePrinting:VS,effectName:'VS Seeker'};
function prompt(seat){
  const select=(token,printing,index)=>({
    kind:'card',token,printing,publicMetadata:{selectionIndex:index,
      selectedCount:1,sourceZone:'discard',ownerSeat:'actor',
      isOwnerVisible:true}});
  return {schema:protocol.PROMPT_SCHEMA,
    actingSeat:seat,promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
    source:{...source},publicMetadata:{selectionType:'card-combination',
      minimumCount:1,maximumCount:1,sourceZone:'discard',ownerSeat:'actor',
      isOwnerVisible:true,allowCancel:false,isSecret:false},
    choices:[select('lillie',L,2),select('arven',A,1),select('iono',I,0),
      select('item','Fog Crystal CRE 140',3)]
  };
}
for(const seat of [0,1]){
  test('VS Seeker legal useful Item before pass seat='+seat,()=>{
    const {policy,request}=fixture(seat);
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'seeker'});
  });
  test('VS Seeker actually unlocks next Supporter play seat='+seat,()=>{
    const {policy,request,view}=fixture(seat,{discard:[L]});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'seeker'});
    view.ownHand=[L];
    view.ownPublic.handCount=1;
    view.ownPublic.discard=[VS];
    request.actionFrontier.items=[{kind:'play-card',token:'lillie',
      actorPrinting:L,publicMetadata:{cardType:'trainer'}},{kind:'pass',token:'pass'}];
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'lillie'});
  });
  test('Supporter already used/held or no discard Supporter vetoes Seeker seat='+seat,()=>{
    for(const x of [{supporterUsed:true},{hand:[VS,A]},{discard:[]},
      {discard:['Fog Crystal CRE 140']}]){
      const {policy,request}=fixture(seat,x);
      assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    }
  });
  test('exact discard-owned prompt chooses Lillie and passes strict ABI seat='+seat,()=>{
    const {policy,request,view}=fixture(seat);
    view.decisionKind='owner-prompt';
    const p=prompt(seat);
    assert.doesNotThrow(()=>protocol.validatePrompt(p,seat));
    request.prompt=p;
    const selected=policy.decide(request);
    assert.deepEqual(selected,{kind:'select-choices',tokens:['lillie']});
    assert.deepEqual(protocol.validateDecision(selected,p,new Set()),selected);
  });
  test('Arven for actual Iron Thorns Ability lock, not Snorlax Block seat='+seat,()=>{
    const {policy,request,view}=fixture(seat,{rival:'Iron Thorns ex TWM 77'});
    view.decisionKind='owner-prompt';
    request.prompt=prompt(seat);
    assert.deepEqual(policy.decide(request),{kind:'select-choices',tokens:['arven']});
  });
  test('wrong source and spoofed discard Item rejected seat='+seat,()=>{
    const {policy,request,view}=fixture(seat);
    view.decisionKind='owner-prompt';
    const p=prompt(seat);
    request.prompt=p;
    p.source.sourcePrinting='VS Seeker PHF 110';
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'UNTRUSTED_VS_SEEKER_DISCARD_PROMPT'});
    p.source.sourcePrinting=VS;
    p.publicMetadata.sourceZone='deck';
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'UNTRUSTED_VS_SEEKER_DISCARD_PROMPT'});
    p.publicMetadata.sourceZone='discard';
    p.choices=p.choices.filter(c=>c.token==='item');
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'NO_AUTHENTICATED_DISCARDED_SUPPORTER'});
  });
}
