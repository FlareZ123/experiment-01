'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const P='Psychic Energy MEE 13';
const V='Shadow Rider Calyrex V CRE 74';
const MAX='Shadow Rider Calyrex VMAX CRE 75';
const MEGA='Mega Absol ex MEG 86';
const THORNS='Iron Thorns ex TWM 77';
const DRAGO='Regidrago VSTAR SIT 136';
function mon(printing,hp=210,damage=0,energies=0){
 return {printing,hp,damage,energies:Array(energies).fill(P),
  tools:[],abilities:[],abilitySuppressions:[],attacks:[],
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
    weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench=[],prizeCount=6,deckCount=20){
 return {active,bench,prizeCount,deckCount,handCount:3,
 stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
 publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
 stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function req(seat,config={}){
 const active=mon(config.activePrinting??MAX,320,config.ownDamage??0,
   config.ownEnergy??5);
 if(config.activePrinting==='Latias ex SSP 76') {
   active.hp=210;
   active.attacks=[{name:'Eon Blade',cost:['Psychic','Psychic','Colorless'],damage:'200'}];
 } else {
   active.attacks=[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}];
 }
 const target=mon(config.targetPrinting??THORNS,config.targetHP??230,
   (config.targetHP??230)-(config.targetRemaining??140));
 target.printed.subtypes=config.targetPrinting===DRAGO?['VSTAR']:
   config.targetPrinting===MEGA?['ex','MEGA']:['ex'];
 if(config.spiky)target.energies=['Spiky Energy JTG 159'];
 const oppBench=config.opponentBench===false?[]:[mon('Mimikyu GRI 58',70)];
 const ownBench=config.ownBench===false?[]:[mon(V,210)];
 const owner=side(active,ownBench,config.ownPrize??1,config.deckCount??20);
 const opponent=side(target,oppBench,config.opponentPrize??6);
 const offers=[
   {kind:'play-card',token:'basic',actorPrinting:V,
    publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:1}},
   {kind:'play-card',token:'draw',actorPrinting:"Lillie's Determination MEG 119",
    publicMetadata:{cardType:'supporter'}},
   ...(config.offerAttack===false?[]:[{kind:'attack',token:'attack',
     attackName:config.activePrinting==='Latias ex SSP 76'?'Eon Blade':'Max Geist'}]),
   {kind:'pass',token:'pass'}
 ];
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
   observation:{actorSeat:seat,decisionKind:'owner-root',ownHand:[V,"Lillie's Determination MEG 119"],
     ownTurnResources:{supporterPlayedTurn:0},
     ownPublic:owner,opponentPublic:opponent},
   actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:offers}};
}
const cases=[
 ['Final Prize on two-prizer: attack before redundant Basic/draw',{},
  'attack'],
 ['Opponent only Active: last-board KO beats spending cards',
  {ownPrize:6,opponentBench:false},'attack'],
 ['No terminal prize or board wipe: establish second engine',
  {ownPrize:3,ownBench:false},'basic'],
 ['Insufficient damage: do not claim projected terminal',
  {targetRemaining:190,ownBench:false},'basic'],
 ['Lethal forecast without native attack offer: cannot invent action',
  {offerAttack:false,ownBench:false},'basic'],
 ['Spiky Energy would KO our last Active: no eager winning claim',
  {spiky:true,ownDamage:310,ownBench:false,opponentBench:false},'basic'],
 ['Against modern Mega ex take final three Prizes',
  {ownPrize:3,targetPrinting:MEGA,targetHP:280,targetRemaining:140},'attack'],
 ['Against VSTAR two Prizes cannot clear three remaining',
  {ownPrize:3,targetPrinting:DRAGO,targetHP:280,targetRemaining:140,ownBench:false},'basic'],
 ['Eon Blade funded with Psychic x3 can complete game',
  {activePrinting:'Latias ex SSP 76',ownEnergy:3},'attack'],
 ['Eon Blade with only Psychic x2 not payable for direct terminal',
  {activePrinting:'Latias ex SSP 76',ownEnergy:2},'basic'],
 ['Zero deck cards: execute winning attack before reshuffle/draw',
  {deckCount:0},'attack']
];
for(const seat of [0,1])for(const [label,config,token]of cases)
 test(label+' seat '+seat,()=>{
  const input=req(seat,config);
  const got=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
  assert.deepEqual(got.decision,{kind:'select-action',token});
  protocol.validateDecision(got.decision,null,
    new Set(input.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(got.policyAudit,input,got.decision,
    policy.POLICY_VERSION);
  assert.deepEqual(got.policyAudit.selectedTokens,[token]);
 });
