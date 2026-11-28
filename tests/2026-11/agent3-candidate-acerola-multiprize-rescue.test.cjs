'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const ACE='Acerola BUS 112',MAX='Shadow Rider Calyrex VMAX CRE 75',
  LAT='Latias ex SSP 76',CLE="Lillie's Clefairy ex JTG 56",MIM='Mimikyu GRI 58';
const mon=(printing,hp=210,damage=0)=>({
  printing,name:printing.split(' ')[0],hp,damage,
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
    weakness:[],resistance:[],retreatCost:['Colorless']},
  energies:[],tools:[],attacks:[],abilities:[],abilitySuppressions:[]
});
const side=(active,bench=[])=>({
  active,bench,stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  deckCount:30,handCount:1,publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
function req(seat,active,bench=[],used=0) {
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
   observation:{actorSeat:seat,decisionKind:'owner-root',ownHand:[ACE],
     ownTurnResources:{supporterPlayedTurn:used},
     ownPublic:side(active,bench),opponentPublic:side(mon('Regidrago VSTAR SIT 136'))},
   actionFrontier:{items:[
     {token:'acerola',kind:'play-card',actorPrinting:ACE,
       publicMetadata:{cardType:'supporter'}},
     {token:'pass',kind:'pass'}
   ]}};
}
function prompt(seat,active,bench=[],wrongSource=false,opponentOnly=false) {
 const r=req(seat,active,bench);r.observation.decisionKind='owner-prompt';
 const choices=[
   {token:'active',kind:'pokemon',printing:active.printing,
     label:'Your Active: '+active.printing,
     publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
       targetZone:'active',selectionIndex:0}},
   ...bench.map((slot,i)=>({
     token:'bench-'+i,kind:'pokemon',printing:slot.printing,
     label:'Your bench '+(i+1)+': '+slot.printing,
     publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
       targetZone:'bench',selectionIndex:i+1}
   }))
 ];
 r.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
   promptType:'ChoosePokemonPrompt',description:'CHOOSE_POKEMON',
   source:{classification:'actor-choice',sourceKind:'card-effect',
     sourcePrinting:wrongSource?'Guzma BUS 115':ACE,effectName:'Acerola'},
   choices:opponentOnly?[{
     token:'opponent',kind:'pokemon',printing:'Regidrago VSTAR SIT 136',
     label:'Opponent bench 1: Regidrago VSTAR SIT 136',
     publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,
       targetZone:'bench',selectionIndex:1}}]:choices,
   publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
     allowCancel:false,isSecret:false}};
 r.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
 return r;
}
function check(input,expected){
 const result=policy.createPolicy({role:'candidate',seat:input.seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
 assert.deepEqual(result.decision,expected);
 if(input.prompt)protocol.validatePrompt(input.prompt,input.seat);
 protocol.validateDecision(result.decision,input.prompt,
   new Set(input.actionFrontier.items.map(x=>x.token)));
 protocol.validatePolicyAudit(result.policyAudit,input,result.decision,
   policy.POLICY_VERSION);
}
for(const seat of [0,1]){
 const action=token=>({kind:'select-action',token});
 const choices=(...tokens)=>({kind:'select-choices',tokens});
 const abstain=reasonCode=>({kind:'abstain',reasonCode});
 for(const [label,input,expected] of [
  ['Rescue damaged Active VMAX',req(seat,mon(MAX,320,210),[mon(LAT)]),action('acerola')],
  ['Full HP does not justify bounce',req(seat,mon(MAX,320,0),[mon(LAT)]),action('pass')],
  ['Do not remove only Active',req(seat,mon(MAX,320,210)),action('pass')],
  ['Rescue damaged Bench VMAX',req(seat,mon(LAT),[mon(MAX,320,210)]),action('acerola')],
  ['Do not bounce small damaged one-Prizer',req(seat,mon(LAT),[mon(MIM,70,60)]),action('pass')],
  ['No second Supporter',req(seat,mon(MAX,320,210),[mon(LAT)],1),action('pass')],
  ['Prefer Active VMAX return',prompt(seat,mon(MAX,320,210),[mon(CLE,190,100)]),choices('active')],
  ['Prefer Bench VMAX over Active ex',prompt(seat,mon(LAT,210,110),[mon(MAX,320,210)]),choices('bench-0')],
  ['Reject sole Active without Bench at prompt',prompt(seat,mon(MAX,320,210)),abstain('NO_SUPPORTED_POKEMON_CHOICE')],
  ['Reject wrong card source',prompt(seat,mon(MAX,320,210),[mon(LAT)],true),abstain('UNTRUSTED_PROMPT_SOURCE')],
  ['Reject nonexistent opponent Bench',prompt(seat,mon(MAX,320,210),[mon(LAT)],false,true),abstain('NO_VISIBLE_POKEMON_TARGET')]
 ]) test(label+' seat '+seat,()=>check(input,expected));
}
