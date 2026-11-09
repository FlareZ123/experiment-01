'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {TELEPATH,hasPsychic,chooseGengarFlexibleTelepath}=require('../../simulation/twinleaf/2026-11/agent50-gengar-flexible-telepath-v2.cjs');
const catalog={basicEnergyTypes:{Psychic:5},colorlessEnergyType:0,
 basicEnergies:new Set(['Psychic Energy MEE']),
 specialEnergies:new Set([TELEPATH]),
 basics:new Set(['Duskull VIV','Latias ex SSP','Tapu Lele-GX GRI']),
 specialConditions:{ASLEEP:1,PARALYZED:2}};
const gengar=energies=>({printing:'Gengar & Mimikyu-GX TEU',energies,
 attacks:[{name:'Horror House-GX',gxAttack:true,cost:[5]}]});
function view(options={}){
 const {active={printing:'Duskull VIV',energies:[]},
 bench=[gengar([]),{printing:'Latias ex SSP',abilities:['Skyliner'],energies:[]}],
 hand=[TELEPATH],stadium=[],resources={},opponentCount=6,globalTurn=8}=options;
 return {decisionKind:'owner-root',globalTurn,actorSeat:0,ownHand:hand,
 ownTurnResources:resources,ownPublic:{active,bench,stadium,publicTurnRestrictions:{}},
 opponentPublic:{handCount:opponentCount,active:{energies:[]}}};
}
test('owner Telepath funds Gengar despite Duskull Active',()=>{
 const action=chooseGengarFlexibleTelepath(view(),catalog);
 assert.deepEqual([action.kind,action.slot,action.index,action.handIndex,action.printing],
 ['attach-special-energy','bench',0,0,TELEPATH]);
});
test('Basic Psychic preferred to Telepath with real hand indices',()=>{
 const action=chooseGengarFlexibleTelepath(view({hand:[TELEPATH,'Psychic Energy MEE']}),catalog);
 assert.equal(action.kind,'attach-basic-energy');assert.equal(action.handIndex,1);
});
test('Temple disables Psychic provision by Telepath',()=>{
 const v=view({stadium:['Temple of Sinnoh ASR']});
 assert.equal(chooseGengarFlexibleTelepath(v,catalog),null);
 assert.equal(hasPsychic([TELEPATH],v,catalog),false);
 assert.equal(hasPsychic(['Psychic Energy MEE'],v,catalog),true);
});
test('Latias enables promoted funded Gengar from an arbitrary Basic',()=>{
 const action=chooseGengarFlexibleTelepath(view({bench:[gengar([TELEPATH]),
 {printing:'Latias ex SSP',abilities:['Skyliner'],energies:[]}]}),catalog);
 assert.equal(action.kind,'paid-retreat');assert.equal(action.benchIndex,0);
});
test('evolved Active cannot use Basic-only Skyliner',()=>{
 const action=chooseGengarFlexibleTelepath(view({
 active:{printing:'Trevenant & Dusknoir-GX SMP',energies:[]},
 bench:[gengar([TELEPATH]),{printing:'Latias ex SSP',abilities:['Skyliner'],energies:[]}]
 }),catalog);assert.equal(action,null);
});
test('active Gengar pays Horror House through Telepath, respecting threshold',()=>{
 const active=gengar([TELEPATH]);
 assert.equal(chooseGengarFlexibleTelepath(view({active,bench:[],hand:[]}),catalog).attackName,'Horror House-GX');
 assert.equal(chooseGengarFlexibleTelepath(view({active,bench:[],hand:[],opponentCount:5}),catalog),null);
});
test('energy quota and Special Energy lock veto funding',()=>{
 assert.equal(chooseGengarFlexibleTelepath(view({resources:{energyPlayedTurn:8}}),catalog),null);
 assert.equal(chooseGengarFlexibleTelepath(view({resources:{specialEnergyPlayLocked:true}}),catalog),null);
});
test('unknown special Energy cannot substitute for printed Telepath',()=>{
 const badCatalog={...catalog,specialEnergies:new Set()};
 assert.equal(chooseGengarFlexibleTelepath(view(),badCatalog),null);
 assert.equal(chooseGengarFlexibleTelepath(view({hand:['Other Energy M3']}),catalog),null);
});
