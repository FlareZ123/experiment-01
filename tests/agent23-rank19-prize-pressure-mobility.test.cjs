'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const mobility=require('../simulation/evaluation/2026-11/agent23-rank19-mobility.cjs');
const v3=require('../simulation/evaluation/2026-11/agent23-rank19-raging-bolt-opponent-policy-v3-moltres.cjs');
const P='Psychic Energy MEE 13',D='Darkness Energy MEE 15',F='Fighting Energy MEE 14';
const mon=(printing,hp,energies=[],extra={})=>({printing,hp,damage:0,energies,tools:[],specialConditions:[],publicRestrictions:{},...extra});
const mol=()=>mon('Galarian Moltres V CRE 97',220,[D,D,F],{tools:['Float Stone BKT 137']});
const sandy=()=>mon('Sandy Shocks ex PAR 108',220,[F,F,D]);
const clef=()=>mon("Lillie's Clefairy ex JTG 56",190,[]);
const vm=n=>mon('Shadow Rider Calyrex VMAX CRE 75',320,Array(n).fill(P));
function req(n=6,our=6){
 const a=mol(),b=sandy(),d=clef(),v=vm(n);
 return {role:'opponent',seat:0,observation:{actorSeat:0,globalTurn:10,ownHand:[],ownTurnResources:{retreatedTurn:8,supporterPlayedTurn:8},ownPublic:{active:a,bench:[b],stadium:[],discard:[],prizeCount:our,publicTurnRestrictions:{gxUsed:false}},opponentPublic:{active:d,bench:[v],stadium:[],prizeCount:2,publicTurnRestrictions:{}}},actionFrontier:{items:[{kind:'attack',token:'burn',actorPrinting:a.printing,attackName:'Aura Burn',publicMetadata:{attackCostPayable:true}},{kind:'retreat',token:'pivot',targetPrinting:b.printing,publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0,benchIndex:0}}]}};
}
const caps={discard:false,attach:false};
const policy=v3.createPolicy({role:'opponent',seat:0,policyVersion:v3.POLICY_VERSION,config:{}});
test('same two prizes: retreat to 220 HP Sandy avoids 190 Max Geist after Moltres recoil',()=>{
 const r=req();assert.equal(mobility.bestAttack(r.observation,r.observation.ownPublic,r.observation.opponentPublic.active,caps).nativeTerminalReply.damage,190);
 assert.equal(mobility.root(r,caps)?.token,'pivot');assert.equal(policy.decide(r).token,'pivot');
});
test('seven Psychic makes both KO routes exposed; do not assert safer pivot',()=>{const r=req(7);assert.equal(mobility.root(r,caps),null);assert.equal(policy.decide(r).token,'burn');});
test('five Psychic means no funded Moltres KO; keep native direct attack',()=>{const r=req(5);assert.equal(mobility.root(r,caps),null);assert.equal(policy.decide(r).token,'burn');});
test('source terminal Aura Burn still takes final prizes before pivot',()=>{const r=req(8,2);assert.equal(policy.decide(r).token,'burn');});
function gustReq(){
 const r=req();const o=r.observation;o.ownPublic.active=sandy();o.ownPublic.bench=[mol()];o.opponentPublic.bench=[vm(0),vm(6)];
 r.prompt={promptType:'ChoosePokemonPrompt',source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},publicMetadata:{minimumCount:1,maximumCount:1},choices:o.opponentPublic.bench.map((p,i)=>({kind:'pokemon',printing:p.printing,token:i?'funded':'empty',publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:i,isOwnerVisible:true}}))};return r;
}
test('Guzma same-printing target arbitration uses physical funded slot',()=>{const r=gustReq();assert.equal(v3.tacticalPrompt(r).tokens[0],'empty');assert.equal(mobility.prompt(r,caps).tokens[0],'funded');assert.equal(policy.decide(r).tokens[0],'funded');});
test('Guzma prompt order independent of offered token ordering',()=>{const r=gustReq();r.prompt.choices.reverse();assert.equal(policy.decide(r).tokens[0],'funded');});
