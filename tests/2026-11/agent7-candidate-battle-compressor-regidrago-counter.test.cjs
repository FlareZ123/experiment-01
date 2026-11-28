'use strict';
// Archetype Line Specific: make Dialga-GX UPR100 accessible in discard so a
// Mimikyu Copycat of opponent Regidrago's Apex Dragon can use Timeless-GX.
// Battle Compressor source/deck prompt is NOT a generic card-access reward.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const BC='Battle Compressor PHF 92',D='Dialga-GX UPR 100',M='Mimikyu GRI 58';
const mon=(printing)=>({printing,name:printing,hp:200,damage:0,
  abilities:[],attacks:[],tools:[],energies:[],
  printed:{subtypes:['Basic'],types:['Psychic'],retreatCost:['Colorless']}});
function fixture(seat,{opponent='Regidrago VSTAR SIT 136',
  mimikyu=true,discard=[],hand=[BC]}={}){
  const view={actorSeat:seat,globalTurn:4,decisionKind:'owner-root',
    ownHand:hand,ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{active:mon('Shadow Rider Calyrex V CRE 74'),
      bench:mimikyu?[mon(M)]:[],stadium:[],deckCount:28,
      discard,handCount:hand.length,lostZone:[],
      publicTurnRestrictions:{vstarUsed:false}},
    opponentPublic:{active:mon(opponent),bench:[],stadium:[],
      deckCount:27,discard:[],lostZone:[],publicTurnRestrictions:{}}
  };
  const actions={schema:protocol.FRONTIER_SCHEMA,items:[
    {token:'compressor',kind:'play-card',actorPrinting:BC,
      publicMetadata:{cardType:'trainer'}},{token:'pass',kind:'pass'}]};
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  return {policy,view,request:{role:'candidate',seat,observation:view,
    prompt:null,publicEventReceipt:null,actionFrontier:actions}};
}
const source={classification:'actor-choice',sourceKind:'card-effect',
  sourcePrinting:BC,effectName:'Battle Compressor'};
const select=(token,printing,index,visible=true)=>({
  kind:'card',token,printing,publicMetadata:{
    selectionIndex:index,sourceZone:'deck',ownerSeat:'actor',
    isOwnerVisible:visible,selectedCount:1}});
const prompt=seat=>({
  schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChooseCardsPrompt',
  description:'CHOOSE_CARD_TO_DISCARD',source:{...source},
  publicMetadata:{selectionType:'card-combination',minimumCount:0,
    maximumCount:3,sourceZone:'deck',ownerSeat:'actor',
    isOwnerVisible:true,allowCancel:false,isSecret:true},
  choices:[select('dialga',D,6),
    // Decoy is not the physical original 60 printing; reject it even when alone.
    select('wrong-print','Dialga-GX UPR 82',5),
    select('energy','Psychic Energy MEE 13',0),
    select('fss','Forest Seal Stone SIT 156',2),
    {token:'empty',kind:'empty-selection',label:'Select no cards'}]
});
for(const seat of [0,1]){
  test('source attack-pattern board plays Compressor, seat='+seat,()=>{
    const {policy,request}=fixture(seat);
    assert.deepEqual(policy.decide(request),
      {kind:'select-action',token:'compressor'});
  });
  test('Regidrago counter requires Mimikyu and not already-discarded Dialga, seat='+seat,()=>{
    for(const change of [{mimikyu:false},
      {opponent:'Iron Thorns ex TWM 77'},{discard:[D]}]){
      const {policy,request}=fixture(seat,change);
      assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    }
  });
  test('source-certified deck-to-discard selects Dialga only, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat);
    view.decisionKind='owner-prompt';
    const p=prompt(seat);
    assert.doesNotThrow(()=>protocol.validatePrompt(p,seat));
    request.prompt=p;
    const picked=policy.decide(request);
    assert.deepEqual(picked,{kind:'select-choices',tokens:['dialga']});
    assert.deepEqual(protocol.validateDecision(picked,p,new Set()),picked);
  });
  test('no Dialga remains means empty selection, never dump ACE SPEC, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat);
    view.decisionKind='owner-prompt';
    const p=prompt(seat);
    p.choices=p.choices.filter(c=>c.token!=='dialga');
    request.prompt=p;
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'empty'});
  });
  test('no active matchup line means empty selection, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat,{mimikyu:false});
    view.decisionKind='owner-prompt';
    request.prompt=prompt(seat);
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'empty'});
  });
  test('wrong source, hidden/nonactor card, wrong destination fails closed seat='+seat,()=>{
    const {policy,request,view}=fixture(seat);
    view.decisionKind='owner-prompt';
    const p=prompt(seat);
    request.prompt=p;
    p.source.sourcePrinting='Battle Compressor PHF 93';
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'UNTRUSTED_BATTLE_COMPRESSOR_DISCARD_PROMPT'});
    p.source.sourcePrinting=BC;
    p.publicMetadata.sourceZone='discard';
    assert.deepEqual(policy.decide(request),
      {kind:'abstain',reasonCode:'UNTRUSTED_BATTLE_COMPRESSOR_DISCARD_PROMPT'});
    p.publicMetadata.sourceZone='deck';
    p.choices[0].publicMetadata.isOwnerVisible=false;
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'empty'});
  });
}
