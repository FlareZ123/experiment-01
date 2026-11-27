'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const tempo=require('../simulation/evaluation/2026-11/agent23-rank19-adp-tempo.cjs');
const mobility=require('../simulation/evaluation/2026-11/agent23-rank19-mobility.cjs');
const accel=require('../simulation/evaluation/2026-11/agent23-rank19-acceleration-draft.cjs');
const v4=require('../simulation/evaluation/2026-11/agent23-rank19-raging-bolt-opponent-policy-v4-draft.cjs');
const P='Psychic Energy MEE 13',DD='Double Dragon Energy ROS 97',L='Lightning Energy MEE 12';
const mon=(printing,hp,damage=0,n=0,extra={})=>({printing,hp,damage,energies:Array(n).fill(P),tools:[],specialConditions:[],publicRestrictions:{},...extra});
const adp=()=>mon('Arceus & Dialga & Palkia-GX CEC 156',280,0,0,{energies:[DD,L]});
const vm=(n=0)=>mon('Shadow Rider Calyrex VMAX CRE 75',320,0,n);
const v=()=>mon('Shadow Rider Calyrex V CRE 74',210,70,3);
const gira=()=>mon('Girafarig LOT 94',90);
const clef=()=>mon("Lillie's Clefairy ex JTG 56",190,0,0,{abilitySuppressions:[{abilityName:'Fairy Zone',suppressed:false}]});
const mim=()=>mon('Mimikyu GRI 58',70,0,2);
const GX='Altered Creation-GX',RAY='Ultimate Ray',caps={attach:true,discard:true};
function req(target,bench=[],ownBench=[],prizes=3){
 const active=adp(),o={actorSeat:0,globalTurn:10,ownHand:[],ownTurnResources:{retreatedTurn:8,supporterPlayedTurn:8},ownPublic:{active,bench:ownBench,stadium:[],discard:[],prizeCount:6,publicTurnRestrictions:{gxUsed:false}},opponentPublic:{active:target,bench,stadium:[],prizeCount:prizes,publicTurnRestrictions:{}}};
 return {role:'opponent',seat:0,observation:o,actionFrontier:{items:[GX,RAY].map(a=>({kind:'attack',token:a,actorPrinting:active.printing,attackName:a,publicMetadata:{attackCostPayable:true}}))}};
}
const prefer=r=>tempo.preferRay(r.observation,r.observation.ownPublic,r.observation.opponentPublic.active);
const replies=(r,a)=>tempo.replies(r.observation,r.observation.ownPublic,r.observation.opponentPublic.active,a);
const p4=v4.createPolicy({role:'opponent',seat:0,policyVersion:v4.POLICY_VERSION,config:{draftPromptContracts:[v4.ATTACH,v4.DISCARD]}});
test('avoid three-Prize Astral Barrage bench terminal via Ray KO of Calyrex V',()=>{
 const r=req(v(),[gira()],[mon('Sudowoodo GRI 66',100,50),mon('Crobat V DAA 104',180,130)]);
 assert.equal(prefer(r),true);
 assert.equal(mobility.attackRoot(r,caps)?.token,RAY);
 assert.equal(accel.root(r,v4.ATTACH)?.token,RAY);
 assert.equal(p4.decide(r).token,RAY);
});
test('paid VMAX retreat recalculates Psychic total in ADP tempo',()=>{
 const r=req(vm(2),[vm(5),clef()]);
 const q=replies(r,GX).find(x=>x.attack==='Max Geist');
 assert.equal(q.damage,320);assert.equal(q.paidRetreat,2);assert.equal(q.replyRoute,'retreat');
 assert.equal(replies(req(vm(2),[vm(4),clef()]),GX).length,0);
});
test('nonlethal Ray permits paid Mimikyu counter but GX does not',()=>{
 const r=req(vm(2),[mim(),clef()]);
 assert.equal(replies(r,GX).length,0);
 assert.equal(replies(r,RAY).find(x=>x.attack==='Copycat').damage,300);
 assert.equal(prefer(r),false);assert.equal(mobility.attackRoot(r,caps)?.token,GX);assert.equal(accel.root(r,v4.ATTACH)?.token,GX);assert.equal(p4.decide(r).token,GX);
});
test('no final three-Prize threat when opponent still needs four',()=>{
 const r=req(v(),[gira()],[mon('Sudowoodo GRI 66',100,50),mon('Crobat V DAA 104',180,130)],4);
 assert.equal(prefer(r),false);
});
