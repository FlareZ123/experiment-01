'use strict';
// Aichi original ranks 3 and 7: PAL97 Mimikyu's printed Safeguard
// prevents attack damage from ex and V (including VMAX); not from TAG TEAM GX.
// Source-shaped candidate root tests in both seats, not Store settlements.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const E='Psychic Energy MEE 13', DRAW="Lillie's Determination MEG 119";
const attacks=[
 ['Shadow Rider Calyrex VMAX CRE 75','Max Geist',
  ['Colorless','Colorless','Colorless'],'10+',['VMAX'],4],
 ['Latias ex SSP 76','Eon Blade',
  ['Psychic','Psychic','Colorless'],'200',['Basic','ex'],3],
 ["Lillie's Clefairy ex JTG 56",'Full Moon Rondo',
  ['Psychic','Colorless'],'20+',['Basic','ex'],2],
 ['Trevenant & Dusknoir-GX SMP 217','Night Watch',
  ['Psychic','Psychic','Psychic'],'150',['Basic','TAG TEAM','GX'],3]
];
function p(printing,{hp=210,damage=0,types=['Psychic'],subtypes=['Basic'],
 energies=[],attacks=[],abilities=[],abilitySuppressions=[]}={}){
 return {name:printing,printing,hp,damage,
  printed:{stage:subtypes.includes('VMAX')?'VMAX':'Basic',
    types,subtypes,weakness:[],resistance:[],retreatCost:[]},
  energies,attacks,abilities,abilitySuppressions,tools:[]};
}
const player=(active,bench,prizes)=>({
 active,bench,prizeCount:prizes,deckCount:20,handCount:1,
 stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
 publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
function req(seat,attacker,{targetPrinting='Mimikyu PAL 97',
 suppression=false,known=true,abilities=['Safeguard'],
 targetBench=1,prizes=1}={}){
 const [printing,name,cost,damage,subtypes,numEnergy]=attacker;
 const active=p(printing,{hp:320,subtypes,energies:Array(numEnergy).fill(E),
  attacks:[{name,cost,damage}]});
 const status=known?[{abilityName:'Safeguard',suppressed:suppression}]:[];
 const target=p(targetPrinting,{hp:targetPrinting==='Mimikyu GRI 58'?60:70,
  types:['Psychic'],subtypes:['Basic'],abilities,
  abilitySuppressions:status});
 const mine=[p('Shadow Rider Calyrex V CRE 74'),p('Mimikyu GRI 58')];
 const oppBench=Array(targetBench).fill(p('Snorlax PGO 55'));
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
  observation:{actorSeat:seat,decisionKind:'owner-root',
   globalTurn:6,phase:2,ownHand:[DRAW],
   ownTurnResources:{supporterPlayedTurn:0},
   ownPublic:player(active,mine,prizes),
   opponentPublic:player(target,oppBench,6)},
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
   {kind:'play-card',token:'draw',actorPrinting:DRAW,
     publicMetadata:{cardType:'supporter'}},
   {kind:'attack',token:'attack',attackName:name},
   {kind:'pass',token:'pass'}
  ]}};
}
function select(request){
 return policy.createPolicy({role:'candidate',seat:request.seat,
  policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(request);
}
for(const seat of [0,1]){
 for(const attacker of attacks){
   const fromExOrV=attacker[0]!=='Trevenant & Dusknoir-GX SMP 217';
   test('Mimikyu PAL97 Safeguard '+attacker[1]+' seat '+seat,()=>{
     const r=req(seat,attacker);
     const x=select(r);
     assert.deepEqual(x.decision,{kind:'select-action',
      token:fromExOrV?'draw':'attack'});
     assert.deepEqual(x.policyAudit.selectedTokens,[fromExOrV?'draw':'attack']);
   });
   test('Mimikyu unknown suppression state conservatively held '+attacker[1]+
     ' seat '+seat,()=>{
     const r=req(seat,attacker,{known:false});
     const x=select(r);
     assert.deepEqual(x.decision,{kind:'select-action',
      token:fromExOrV?'draw':'attack'});
   });
   test('visible suppressed Safeguard allows '+attacker[1]+
     ' finish seat '+seat,()=>{
     const r=req(seat,attacker,{suppression:true});
     const x=select(r);
     assert.deepEqual(x.decision,{kind:'select-action',token:'attack'});
   });
   test('same printing but no effective Safeguard preserves final '+attacker[1]+
     ' seat '+seat,()=>{
     const r=req(seat,attacker,{abilities:[]});
     const x=select(r);
     assert.deepEqual(x.decision,{kind:'select-action',token:'attack'});
   });
   test('original GRI58 Mimikyu has no Safeguard and remains attackable '+attacker[1]+
     ' seat '+seat,()=>{
     const r=req(seat,attacker,{targetPrinting:'Mimikyu GRI 58',abilities:[]});
     const x=select(r);
     assert.deepEqual(x.decision,{kind:'select-action',token:'attack'});
   });
 }
 test('Safeguard prevents false terminal Max Geist even with no opponent Bench seat '+seat,()=>{
   const r=req(seat,attacks[0],{targetBench:0,prizes:5});
   const x=select(r);
   assert.deepEqual(x.decision,{kind:'select-action',token:'draw'});
 });
}
