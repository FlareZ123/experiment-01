'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const tempo=require('../simulation/evaluation/2026-11/agent23-rank19-adp-tempo.cjs');
const accel=require('../simulation/evaluation/2026-11/agent23-rank19-acceleration-draft.cjs');
const mobility=require('../simulation/evaluation/2026-11/agent23-rank19-mobility.cjs');
const P='Psychic Energy',D='Double Dragon Energy ROS 97',L='Lightning Energy';
const adp=(energy=[D,L],damage=0)=>({printing:'Arceus & Dialga & Palkia-GX CEC 156',hp:280,damage,energies:energy,tools:[],specialConditions:[]});
const mon=(printing,hp,energy=0,damage=0,extra={})=>({printing,hp,damage,energies:Array(energy).fill(P),tools:[],specialConditions:[],...extra});
const clef=(energy=2,damage=0,live=true)=>mon("Lillie's Clefairy ex JTG 56",190,energy,damage,{abilitySuppressions:[{abilityName:'Fairy Zone',suppressed:!live}]});
const vmax=(energy=3,damage=0)=>mon('Shadow Rider Calyrex VMAX CRE 75',320,energy,damage);
const mim=(energy=2)=>mon('Mimikyu GRI 58',70,energy);
const basic=()=>mon('Shadow Rider Calyrex V CRE 74',210);
const gira=()=>mon('Girafarig LOT 94',90);
const sourceBench=()=>[
 mon('Raging Bolt ex TEF 123',240),mon('Galarian Moltres V CRE 97',220),
 mon('Dedenne-GX UNB 57',160),mon('Latias ex SSP 76',210),mon('Sudowoodo GRI 66',100)
];
const root=(attackName,token)=>({kind:'attack',actorPrinting:'Arceus & Dialga & Palkia-GX CEC 156',attackName,token,publicMetadata:{attackCostPayable:true}});
const GX='Altered Creation-GX',RAY='Ultimate Ray',A='rank19-attachment-set-v1';
function req({own=adp(),target=vmax(),bench=[],ownBench=[],prizes=6,foePrizes=6,stadium=[],gxUsed=false,items=[root(GX,'gx'),root(RAY,'ray')]}={}){
 return {role:'opponent',seat:0,observation:{actorSeat:0,ownPublic:{active:own,bench:ownBench,discard:[],stadium:[],prizeCount:prizes,publicTurnRestrictions:{gxUsed}},opponentPublic:{active:target,bench,stadium,prizeCount:foePrizes,publicTurnRestrictions:{}}},actionFrontier:{items}};
}
const prefer=r=>tempo.preferRay(r.observation,r.observation.ownPublic,r.observation.opponentPublic.active);
const reply=(r,a)=>tempo.replies(r.observation,r.observation.ownPublic,r.observation.opponentPublic.active,a);
const select=r=>accel.root(r,A)?.token;
const pick=r=>mobility.attackRoot(r,{attach:true,discard:true})?.token;
test('single Double Dragon legal GX root is not lost without Ray',()=>{const r=req({own:adp([D]),items:[root(GX,'gx')]});assert.equal(select(r),'gx');assert.equal(pick(r),'gx');});
test('ordinary nonterminal both-root board keeps GX preference',()=>{const r=req();assert.equal(prefer(r),false);assert.equal(select(r),'gx');assert.equal(pick(r),'gx');});
test('Ray takes terminal KO regardless of reply',()=>{const r=req({target:mim(),prizes:1});assert.equal(prefer(r),true);assert.equal(select(r),'ray');assert.equal(pick(r),'ray');});
test('Ray removes lethal active Fairy Zone and saves ADP from visible Max Geist',()=>{const r=req({target:clef(2,50),bench:[vmax(5)],ownBench:sourceBench()});assert.equal(reply(r,GX).length,2);assert.ok(reply(r,GX).some(x=>x.attack==='Full Moon Rondo'&&x.replyRoute==='already-active'));assert.ok(reply(r,GX).some(x=>x.attack==='Max Geist'&&x.paidRetreat===1));assert.equal(reply(r,RAY).length,0);assert.equal(prefer(r),true);assert.equal(select(r),'ray');assert.equal(pick(r),'ray');});
test('surviving Clefairy allows Max Geist reply after Ray',()=>{const r=req({target:clef(2,50),bench:[vmax(5),clef(0)],ownBench:sourceBench()});assert.ok(reply(r,GX).length);assert.ok(reply(r,RAY).length);assert.equal(prefer(r),true);});
test('terminal opponent KO both ways does not assert Ray saves game',()=>{const r=req({target:clef(2,50),bench:[vmax(5),clef(0)],ownBench:sourceBench(),foePrizes:3});assert.ok(reply(r,GX).every(x=>x.terminal));assert.ok(reply(r,RAY).every(x=>x.terminal));assert.equal(prefer(r),false);});
test('one surviving Clefairy causes Copycat Ray retaliation but not GX',()=>{const r=req({target:gira(),bench:[mim(),clef(0)]});assert.equal(reply(r,GX).length,0);assert.equal(reply(r,RAY)[0].attack,'Copycat');assert.equal(reply(r,RAY)[0].damage,300);assert.equal(select(r),'gx');});
test('suppressed Fairy Zone does not double damage',()=>{const r=req({target:gira(),bench:[mim(),clef(0,0,false)]});assert.equal(reply(r,RAY).length,0);});
test('dimension valley pays Max Geist with two Psychic',()=>{const r=req({target:vmax(2),bench:[clef(3)],stadium:['Dimension Valley PHF 93']});assert.equal(reply(r,GX)[0].damage,320);});
test('no Dimension Valley means that same Max Geist is unfunded',()=>{const r=req({target:vmax(2),bench:[clef(3)]});assert.equal(reply(r,GX).length,0);});
test('Night Watch requires all three Psychic even with Valley',()=>{const r=req({target:mon('Trevenant & Dusknoir-GX SMP SM217',270,2),bench:[clef(0)],stadium:['Dimension Valley PHF 93']});assert.equal(reply(r,GX).length,0);});
test('attack lock blocks visible threat',()=>{const r=req({target:{...vmax(5),publicRestrictions:{cannotAttackNextTurn:true}},bench:[clef(0)]});assert.equal(reply(r,GX).length,0);});
test('bench Max Geist without visible free pivot is not asserted as immediate',()=>{const r=req({target:basic(),bench:[vmax(5),clef(0)]});assert.equal(reply(r,GX).length,0);});
test('live Skyliner permits Basic pivot',()=>{const r=req({target:basic(),bench:[vmax(5),clef(0),mon('Latias ex SSP 76',210,0,0,{abilitySuppressions:[{abilityName:'Skyliner',suppressed:false}]})]});assert.ok(reply(r,GX).some(x=>x.attack==='Max Geist'));});
test('Skyliner does not permit VMAX pivot',()=>{const r=req({target:vmax(0),bench:[vmax(5),clef(0),mon('Latias ex SSP 76',210,0,0,{abilitySuppressions:[{abilityName:'Skyliner',suppressed:false}]})]});assert.equal(reply(r,GX).length,0);});
test('known spent GX only permits Ray',()=>{const r=req({gxUsed:true,items:[root(RAY,'ray')]});assert.equal(select(r),'ray');assert.equal(pick(r),'ray');});
test('legal frontier lower-ranked Ray remains selectable when GX absent',()=>{const r=req({items:[root(RAY,'ray')]});assert.equal(pick(r),'ray');});
test('no legal ADP attack root abstains',()=>{const r=req({items:[]});assert.equal(select(r),undefined);assert.equal(pick(r),undefined);});
