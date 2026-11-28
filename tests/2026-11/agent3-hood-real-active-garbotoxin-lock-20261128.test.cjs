'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const HOOD='Stealthy Hood UNB 186',V='Shadow Rider Calyrex V CRE 74';
const MAX='Shadow Rider Calyrex VMAX CRE 75';
const G='Garbodor LTR 68',TOOL='Float Stone BKT 137';
const I='Iron Thorns ex TWM 77',S='Snorlax PGO 55';
const W='Galarian Weezing RCL 113',LAT='Latias ex SSP 76';
function mon(printing,tools=[]){
 return {printing,hp:320,damage:0,energies:[],tools,attacks:[],
  abilities:[],abilitySuppressions:[],
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
   weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench=[],stadium=[]){
 return {active,bench,stadium,discard:[],lostZone:[],
  resolvingSupporter:[],deckCount:29,handCount:1,prizeCount:5,
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
   stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function req(seat,opt={}){
 const own=side(mon(MAX),[mon(V)]);
 const active=mon(opt.active??LAT);
 const opponentBench=[];
 if(opt.bench)opponentBench.push(mon(opt.bench,
  opt.benchTool?[TOOL]:[]));
 if(opt.activeTool)active.tools=[TOOL];
 const op=side(active,opponentBench,
  opt.jamming?['Jamming Tower TWM 153']:[]);
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
  observation:{actorSeat:seat,decisionKind:'owner-root',ownHand:[HOOD],
   ownTurnResources:{supporterPlayedTurn:0},
   ownPublic:own,opponentPublic:op},
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
    {kind:'play-card',token:'hood',actorPrinting:HOOD,
     targetPrinting:MAX,
     publicMetadata:{cardType:'tool',targetSeat:'actor',
      targetZone:'active',targetIndex:-1}},
    {kind:'pass',token:'pass'}]}};
}
const cases=[
 ['Active Iron Thorns Initialization lock earns Hood',{active:I},'hood'],
 ['Benched Iron Thorns does not lock self Abilities',{bench:I},'pass'],
 ['Bench LTR Garbotoxin with attached Tool earns Hood',
  {bench:G,benchTool:true},'hood'],
 ['Bench LTR Garbotoxin without attached Tool is harmless',
  {bench:G},'pass'],
 ['Active equipped Garbotoxin still locks, Hood valuable',
  {active:G,activeTool:true},'hood'],
 ['Active unequipped Garbotoxin no lock',
  {active:G},'pass'],
 ['Active Snorlax PGO Block has live Ability effect',
  {active:S},'hood'],
 ['Benched Snorlax Block is inoperative',
  {bench:S},'pass'],
 ['Active Galarian Weezing Neutralizing Gas earns Hood',
  {active:W},'hood'],
 ['Jamming Tower suppresses our Hood itself',
  {active:I,jamming:true},'pass'],
 ['Jamming Tower suppresses opposing Garbotoxin Tool',
  {bench:G,benchTool:true,jamming:true},'pass'],
 ['No ability lock: preserve singleton Hood',
  {},'pass']
];
for(const seat of [0,1])for(const [label,opts,token]of cases)
 test(label+' seat '+seat,()=>{
  const input=req(seat,opts);
  const out=policy.createPolicy({role:'candidate',seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
  assert.deepEqual(out.decision,{kind:'select-action',token});
  protocol.validateDecision(out.decision,null,
    new Set(input.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(out.policyAudit,input,out.decision,
    policy.POLICY_VERSION);
 });
