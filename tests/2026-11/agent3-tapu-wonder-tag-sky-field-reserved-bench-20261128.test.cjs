'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const TAPU='Tapu Lele-GX GRI 60',V='Shadow Rider Calyrex V CRE 74';
const SKY='Sky Field ROS 89',ARVEN='Arven SVI 166';
function mon(printing){
 return {printing,hp:210,damage:0,energies:[],tools:[],attacks:[],
  abilities:[],abilitySuppressions:[],
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
   weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench=[],stadium=[]){
 return {active,bench,stadium,discard:[],lostZone:[],
  resolvingSupporter:[],deckCount:30,handCount:2,prizeCount:6,
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
   stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function req(seat,opts={}){
 const bench=Array.from({length:opts.bench??3},(_,i)=>
   mon(opts.duplicate&&i===0?TAPU:V));
 const view={actorSeat:seat,decisionKind:'owner-root',
  ownHand:[TAPU,...(opts.arven?[ARVEN]:[])],
  ownTurnResources:{supporterPlayedTurn:opts.used?1:0},
  ownPublic:side(mon(V),bench,opts.sky?[SKY]:[]),
  opponentPublic:side(mon(opts.iron?'Iron Thorns ex TWM 77':'Latias ex SSP 76'))};
 return {role:'candidate',seat,publicEventReceipt:null,
  prompt:null,observation:view,
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
   {kind:'play-card',token:'wonder-tag',actorPrinting:TAPU,
    publicMetadata:{targetSeat:'actor',targetZone:'bench',
     targetIndex:bench.length}},
   {kind:'pass',token:'pass'}]}};
}
const cases=[
 ['Ordinary Bench 3 leaves one remaining slot after Tapu',{},
  'wonder-tag'],
 ['Ordinary Bench 4 reserves the last slot', {bench:4},'pass'],
 ['Expanded Sky Field Bench 4 allows on-play Wonder Tag',
  {bench:4,sky:true},'wonder-tag'],
 ['Expanded Sky Field Bench 5 allows Wonder Tag',
  {bench:5,sky:true},'wonder-tag'],
 ['Expanded Sky Field Bench 6 leaves one engine slot',
  {bench:6,sky:true},'wonder-tag'],
 ['Expanded Sky Field Bench 7 reserves final slot',
  {bench:7,sky:true},'pass'],
 ['Opponent Active Iron Thorns disables Wonder Tag',
  {bench:5,sky:true,iron:true},'pass'],
 ['Already used Supporter makes Wonder Tag tutor less urgent',
  {bench:5,sky:true,used:true},'pass'],
 ['Arven already in hand makes extra Tapu unnecessary',
  {bench:5,sky:true,arven:true},'pass'],
 ['Do not Bench second Tapu after one already in play',
  {bench:5,sky:true,duplicate:true},'pass']
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
