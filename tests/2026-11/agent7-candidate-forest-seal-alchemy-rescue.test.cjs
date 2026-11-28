'use strict';
// Fixed Hood candidate Forest Seal Stone's one-use Star Alchemy is an
// in-deck action with a matching generic ChooseCardsPrompt continuation.
// This is actor/worker policy-only; not real Store/fixture qualification.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const V='Shadow Rider Calyrex V CRE 74';
const FSS='Forest Seal Stone SIT 156';

function make(seat,{attached=true,toolPrinting=FSS,subtypes=['Basic','V'],
    vstarUsed=false,handCount=0,deckCount=25,beach=false}={}){
  const own={printing:V,name:'Shadow Rider Calyrex V',hp:210,damage:0,
    energies:[],attacks:[],abilities:[],
    tools:attached?[toolPrinting]:[],
    printed:{subtypes,types:['Psychic'],retreatCost:['Colorless']}};
  const other={printing:'Snorlax PGO 55',name:'Snorlax',hp:150,damage:0,
    energies:[],attacks:[],abilities:[],tools:[],
    printed:{subtypes:['Basic'],types:['Colorless'],retreatCost:['Colorless']}};
  const view={actorSeat:seat,decisionKind:'owner-root',
    ownHand:Array.from({length:handCount},(_,i)=>'Psychic Energy CRE '+(232+i)),
    ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{active:own,bench:[],stadium:[],discard:[],lostZone:[],
      deckCount,handCount,publicTurnRestrictions:{vstarUsed}},
    opponentPublic:{active:other,bench:[],stadium:beach?['Tropical Beach BWP 50']:[],
      discard:[],lostZone:[],deckCount:25,publicTurnRestrictions:{}}
  };
  const frontier={schema:'aichi-action-frontier-v1',items:[
    {token:'alchemy',kind:'use-ability',actorPrinting:V,
      publicMetadata:{abilityName:'Star Alchemy',sourceSeat:'actor',sourceZone:'active'}},
    ...(beach?[{token:'beach',kind:'use-stadium',actorPrinting:'Tropical Beach BWP 50',
      publicMetadata:{stadiumEffectLive:true,
        stadiumPrinting:'Tropical Beach BWP 50'}}]:[]),
    {token:'pass',kind:'pass'}
  ]};
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  const request={role:'candidate',seat,observation:view,prompt:null,
    actionFrontier:frontier,publicEventReceipt:null};
  return {policy,request,view};
}
for(const seat of [0,1]){
  test('attached V tool uses otherwise idle one-use Star Alchemy seat='+seat,()=>{
    const {policy,request}=make(seat);
    const out=policy.decideWithAudit(request);
    assert.deepEqual(out.decision,{kind:'select-action',token:'alchemy'});
    assert.equal(out.policyAudit.selectionRuleCode,'ROOT_LAST_RESORT_STAR_ALCHEMY');
    const row=out.policyAudit.evaluations.find(x=>x.token==='alchemy');
    assert.equal(row.status,'rule-selected');
    assert.equal(row.reasonCode,'STAR_ALCHEMY_RESOURCE_RECOVERY');
  });
  test('VSTAR search happens before opponent-owned end-turn Beach seat='+seat,()=>{
    const {policy,request}=make(seat,{beach:true});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'alchemy'});
    request.observation.ownPublic.publicTurnRestrictions.vstarUsed=true;
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'beach'});
  });
  for(const change of [
    {attached:false},{toolPrinting:'Forest Seal Stone SIT'},
    {toolPrinting:'Forest Seal Stone SIT 157'},
    {subtypes:['Basic']},{vstarUsed:true},
    {handCount:4},{deckCount:1}
  ]){
    test('unsupported/unavailable VSTAR tutor remains pass, seat='+seat+', case='+JSON.stringify(change),()=>{
      const {policy,request}=make(seat,change);
      assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    });
  }
  test('source seat spoofing does not count as owned live Tool ability seat='+seat,()=>{
    const {policy,request}=make(seat);
    const ability=request.actionFrontier.items.find(x=>x.token==='alchemy');
    ability.publicMetadata.sourceSeat='opponent';
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    ability.publicMetadata.sourceSeat='actor';
    ability.publicMetadata.sourceZone='discard';
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
  });
  test('Star Alchemy deck search continuation chooses requested high-priority item seat='+seat,()=>{
    const {policy,request,view}=make(seat);
    view.decisionKind='owner-prompt';
    const mk=(printing,token)=>({kind:'card',token,printing,
      publicMetadata:{ownerSeat:'actor',isOwnerVisible:true}});
    const prompt={schema:'aichi-prompt-projection-v1',actingSeat:seat,
      promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:FSS,effectName:'Star Alchemy'},
      publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
        ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,maximumCount:1},
      choices:[mk('Psychic Energy CRE 232','energy'),
        mk('Fog Crystal CRE 140','fog'),{kind:'empty-selection',token:'none'}]
    };
    request.prompt=prompt;
    assert.deepEqual(policy.decide(request),{kind:'select-choices',tokens:['fog']});
  });
}
