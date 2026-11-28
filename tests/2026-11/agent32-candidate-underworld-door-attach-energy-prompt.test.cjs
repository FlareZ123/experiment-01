'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const E='Psychic Energy MEE 13';
const mon=(id,types=['PSYCHIC'],energies=[])=>({
 printing:id,hp:200,damage:0,printed:{stage:'BASIC',types,subtypes:['Basic'],
 weakness:[],resistance:[],retreatCost:[]},energies,tools:[],attacks:[],abilities:[],
 abilitySuppressions:[]
});
function request(seat,mode){
 const ownBench=mode==='dupeV'?
 [mon('Shadow Rider Calyrex V CRE 74',['PSYCHIC'],[E,E]),
  mon('Shadow Rider Calyrex V CRE 74')]:
 [mon('Shadow Rider Calyrex V CRE 74'),mon('Mimikyu GRI 58')];
 const opponent=mode==='regidrago'?
 mon('Regidrago VSTAR SIT 136',['DRAGON']):
 mon('Shadow Rider Calyrex VMAX CRE 75');
 const ownPublic={active:mon('Shadow Rider Calyrex VMAX CRE 75'),
   bench:ownBench,stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
   deckCount:25,handCount:1,publicTurnRestrictions:{
     gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}};
 const enemyPublic={...ownPublic,active:opponent,bench:[],handCount:5};
 const printable=mode==='wrongEnergy'?'Metal Energy SVE 6':E;
 const choices=ownBench.map((slot,i)=>({
   token:'assign-'+i,kind:'energy',printing:printable,
   label:'Attach '+printable+' to Bench '+(i+1)+': '+slot.printing,
   publicMetadata:{sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
     energyType:'BASIC',zone:'bench',benchIndex:i,choiceIndex:i,selectedCount:1}
 }));
 if(mode==='foreignSeat')for(const choice of choices)
   choice.publicMetadata.ownerSeat='opponent';
 if(mode==='badIndex')for(const choice of choices)
   choice.publicMetadata.benchIndex=4;
 const source={classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:mode==='wrongSource'?'Dialga-GX UPR 100':
   'Shadow Rider Calyrex VMAX CRE 75',effectName:'Underworld Door'};
 const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'AttachEnergyPrompt',
   description:null,source,choices,publicMetadata:{
     selectionType:'energy-attachment',minimumCount:1,maximumCount:1,
     count:choices.length,allowCancel:false,sourceZone:'hand',ownerSeat:'actor',
     isOwnerVisible:true,energyType:'BASIC',zone:'bench'
   }};
 const observation={actorSeat:seat,decisionKind:'owner-prompt',
   pendingPromptType:'AttachEnergyPrompt',ownHand:[E],
   ownPublic,opponentPublic:enemyPublic,ownTurnResources:{supporterPlayedTurn:0}};
 return {role:'candidate',seat,observation,prompt,publicEventReceipt:null,
 actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
for(const seat of [0,1])for(const [mode,want] of [
 ['regidrago','assign-1'],['shadowRider','assign-0'],
 ['dupeV','assign-1'],['wrongEnergy',null],['foreignSeat',null],
 ['badIndex',null],['wrongSource',null]
])test('native Underworld Door energy-attachment '+mode+' seat '+seat,()=>{
 const req=request(seat,mode);
 protocol.validatePrompt(req.prompt,seat);
 const actual=policy.createPolicy({role:'candidate',seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
 if(want===null)assert.deepEqual(actual.decision.kind,'abstain');
 else assert.deepEqual(actual.decision,{kind:'select-choice',token:want});
 protocol.validateDecision(actual.decision,req.prompt,new Set());
 protocol.validatePolicyAudit(actual.policyAudit,req,actual.decision,
   policy.POLICY_VERSION);
});
