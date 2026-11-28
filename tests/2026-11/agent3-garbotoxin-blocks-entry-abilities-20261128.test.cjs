'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const R='Radiant Eternatus CRZ 105',T='Tapu Lele-GX GRI 60';
const M='Marshadow UNB 81',G1='Garbodor LTR 68';
const G2='Garbodor BKP 57',V='Shadow Rider Calyrex V CRE 74';
const TOOL='Float Stone BKT 137';
const SKY='Sky Field ROS 89',JAM='Jamming Tower TWM 153';
function mon(printing,tools=[]){
 return {printing,hp:210,damage:0,energies:[],tools,
  abilities:printing.startsWith('Garbodor ')?['Garbotoxin']:[],
  abilitySuppressions:[],attacks:[],
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
   weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench=[],stadium=[]){
 return {active,bench,stadium,discard:[],lostZone:[],handCount:1,
  deckCount:29,prizeCount:5,resolvingSupporter:[],
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
   stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function req(seat,entry,opts={}){
 const garbo=mon(opts.garbo??G1,opts.tool===false?[]:[TOOL]);
 if(opts.suppressed)garbo.abilitySuppressions=[
  {abilityName:'Garbotoxin',suppressed:true}];
 const opponentActive=mon(opts.iron?'Iron Thorns ex TWM 77':
  opts.weezing?'Galarian Weezing RCL 113':'Latias ex SSP 76');
 const opBench=opts.garbo===null?[]:[garbo];
 const stadium=opts.jam?[JAM]:[SKY];
 const own=side(mon(V),[mon(V)]);
 const opp=side(opponentActive,opBench,stadium);
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
  observation:{actorSeat:seat,decisionKind:'owner-root',
   ownHand:[entry],ownTurnResources:{supporterPlayedTurn:0},
   ownPublic:own,opponentPublic:opp},
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
   {token:'entry',kind:'play-card',actorPrinting:entry,
    publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:1}},
   {token:'pass',kind:'pass'}]}};
}
const cases=[
 ['Equipped LTR Garbotoxin suppresses on-play Radiant from hand',
  R,{},'pass'],
 ['Unattached LTR Garbotoxin cannot suppress Radiant',
  R,{tool:false},'entry'],
 ['Jamming Tower leaves attached Tool; Garbotoxin still blocks Radiant',
  R,{jam:true},'pass'],
 ['Source-stamped suppressed Garbotoxin does not block Radiant',
  R,{suppressed:true},'entry'],
 ['Equipped BKP Garbotoxin also blocks Radiant',
  R,{garbo:G2},'pass'],
 ['Equipped Garbotoxin blocks Tapu Wonder Tag',
  T,{},'pass'],
 ['Garbodor with no Tool permits Wonder Tag',
  T,{tool:false},'entry'],
 ['Jamming Tower cannot unblock Wonder Tag from equipped Garbodor',
  T,{jam:true},'pass'],
 ['Equipped Garbotoxin blocks Marshadow Resetting Hole',
  M,{},'pass'],
 ['Unattached Garbo allows Marshadow to remove Sky Field',
  M,{tool:false},'entry'],
 ['Jamming Tower does not detach Garbo Tool; Marshadow remains blocked',
  M,{jam:true},'pass'],
 ['Iron Thorns active blocks Radiant without Garbodor',
  R,{garbo:null,iron:true},'pass'],
 ['Galarian Weezing Active Neutralizing Gas blocks Tapu',
  T,{garbo:null,weezing:true},'pass'],
 ['No opposing Garbodor or other Ability lock: all three entries work',
  M,{garbo:null},'entry']
];
for(const seat of [0,1])for(const [label,entry,opts,token]of cases)
 test(label+' seat '+seat,()=>{
  const input=req(seat,entry,opts);
  const got=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
  assert.deepEqual(got.decision,{kind:'select-action',token});
  protocol.validateDecision(got.decision,null,
   new Set(input.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(got.policyAudit,input,got.decision,
   policy.POLICY_VERSION);
 });
