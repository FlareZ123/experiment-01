'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const V='Shadow Rider Calyrex V CRE 74',MAX='Shadow Rider Calyrex VMAX CRE 75';
const STRETCH='Night Stretcher ASC 196',ARVEN='Arven SVI 166';
const FSS='Forest Seal Stone SIT 156';
const ENERGY='Psychic Energy MEE 13';
const LILLIE="Lillie's Determination MEG 119";
function mon(printing,energy=0,tools=[]){
 return {printing,hp:320,damage:0,energies:Array(energy).fill(ENERGY),tools,
   attacks:[],abilities:[],abilitySuppressions:[],
   printed:{stage:'BASIC',subtypes:['V'],types:['Psychic'],
     weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench=[],discard=[],handCount=2){
 return {active,bench,discard,handCount,deckCount:24,prizeCount:6,
   stadium:[],lostZone:[],resolvingSupporter:[],
   publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function root(seat,what){
 let active=mon(MAX,3),bench=[],discard=[],hand=[],items=[];
 if(what==='stretcherBasic'){
   discard=[V];hand=[STRETCH];
   items=[{kind:'play-card',token:'stretcher',actorPrinting:STRETCH}];
 }else if(what==='stretcherVMAX'){
   bench=[mon(V)];discard=[MAX];hand=[STRETCH];
   items=[{kind:'play-card',token:'stretcher',actorPrinting:STRETCH}];
 }else if(what==='arvenBasic'){
   hand=[ARVEN];items=[{kind:'play-card',token:'arven',actorPrinting:ARVEN}];
 }else if(what==='arvenVMAX'){
   bench=[mon(V)];hand=[ARVEN];items=[{kind:'play-card',token:'arven',actorPrinting:ARVEN}];
 }else if(what==='lillie'){
   hand=[LILLIE];items=[{kind:'play-card',token:'lillie',actorPrinting:LILLIE}];
 }else if(what==='starAlchemy'){
   bench=[mon(V,0,[FSS])];items=[
     {kind:'use-ability',token:'alchemy',actorPrinting:V,
       publicMetadata:{abilityName:'Star Alchemy'}}];
 }else throw Error('unknown '+what);
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
   observation:{actorSeat:seat,decisionKind:'owner-root',
     ownHand:hand,ownTurnResources:{supporterPlayedTurn:0},
     ownPublic:side(active,bench,discard,what==='lillie'?7:hand.length),
     opponentPublic:side(mon('Mimikyu GRI 58'))},
   actionFrontier:{schema:protocol.FRONTIER_SCHEMA,
     items:[...items,{kind:'pass',token:'pass'}]}};
}
function wonderTagPrompt(seat){
 const req=root(seat,'arvenBasic');
 req.observation.decisionKind='owner-prompt';req.observation.ownHand=[];
 req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
   promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD',
   source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:'Tapu Lele-GX GRI 60',effectName:'Wonder Tag'},
   choices:[LILLIE,ARVEN,'Iono PAL 185'].map((printing,i)=>({
     token:'choice-'+i,kind:'card',printing,
     publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
       sourceZone:'deck',selectionIndex:i}})),
   publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
     ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,
     maximumCount:1,allowCancel:false,isSecret:true}};
 req.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
 return req;
}
const cases=[
 ['Stretcher recovers second Basic after first VMAX','stretcherBasic','stretcher'],
 ['Stretcher recovers second VMAX over already established first','stretcherVMAX','stretcher'],
 ['Arven finds second Basic after first VMAX','arvenBasic','arven'],
 ['Arven finds second VMAX for unevolved V','arvenVMAX','arven'],
 ['Lillie draws to establish missing second Basic','lillie','lillie'],
 ['Bench Forest Seal Stone now searches missing second VMAX','starAlchemy','alchemy']
];
for(const seat of [0,1]){
 for(const [label,what,token]of cases)
   test(label+' seat '+seat,()=>{
     const req=root(seat,what);
     const out=policy.createPolicy({role:'candidate',seat,
       policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
     assert.deepEqual(out.decision,{kind:'select-action',token});
     protocol.validateDecision(out.decision,null,
       new Set(req.actionFrontier.items.map(x=>x.token)));
     protocol.validatePolicyAudit(out.policyAudit,req,out.decision,
       policy.POLICY_VERSION);
   });
 test('Wonder Tag chooses Arven for second engine instead of Iono seat '+seat,()=>{
   const req=wonderTagPrompt(seat);
   protocol.validatePrompt(req.prompt,seat);
   const out=policy.createPolicy({role:'candidate',seat,
     policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
   assert.deepEqual(out.decision,
     {kind:'select-choices',tokens:['choice-1']});
   protocol.validateDecision(out.decision,req.prompt,new Set());
   protocol.validatePolicyAudit(out.policyAudit,req,out.decision,
     policy.POLICY_VERSION);
 });
}
