'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const D='Dialga-GX UPR 100',TREASURE='Mysterious Treasure FLI 113';
const V='Shadow Rider Calyrex V CRE 74';
const MAX='Shadow Rider Calyrex VMAX CRE 75';
const M='Mimikyu GRI 58',R='Regidrago VSTAR SIT 136';
const PSY='Psychic Energy MEE 13',GUZ='Guzma BUS 115';
function mon(printing){
 return {printing,hp:320,damage:0,energies:[],tools:[],abilities:[],
  abilitySuppressions:[],attacks:[],
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
   weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench=[],discard=[]){
 return {active,bench,discard,handCount:3,deckCount:29,prizeCount:5,
  lostZone:[],stadium:[],resolvingSupporter:[],
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
   stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function root(seat,opts={}){
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
  observation:{actorSeat:seat,decisionKind:'owner-root',
   ownHand:[TREASURE,D,GUZ],
   ownTurnResources:{supporterPlayedTurn:0},
   ownPublic:side(mon(MAX),[mon(V),mon(M)]),
   opponentPublic:side(mon(opts.drago===false?'Latias ex SSP 76':R))},
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
   {kind:'play-card',token:'treasure',actorPrinting:TREASURE,
     publicMetadata:{cardType:'item'}},
   {kind:'pass',token:'pass'}]}};
}
function discardPrompt(seat,opts={}){
 const req=root(seat,opts),view=req.observation;
 view.decisionKind='owner-prompt';
 req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
  promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:TREASURE,effectName:'Mysterious Treasure'},
  choices:(opts.onlyProtected?[D,GUZ]:[PSY,GUZ,D,M]).map((printing,i)=>({
   kind:'card',token:'discard-'+i,printing,
   publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
      sourceZone:'hand',selectionIndex:i}
  })),
  publicMetadata:{selectionType:'card-combination',sourceZone:'hand',
   ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,
   maximumCount:1,allowCancel:false,isSecret:false}};
 req.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
 return req;
}
const cases=[
 ['Mysterious Treasure now playable with Dialga as ONLY discardable card',
  root,{}, {kind:'select-action',token:'treasure'}],
 ['Against non-Regidrago root does not waste Treasure on combo payload',
  root,{drago:false}, {kind:'select-action',token:'pass'}],
 ['Real hand discard picks Dialga over Energy, Guzma, Mimikyu',
  discardPrompt,{}, {kind:'select-choices',tokens:['discard-2']}],
 ['Hand discard picks Dialga instead of protected Guzma',
  discardPrompt,{onlyProtected:true},
  {kind:'select-choices',tokens:['discard-0']}],
 ['Without Regidrago in prompt, inert Dialga remains cheap discard',
  discardPrompt,{drago:false},
  {kind:'select-choices',tokens:['discard-2']}]
];
for(const seat of [0,1])for(const [label,factory,opts,expected]of cases)
 test(label+' seat '+seat,()=>{
  const req=factory(seat,opts);
  if(req.prompt)protocol.validatePrompt(req.prompt,seat);
  const out=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
  assert.deepEqual(out.decision,expected);
  protocol.validateDecision(out.decision,req.prompt,
    new Set(req.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(out.policyAudit,req,out.decision,
    policy.POLICY_VERSION);
 });
