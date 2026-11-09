'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {
  preserveImmediatePerfection, chooseGengarPerfectionProtected
}=require('../../simulation/twinleaf/2026-11/agent50-gengar-perfection-resource-guard-v3.cjs');
const {TELEPATH,chooseGengarFlexibleTelepath}=
 require('../../simulation/twinleaf/2026-11/agent50-gengar-flexible-telepath-v2.cjs');
const psyche=5,gengar='Gengar & Mimikyu-GX TEU';
const donor={printing:gengar,energies:[],attacks:[
 {name:'Poltergeist',cost:[psyche,psyche],gxAttack:false},
 {name:'Horror House-GX',cost:[psyche],gxAttack:true}]};
const catalog={basicEnergyTypes:{Psychic:psyche},colorlessEnergyType:0,
 basicEnergies:new Set(['Psychic Energy MEE']),specialEnergies:new Set([TELEPATH]),
 basics:new Set(['Mewtwo & Mew-GX UNM','Latias ex SSP']),
 specialConditions:{ASLEEP:1,PARALYZED:2,CONFUSED:3,POISONED:4,BURNED:5},
 perfectionDonors:new Map([[gengar,donor.attacks]])};
function view(energies=['Psychic Energy MEE'],hand=['Psychic Energy MEE'],
 stadium=[]){
 return {
  decisionKind:'owner-root',globalTurn:20,actorSeat:0,ownHand:hand,
  ownTurnResources:{},ownPublic:{
   active:{printing:'Mewtwo & Mew-GX UNM',energies,
     abilities:['Perfection'],specialConditions:[]},
   bench:[donor],discard:[],stadium,publicTurnRestrictions:{}},
  opponentPublic:{handCount:6,active:{printing:'Mew VMAX FST',
    energies:[]},bench:[],stadium:[]}};
}
test('native root50703: preserve held second Psychic for paid active Perfection',()=>{
 const v=view(),proposed=chooseGengarFlexibleTelepath(v,catalog);
 assert.equal(proposed.kind,'attach-basic-energy');
 assert.equal(proposed.index,0);
 assert.equal(preserveImmediatePerfection(v,catalog,proposed),true);
 assert.equal(chooseGengarPerfectionProtected(v,catalog),null);
});
test('native root50705: zero-funded Active cannot afford Poltergeist after one attachment',()=>{
 const v=view([]);
 assert.equal(preserveImmediatePerfection(v,catalog,
  chooseGengarFlexibleTelepath(v,catalog)),false);
 assert.equal(chooseGengarPerfectionProtected(v,catalog).kind,'attach-basic-energy');
});
test('existing payable non-GX donor does not claim an incremental opportunity',()=>{
 const v=view(['Psychic Energy MEE','Psychic Energy MEE']);
 const proposed=chooseGengarFlexibleTelepath(v,catalog);
 assert.equal(preserveImmediatePerfection(v,catalog,proposed),false);
});
test('public Path to the Peak veto refuses a disabled Perfection priority',()=>{
 const v=view(['Psychic Energy MEE'],['Psychic Energy MEE'],['Path to the Peak CRE']);
 assert.equal(preserveImmediatePerfection(v,catalog,
  chooseGengarFlexibleTelepath(v,catalog)),false);
});
test('v3 considers Telepath as hypothetical public Psychic on Active',()=>{
 const v=view(['Psychic Energy MEE'],[TELEPATH]);
 const proposed=chooseGengarFlexibleTelepath(v,catalog);
 assert.equal(proposed.kind,'attach-special-energy');
 assert.equal(preserveImmediatePerfection(v,catalog,proposed),true);
});
test('hidden opponent hand identity cannot affect the public donor veto',()=>{
 const v=view();v.opponentPublic.handCount=1;
 const proposed=chooseGengarFlexibleTelepath(v,catalog);
 assert.equal(preserveImmediatePerfection(v,catalog,proposed),true);
});
