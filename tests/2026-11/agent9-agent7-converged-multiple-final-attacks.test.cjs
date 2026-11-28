'use strict';
// Source-specific terminal attack priority for all four direct finishers in
// the existing fixed Hood Shadow Rider 60; no generic unknown-attack scoring.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const E='Psychic Energy MEE 13';
const LILLIE="Lillie's Determination MEG 119";
const DIRECT=[
 {printing:'Shadow Rider Calyrex VMAX CRE 75',type:'Max Geist',
   cost:['Colorless','Colorless','Colorless'],damage:'10+',
   energy:4,oppDamage:150,stage:['VMAX','V']},
 {printing:'Latias ex SSP 76',type:'Eon Blade',
   cost:['Psychic','Psychic','Colorless'],damage:'200',
   energy:3,oppDamage:100,stage:['Basic','ex']},
 {printing:'Trevenant & Dusknoir-GX SMP 217',type:'Night Watch',
   cost:['Psychic','Psychic','Psychic'],damage:'150',
   energy:3,oppDamage:140,stage:['Basic','TAG TEAM','GX']},
 {printing:"Lillie's Clefairy ex JTG 56",type:'Full Moon Rondo',
   cost:['Psychic','Colorless'],damage:'20+',
   energy:2,oppDamage:210,stage:['Basic','ex']}
];
function pokemon(printing,opts={}){
 const {damage=0,hp=210,types=['Psychic'],subtypes=['Basic'],
   energies=[],attacks=[]}=opts;
 return {name:printing.split(' CRE')[0],printing,hp,damage,
   printed:{stage:subtypes.includes('VMAX')?'VMAX':'Basic',subtypes,
     types,weakness:[],resistance:[],retreatCost:[]},
   energies,attacks,abilities:[],abilitySuppressions:[],tools:[]};
}
function player(active,bench,prizes,deck=15){
 return {active,bench,prizeCount:prizes,deckCount:deck,handCount:1,
   stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
   publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
     stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function request(seat,cfg,opts={}){
 const {prizes=2,opponentBench=2,energy=cfg.energy,
   damage=cfg.oppDamage,printing=cfg.printing,offerAttack=true,
   modifier=false,attackName=cfg.type,nativeProtection=null}=opts;
 const active=pokemon(printing,{hp:320,subtypes:cfg.stage,
   energies:Array(energy).fill(E),attacks:[{name:cfg.type,
     cost:cfg.cost,damage:cfg.damage}]});
 const mine=[pokemon('Shadow Rider Calyrex V CRE 74'),
   pokemon('Mimikyu GRI 58')];
 const opponent=pokemon('Regidrago VSTAR SIT 136',
   {damage,hp:280,types:['Dragon'],subtypes:['VSTAR','V']});
 const theirs=Array(opponentBench).fill(
   pokemon('Mimikyu GRI 58',{hp:70}));
 const items=[
   {kind:'play-card',token:'draw',actorPrinting:LILLIE,
     publicMetadata:{cardType:'supporter'}},
   ...(offerAttack?[{kind:'attack',token:'finisher',
     attackName,publicMetadata:{hasUnmodeledModifier:modifier,
       ...(nativeProtection??{})}}]:[]),
   {kind:'pass',token:'pass'}
 ];
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
   observation:{actorSeat:seat,decisionKind:'owner-root',phase:2,globalTurn:6,
     ownHand:[LILLIE],ownTurnResources:{supporterPlayedTurn:0},
     ownPublic:player(active,mine,prizes),
     opponentPublic:player(opponent,theirs,6,30)},
   actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items}};
}
function decide(req){
 return policy.createPolicy({role:'candidate',seat:req.seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
}
for(const seat of [0,1]){
 for(const cfg of DIRECT){
   test('immediate last-Prize '+cfg.type+' source '+cfg.printing+
       ' over Lillie seat '+seat,()=>{
     const req=request(seat,cfg);
     const out=decide(req);
     assert.deepEqual(out.decision,{kind:'select-action',token:'finisher'});
     assert.equal(out.policyAudit.selectionRuleCode,
       'ROOT_IMMEDIATE_TERMINAL_DIRECT_ATTACK');
     assert.deepEqual(out.policyAudit.selectedTokens,['finisher']);
     assert.deepEqual(protocol.validateDecision(out.decision,null,
       new Set(req.actionFrontier.items.map(x=>x.token))),out.decision);
   });
   test('nonfinal Prize '+cfg.type+' does not preempt Lillie seat '+seat,()=>{
     const out=decide(request(seat,cfg,{prizes:3}));
     assert.deepEqual(out.decision,{kind:'select-action',token:'draw'});
   });
   test('one fewer attached Energy invalidates '+cfg.type+' gate seat '+seat,()=>{
     const out=decide(request(seat,cfg,{energy:cfg.energy-1}));
     assert.deepEqual(out.decision,{kind:'select-action',token:'draw'});
   });
   test('absent native attack token invalidates '+cfg.type+' gate seat '+seat,()=>{
     const out=decide(request(seat,cfg,{offerAttack:false}));
     assert.deepEqual(out.decision,{kind:'select-action',token:'draw'});
   });
   test('unmodeled native attack modifier vetoes '+cfg.type+' gate seat '+seat,()=>{
     const out=decide(request(seat,cfg,{modifier:true}));
     assert.deepEqual(out.decision,{kind:'select-action',token:'draw'});
   });
   for(const [reason,nativeProtection] of [
     ['explicit damage prevention',{damagePrevented:100}],
     ['known damage reduction',{damageReduced:30}],
     ['native hasPrevention flag',{hasPrevention:true}]
   ]){
     test(reason+' vetoes nominal final '+cfg.type+' seat '+seat,()=>{
       const out=decide(request(seat,cfg,{nativeProtection}));
       assert.deepEqual(out.decision,{kind:'select-action',token:'draw'});
     });
   }
   test('native explicit no-protection numeric zero permits '+cfg.type+
       ' final seat '+seat,()=>{
     const out=decide(request(seat,cfg,{nativeProtection:{
       hasPrevention:false,damagePrevented:0,damageReduced:0}}));
     assert.deepEqual(out.decision,{kind:'select-action',token:'finisher'});
   });
 }
 for(const cfg of DIRECT.slice(1)){
   test('short of final KO: '+cfg.type+' still picks draw seat '+seat,()=>{
     const damage=cfg.type==='Full Moon Rondo'?140:0;
     const out=decide(request(seat,cfg,{damage}));
     assert.deepEqual(out.decision,{kind:'select-action',token:'draw'});
   });
 }
 test('other print Latias same nominal Eon Blade is not certified seat '+seat,()=>{
   const cfg=DIRECT[1];
   const out=decide(request(seat,cfg,{printing:'Latias ex SSP 220'}));
   assert.deepEqual(out.decision,{kind:'select-action',token:'draw'});
 });
 test('other attack on certified source cannot steal finisher name seat '+seat,()=>{
   const cfg=DIRECT[1];
   const out=decide(request(seat,cfg,{attackName:'Shadow Mist'}));
   assert.deepEqual(out.decision,{kind:'select-action',token:'draw'});
 });
 test('last opponent Pokémon KO wins even with four candidate Prizes seat '+seat,()=>{
   const cfg=DIRECT[1];
   const req=request(seat,cfg,{prizes:4,opponentBench:0});
   const out=decide(req);
   assert.deepEqual(out.decision,{kind:'select-action',token:'finisher'});
 });
}
