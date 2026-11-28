'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const RAD='Radiant Eternatus CRZ 105';
const MAX='Shadow Rider Calyrex VMAX CRE 75';
const BASIC='Shadow Rider Calyrex V CRE 74';
const SKY='Sky Field ROS 89';
const P='Psychic Energy MEE 13';
function mon(printing,attack=false){
 return {printing,hp:320,damage:0,energies:attack?Array(4).fill(P):[],
  tools:[],attacks:attack?[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}]:[],
  abilities:[],abilitySuppressions:[],
  printed:{stage:'BASIC',subtypes:['V'],types:['Psychic'],
   weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench,sky=false){
 return {active,bench,stadium:sky?[SKY]:[],discard:[],lostZone:[],
  resolvingSupporter:[],deckCount:33,handCount:1,prizeCount:6,
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
   stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function root(seat,opts={}){
 const bench=Array.from({length:opts.benchCount??5},(_,i)=>
  mon(i<(opts.vmax??0)?MAX:BASIC));
 const a=mon(opts.funded?MAX:BASIC,opts.funded);
 const req={role:'candidate',seat,prompt:null,publicEventReceipt:null,
  observation:{actorSeat:seat,decisionKind:'owner-root',ownHand:[RAD],
   ownTurnResources:{supporterPlayedTurn:0},
   ownPublic:side(a,bench,opts.sky),
   opponentPublic:side(mon(opts.iron?'Iron Thorns ex TWM 77': 'Latias ex SSP 76'),[])},
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
    {kind:'play-card',token:'radiant',actorPrinting:RAD,
     publicMetadata:{targetSeat:'actor',targetZone:'bench',
      targetIndex:bench.length}},
    {kind:'pass',token:'pass'}]}};
 return req;
}
function gatePrompt(seat,opts={}){
 const req=root(seat,opts);
 req.observation.decisionKind='owner-prompt';
 req.observation.ownPublic.bench.push(mon(RAD)); // Radiant already played
 req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
  promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:RAD,effectName:'Climactic Gate'},
  choices:[
    {kind:'card',token:'vmax1',printing:MAX,
     publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
      sourceZone:'deck',selectionIndex:0}},
    {kind:'card',token:'vmax2',printing:MAX,
     publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
      sourceZone:'deck',selectionIndex:1}},
    {kind:'empty-selection',token:'none'}],
  publicMetadata:{selectionType:'card-combination',
   sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,
   minimumCount:0,maximumCount:2,allowCancel:false,isSecret:false}};
 req.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
 return req;
}
const cases=[
 ['Standard Bench 3 leaves Radiant and one VMAX space',
  root,{benchCount:3}, {kind:'select-action',token:'radiant'}],
 ['Standard Bench 4 leaves no VMAX space: decline Radiant',
  root,{benchCount:4}, {kind:'select-action',token:'pass'}],
 ['Expanded Bench 5 now supports Radiant plus two VMAX',
  root,{benchCount:5,sky:true}, {kind:'select-action',token:'radiant'}],
 ['Expanded Bench 6 supports Radiant plus one VMAX',
  root,{benchCount:6,sky:true}, {kind:'select-action',token:'radiant'}],
 ['Expanded Bench 7 has no VMAX capacity after Radiant',
  root,{benchCount:7,sky:true}, {kind:'select-action',token:'pass'}],
 ['Already established two VMAX: preserve Radiant in hand',
  root,{benchCount:5,sky:true,vmax:2},
  {kind:'select-action',token:'pass'}],
 ['Current payable attacker means skip turn-ending Climactic Gate',
  root,{benchCount:5,sky:true,funded:true},
  {kind:'select-action',token:'pass'}],
 ['Active Iron Thorns ability lock rejects Radiant on-play',
  root,{benchCount:5,sky:true,iron:true},
  {kind:'select-action',token:'pass'}],
 ['Expanded after Radiant at Bench 6 picks exactly two VMAX',
  gatePrompt,{benchCount:5,sky:true},
  {kind:'select-choices',tokens:['vmax1','vmax2']}],
 ['Expanded after Radiant at Bench 7 picks one VMAX',
  gatePrompt,{benchCount:6,sky:true},
  {kind:'select-choices',tokens:['vmax1']}],
 ['Expanded after Radiant at Bench 8 picks no VMAX',
  gatePrompt,{benchCount:7,sky:true},
  {kind:'select-choice',token:'none'}],
 ['Standard after Radiant at Bench 4 picks one VMAX',
  gatePrompt,{benchCount:3},
  {kind:'select-choices',tokens:['vmax1']}]
];
for(const seat of [0,1])for(const [label,factory,opts,expected]of cases)
 test(label+' seat '+seat,()=>{
  const req=factory(seat,opts);
  if(req.prompt)protocol.validatePrompt(req.prompt,seat);
  const got=policy.createPolicy({role:'candidate',seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
  assert.deepEqual(got.decision,expected);
  protocol.validateDecision(got.decision,req.prompt,
    new Set(req.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(got.policyAudit,req,got.decision,
   policy.POLICY_VERSION);
 });
