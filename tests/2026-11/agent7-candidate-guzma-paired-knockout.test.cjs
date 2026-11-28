'use strict';
// Native-pinned BUS115 Guzma implementation first gusts opponent Bench, then
// prompts our own Bench switch. A current-Active-only root policy offers an
// impossible KO (our Active is switched out) and misses paid Bench KOs.
// Source-60 pure worker decisions only; no Store/game win evidence.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const G='Guzma BUS 115',E='Psychic Energy MEE 13';
const P='Shadow Rider Calyrex VMAX CRE 75';
function mon(printing,{energy=0,attacks=[],hp=210,damage=0,stage='Basic'}={}){
  return {printing,name:printing,hp,damage,tools:[],abilities:[],
    energies:Array(energy).fill(E),attacks,
    printed:{types:['Psychic'],subtypes:[stage],retreatCost:['Colorless'],
      weakness:[],resistance:[]}};
}
const max=()=>mon(P,{energy:3,stage:'VMAX',hp:320,
  attacks:[{name:'Max Geist',damage:10,damageCalculation:'+',
    cost:['Colorless','Colorless','Colorless'],
    text:'This attack does 30 more damage for each Psychic Energy attached to all of your Pokémon.'}]});
const baseline=(seat,{activePaid=false,benchPaid=true,oppCheap=true}={})=>{
  const active=activePaid?max():mon('Mimikyu GRI 58',{hp:70});
  const bench=[benchPaid?max():mon('Shadow Rider Calyrex V CRE 74'),
    mon('Shadow Rider Calyrex V CRE 74')];
  const opponentActive=mon('Regidrago VSTAR SIT 136',{hp:280,stage:'VSTAR'});
  const opponentBench=[mon(oppCheap?'Mimikyu GRI 58':'Mega Absol ex MEG 88',
    {hp:oppCheap?70:280}),mon('Mega Absol ex MEG 88',{hp:280})];
  const view={actorSeat:seat,decisionKind:'owner-root',globalTurn:8,
    ownHand:[G],ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{active,bench,discard:[],lostZone:[],stadium:[],
      deckCount:23,handCount:1,publicTurnRestrictions:{gxUsed:false}},
    opponentPublic:{active:opponentActive,bench:opponentBench,stadium:[],
      discard:[],lostZone:[],deckCount:24,publicTurnRestrictions:{gxUsed:false}}};
  const frontier={schema:'aichi-action-frontier-v1',items:[
    {token:'guzma',kind:'play-card',actorPrinting:G,
      publicMetadata:{cardType:'trainer'}},
    {token:'pass',kind:'pass'}]};
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  return {policy,view,request:{role:'candidate',seat,observation:view,prompt:null,
    publicEventReceipt:null,actionFrontier:frontier}};
};
const source={classification:'actor-choice',sourceKind:'card-effect',
  sourcePrinting:G,effectName:'Guzma'};
function choice(seat,token,index,printing){
  return {kind:'pokemon',token,printing,
    label:(seat==='actor'?'Your ':'Opponent ')+'bench '+(index+1)+': '+printing,
    publicMetadata:{ownerSeat:seat,targetZone:'bench',
      benchIndex:index,isOwnerVisible:true,selectedCount:1}};
}
function prompt(seat,who,choices){
  return {schema:'aichi-owner-prompt-projection-v3',actingSeat:seat,
    promptType:'ChoosePokemonPrompt',description:'CHOOSE_POKEMON',
    source:{...source},publicMetadata:{selectionType:'pokemon',
      minimumCount:1,maximumCount:1,allowCancel:false},
    choices};
}
for(const seat of [0,1]){
  test('Guzma can use already-paid Bench VMAX to gust a 70-HP prize, seat='+seat,()=>{
    const {policy,request}=baseline(seat);
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'guzma'});
  });
  test('cannot credit switched-out Active VMAX with a post-Guzma KO, seat='+seat,()=>{
    const {policy,request}=baseline(seat,{activePaid:true,benchPaid:false});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
  });
  test('no paid Bench and no nominal KO target are not lethal-gust lines, seat='+seat,()=>{
    const {policy,request}=baseline(seat,{oppCheap:false});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
  });
  test('first native Guzma prompt targets cheap opposing Bench with paid OWN Bench, seat='+seat,()=>{
    const {policy,view,request}=baseline(seat,{activePaid:false,benchPaid:true});
    view.decisionKind='owner-prompt';
    request.prompt=prompt(seat,'opponent',[
      choice('opponent','cheap',0,'Mimikyu GRI 58'),
      choice('opponent','tank',1,'Mega Absol ex MEG 88')]);
    assert.deepEqual(policy.decide(request),{kind:'select-choices',tokens:['cheap']});
  });
  test('after first native gust, second prompt promotes paid VMAX, seat='+seat,()=>{
    const {policy,view,request}=baseline(seat,{activePaid:false,benchPaid:true});
    view.decisionKind='owner-prompt';
    view.opponentPublic.active=mon('Mimikyu GRI 58',{hp:70});
    request.prompt=prompt(seat,'actor',[
      choice('actor','vmax',0,P),
      choice('actor','v',1,'Shadow Rider Calyrex V CRE 74')]);
    assert.deepEqual(policy.decide(request),{kind:'select-choices',tokens:['vmax']});
  });
}
