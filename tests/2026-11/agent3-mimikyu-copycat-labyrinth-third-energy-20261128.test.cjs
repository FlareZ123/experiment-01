'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const M='Mimikyu GRI 58',MAX='Shadow Rider Calyrex VMAX CRE 75';
const V='Shadow Rider Calyrex V CRE 74',P='Psychic Energy MEE 13';
const R='Regidrago VSTAR SIT 136',LAB='Wondrous Labyrinth ◇ TEU 158';
const VALLEY='Dimension Valley PHF 93';
function mon(printing,energies=0){
 return {printing,hp:210,damage:0,energies:Array(energies).fill(P),
  tools:[],abilities:[],abilitySuppressions:[],
  attacks:printing===M?[{name:'Copycat',
   cost:['Psychic','Colorless'],damage:''}]:[],
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
   weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench=[],stadium=[]){
 return {active,bench,stadium,discard:[],lostZone:[],handCount:1,
  deckCount:22,prizeCount:4,resolvingSupporter:[],
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
   stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function base(seat,opts={}){
 const bench=[mon(M,opts.mimikyuEnergy??2),mon(MAX,2)];
 const op=side(mon(opts.drago===false?'Latias ex SSP 76':R),[],
  opts.lab?[LAB]:opts.valley?[VALLEY]:[]);
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
  observation:{actorSeat:seat,decisionKind:'owner-root',
   ownHand:[P],ownTurnResources:{supporterPlayedTurn:0},
   ownPublic:side(mon(V),bench),opponentPublic:op},
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function root(seat,opts={}){
 const req=base(seat,opts);
 req.actionFrontier.items=[
  {kind:'play-card',token:'mimikyu',actorPrinting:P,
   targetPrinting:M,publicMetadata:{targetSeat:'actor',
    targetZone:'bench',targetIndex:0}},
  {kind:'play-card',token:'vmax',actorPrinting:P,
   targetPrinting:MAX,publicMetadata:{targetSeat:'actor',
    targetZone:'bench',targetIndex:1}},
  {kind:'pass',token:'pass'}];
 return req;
}
function prompt(seat,opts={},kind='door'){
 const req=base(seat,opts),view=req.observation;
 view.decisionKind='owner-prompt';
 if(kind==='door'){
   req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY',
    source:{classification:'actor-choice',sourceKind:'card-effect',
     sourcePrinting:MAX,effectName:'Underworld Door'},
    choices:[M,MAX].map((printing,i)=>({
     kind:'energy',token:i===0?'mimikyu':'vmax',printing:P,
     publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
      sourceZone:'hand',energyType:'BASIC',zone:'bench',benchIndex:i}})),
    publicMetadata:{selectionType:'energy-attachment',
     sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
     energyType:'BASIC',zone:'bench',minimumCount:1,maximumCount:1,
     allowCancel:false,isSecret:false}};
 }else {
   req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChoosePokemonPrompt',description:'CHOOSE_POKEMON',
    source:{classification:'actor-choice',sourceKind:'card-effect',
     sourcePrinting:'Raihan EVS 152',effectName:'Raihan'},
    choices:[M,MAX].map((printing,i)=>({
     kind:'pokemon',token:i===0?'mimikyu':'vmax',printing,
     label:'Your bench '+(i+1)+': '+printing,
     publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
      targetZone:'bench',benchIndex:i}})),
    publicMetadata:{selectionType:'pokemon',
     ownerSeat:'actor',isOwnerVisible:true,
     minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false}};
 }
 req.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
 return req;
}
const cases=[
 ['Labyrinth forces third Basic Psychic onto Mimikyu by hand',
   root,{lab:true},'mimikyu','select-action'],
 ['No Labyrinth two Psychic already pay Copycat; fund VMAX',
   root,{},'vmax','select-action'],
 ['Labyrinth Mimikyu already has three; fund VMAX',
   root,{lab:true,mimikyuEnergy:3},'vmax','select-action'],
 ['Without opponent Regidrago, fund VMAX under Labyrinth',
   root,{lab:true,drago:false},'vmax','select-action'],
 ['Dimension Valley reduces Copycat cost to one, fund VMAX',
   root,{valley:true,mimikyuEnergy:1},'vmax','select-action'],
 ['Ordinary two-cost Mimikyu with one Psychic prioritised',
   root,{mimikyuEnergy:1},'mimikyu','select-action'],
 ['Underworld Door third Energy picks Mimikyu under Labyrinth',
   (s,o)=>prompt(s,o,'door'),{lab:true},'mimikyu','select-choice'],
 ['Underworld Door two Psychic paid outside Labyrinth funds VMAX',
   (s,o)=>prompt(s,o,'door'),{},'vmax','select-choice'],
 ['Underworld Door against other archetype funds VMAX',
   (s,o)=>prompt(s,o,'door'),{lab:true,drago:false},'vmax','select-choice'],
 ['Underworld Door Mimikyu at three funds VMAX',
   (s,o)=>prompt(s,o,'door'),{lab:true,mimikyuEnergy:3},'vmax','select-choice'],
 ['Raihan recipient under Labyrinth selects Mimikyu for third',
   (s,o)=>prompt(s,o,'raihan'),{lab:true},'mimikyu','select-choices'],
 ['Raihan recipient outside Labyrinth selects VMAX',
   (s,o)=>prompt(s,o,'raihan'),{},'vmax','select-choices']
];
for(const seat of [0,1])for(const [label,factory,opts,token,kind]of cases)
 test(label+' seat '+seat,()=>{
  const req=factory(seat,opts);
  if(req.prompt)protocol.validatePrompt(req.prompt,seat);
  const got=policy.createPolicy({role:'candidate',seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
  const expected=kind==='select-choices'?
    {kind,tokens:[token]}:{kind,token};
  assert.deepEqual(got.decision,expected);
  protocol.validateDecision(got.decision,req.prompt,
   new Set(req.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(got.policyAudit,req,got.decision,
   policy.POLICY_VERSION);
 });
