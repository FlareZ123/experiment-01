'use strict';
// Original fixed-60 Tapu Lele-GX GRI 60 Wonder Tag, with physical Bench cost,
// source-owned two-choice ConfirmPrompt and exact Supporter-only deck search.
// Pure worker contract only, not a native physical match/CI receipt.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {createPolicy,POLICY_VERSION}=
 require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const LELE='Tapu Lele-GX GRI 60';
const V='Shadow Rider Calyrex V CRE 74';
const slot=(p,types=['Psychic'],subtypes=['Basic'])=>({
  printing:p,name:p,hp:210,damage:0,attacks:[],abilities:[],energies:[],
  tools:[],printed:{types,subtypes,retreatCost:['Colorless']}
});
function fixture(seat,{hand=[LELE],bench=[],globalTurn=2,
    deckCount=30,rival='Snorlax PGO 55',supporterUsed=false,stadium=[]}={}){
  const view={actorSeat:seat,globalTurn,decisionKind:'owner-root',
    ownHand:hand,ownTurnResources:{supporterPlayedTurn:supporterUsed?globalTurn:0},
    ownPublic:{active:slot(V,['Psychic'],['Basic','V']),bench,stadium,
      deckCount,handCount:hand.length,discard:[],lostZone:[],
      publicTurnRestrictions:{vstarUsed:false}},
    opponentPublic:{active:slot(rival),bench:[],stadium:[],deckCount:27,
      discard:[],lostZone:[],publicTurnRestrictions:{}}
  };
  const frontier={schema:protocol.FRONTIER_SCHEMA,items:[
    {kind:'play-card',token:'lele',actorPrinting:LELE,
      publicMetadata:{targetSeat:'actor',targetZone:'bench'}},
    {kind:'pass',token:'pass'}
  ]};
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  return {view,frontier,policy,request:{role:'candidate',seat,observation:view,
    prompt:null,publicEventReceipt:null,actionFrontier:frontier}};
}
const source={classification:'actor-choice',sourceKind:'card-effect',
  sourcePrinting:LELE,effectName:'Tapu Lele-GX'};
const confirm=seat=>({
  schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ConfirmPrompt',
  description:'WANT_TO_USE_ABILITY',source:{...source},
  publicMetadata:{selectionType:'confirm'},
  choices:[{kind:'confirm',token:'yes',label:'Yes'},
    {kind:'confirm',token:'no',label:'No'}]
});
const search=seat=>({
  schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChooseCardsPrompt',
  description:'CHOOSE_CARD_TO_HAND',source:{...source},
  publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
    ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:1,
    allowCancel:false,isSecret:true},
  choices:[
    {kind:'card',token:'lillie',printing:"Lillie's Determination MEG 119",
      publicMetadata:{selectionIndex:5,sourceZone:'deck',ownerSeat:'actor',
        isOwnerVisible:true,selectedCount:1}},
    {kind:'card',token:'arven',printing:'Arven SVI 166',
      publicMetadata:{selectionIndex:9,sourceZone:'deck',ownerSeat:'actor',
        isOwnerVisible:true,selectedCount:1}},
    {kind:'card',token:'iono',printing:'Iono PAL 185',
      publicMetadata:{selectionIndex:12,sourceZone:'deck',ownerSeat:'actor',
        isOwnerVisible:true,selectedCount:1}},
    {kind:'card',token:'invalid',printing:'Fog Crystal CRE 140',
      publicMetadata:{selectionIndex:1,sourceZone:'deck',ownerSeat:'actor',
        isOwnerVisible:true,selectedCount:1}},
    {kind:'empty-selection',token:'empty',label:'Select no cards'}
  ]
});
for(const seat of [0,1]){
  test('supporterless early board benches Tapu Lele before pass, seat='+seat,()=>{
    const {policy,request}=fixture(seat);
    const out=policy.decide(request);
    assert.deepEqual(out,{kind:'select-action',token:'lele'});
  });
  test('spent Supporter, held Supporter, congestion and lock prevent low-value Lele, seat='+seat,()=>{
    for(const scenario of [
      {supporterUsed:true},{hand:[LELE,"Lillie's Determination MEG 119"]},
      {bench:[slot(V),slot(V),slot(V),slot(V)]},
      {rival:'Iron Thorns ex TWM 77'},{stadium:['Path to the Peak CRE 148']},
      {deckCount:1},{globalTurn:1}
    ]){
      const {policy,request}=fixture(seat,scenario);
      assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    }
  });
  test('real native Wonder Tag two-choice confirmation selected and strict, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat);
    view.decisionKind='owner-prompt';
    view.ownPublic.bench=[slot(LELE)];
    const p=confirm(seat);
    assert.doesNotThrow(()=>protocol.validatePrompt(p,seat));
    request.prompt=p;
    const yes=policy.decide(request);
    assert.deepEqual(yes,{kind:'select-choice',token:'yes'});
    assert.deepEqual(protocol.validateDecision(yes,p,new Set()),yes);
    view.ownHand.push('Arven SVI 166');
    const no=policy.decide(request);
    assert.deepEqual(no,{kind:'select-choice',token:'no'});
  });
  test('Wonder Tag searches one qualified Supporter, not Trainer Item, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat);
    view.decisionKind='owner-prompt';
    view.ownPublic.bench=[slot(LELE)];
    const p=search(seat);
    assert.doesNotThrow(()=>protocol.validatePrompt(p,seat));
    request.prompt=p;
    const one=policy.decide(request);
    assert.deepEqual(one,{kind:'select-choices',tokens:['lillie']});
    assert.deepEqual(protocol.validateDecision(one,p,new Set()),one);
  });
  test('opponent Ability lock can promote Arven instead of draw to find Hood, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat,{rival:'Iron Thorns ex TWM 77'});
    view.decisionKind='owner-prompt';
    view.ownPublic.bench=[slot(LELE)];
    request.prompt=search(seat);
    assert.deepEqual(policy.decide(request),{kind:'select-choices',tokens:['arven']});
  });
  test('wrong Wonder Tag provenance cannot piggyback generic search, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat);
    view.decisionKind='owner-prompt';
    view.ownPublic.bench=[slot(LELE)];
    const p=search(seat);
    p.source.effectName='Wonder Tag';
    request.prompt=p;
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'UNTRUSTED_WONDER_TAG_SUPPORTER_SEARCH'});
    p.source.effectName='Tapu Lele-GX';
    p.source.sourcePrinting='Tapu Lele-GX GRI 61';
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'UNTRUSTED_WONDER_TAG_SUPPORTER_SEARCH'});
  });
}
