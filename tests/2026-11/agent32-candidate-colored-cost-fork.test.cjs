'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
// Original printed Hood 60 contains Psychic Energy x11 and no Metal provider.
// Original Dialga-GX UPR100 Timeless-GX attack cost MMMCC, not payable by Psychic.
const psychic=Array(5).fill('Psychic Energy MEE 13');
const poke=(id,hp,type,energy,attacks,tools=[])=>({
 printing:id,hp,damage:0,printed:{stage:'BASIC',subtypes:['Basic'],
 types:[type],weakness:[],retreatCost:[],resistance:[]},
 energies:energy,attacks,tools,abilities:[],abilitySuppressions:[]
});
const dialga=()=>poke('Dialga-GX UPR 100',180,'Metal',psychic,[{
 name:'Timeless-GX',cost:['Metal','Metal','Metal','Colorless','Colorless'],
 damage:'150',gxAttack:true
}]);
const latias=()=>poke('Latias ex SSP 76',210,'Psychic',psychic.slice(0,3),[{
 name:'Eon Blade',cost:['Psychic','Psychic','Colorless'],damage:'200'
}]);
const vmax=()=>poke('Shadow Rider Calyrex VMAX CRE 75',320,'Psychic',
 psychic.slice(0,3),[{name:'Max Geist',cost:Array(3).fill('Colorless'),
 damage:'10+',text:'This attack does 30 more damage for each Psychic Energy attached to all of your Pokémon.'}]);
const mimikyu=()=>poke('Mimikyu GRI 58',70,'Psychic',
 psychic.slice(0,2),[{name:'Copycat',cost:['Psychic','Colorless'],
 damage:''}],['Float Stone BKT 137']);
const p=(active,bench=[])=>({active,bench,stadium:[],discard:[],lostZone:[],
 resolvingSupporter:[],handCount:1,deckCount:30,
 publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}});
const make=(seat,kind)=>{
 const retreat=kind==='mimikyu';
 const active=kind==='dialga'?dialga():kind==='latias'?latias():
 kind==='vmax'?vmax():mimikyu();
 const actions=retreat?[{token:'retreat-dialga',kind:'retreat',
 targetPrinting:'Dialga-GX UPR 100',publicMetadata:{benchIndex:0}},
 {token:'pass',kind:'pass'}]:[{token:'guzma',kind:'play-card',
 actorPrinting:'Guzma BUS 115',publicMetadata:{cardType:'supporter'}},
 {token:'pass',kind:'pass'}];
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
 observation:{actorSeat:seat,decisionKind:'owner-root',ownHand:retreat?[]:
 ['Guzma BUS 115'],ownPublic:p(active,retreat?[dialga()]:[]),
 opponentPublic:p(poke('Shadow Rider Calyrex VMAX CRE 75',320,'Psychic',[],[]),
 [poke('Mimikyu GRI 58',70,'Psychic',[],[])]),
 ownTurnResources:{supporterPlayedTurn:0}},
 actionFrontier:{schema:'aichi-action-frontier-v1',items:actions}};
};
for(const seat of [0,1])for(const [kind,want] of [
 ['dialga','pass'],['mimikyu','pass'],['latias','guzma'],['vmax','guzma']
]){
 test('actual source-60 typed attack payment '+kind+' seat '+seat,()=>{
 const req=make(seat,kind);
 const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
 const result=policy.decideWithAudit(req);
 assert.deepEqual(result.decision,{kind:'select-action',token:want});
 assert.deepEqual(result.policyAudit.selectedTokens,[want]);
 assert.deepEqual(result.policyAudit.evaluations.map(r=>r.token),
 req.actionFrontier.items.map(r=>r.token));
 });
}
