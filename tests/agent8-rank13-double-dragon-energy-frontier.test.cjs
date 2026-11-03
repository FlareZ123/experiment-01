'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseRank13DoubleDragonRoot,ENERGY}=
  require('../simulation/twinleaf/agent8-rank13-double-dragon-energy-frontier.cjs');

function view(overrides={}){
 return {decisionKind:'owner-root',globalTurn:8,
   ownHand:[ENERGY],
   ownTurnResources:{energyPlayedTurn:6,energyPlayLocked:false,
     specialEnergyPlayLocked:false},
   ownPublic:{active:{printing:'Tapu Lele-GX GRI',energies:[]},
     bench:[{printing:'Regidrago VSTAR SIT',energies:[]},null],
     stadium:[]},opponentPublic:{stadium:[]},...overrides};
}
test('targets evolved Benched Regidrago over unrelated Active',()=>{
 const p=chooseRank13DoubleDragonRoot(view());
 assert.equal(p.kind,'attach-special-energy');
 assert.equal(p.slot,'bench');
 assert.equal(p.index,0);
 assert.equal(p.receiver,'Regidrago VSTAR SIT');
});
test('concentrates a second DDE on an already charged physical Regidrago',()=>{
 const own=view().ownPublic;
 const r=chooseRank13DoubleDragonRoot(view({ownPublic:{
   ...own,active:{printing:'Regidrago VSTAR SIT',energies:[]},
   bench:[{printing:'Regidrago V SIT',energies:[ENERGY]}]}}));
 assert.equal(r.slot,'bench');assert.equal(r.previousDdeCount,1);
});
test('refuses Temple and spent attachment and energy locks',()=>{
 assert.equal(chooseRank13DoubleDragonRoot(view({
   opponentPublic:{stadium:['Temple of Sinnoh ASR']}})),null);
 assert.equal(chooseRank13DoubleDragonRoot(view({
   ownTurnResources:{energyPlayedTurn:8,
     energyPlayLocked:false,specialEnergyPlayLocked:false}})),null);
 assert.equal(chooseRank13DoubleDragonRoot(view({
   ownTurnResources:{energyPlayedTurn:6,
     energyPlayLocked:true,specialEnergyPlayLocked:false}})),null);
 assert.equal(chooseRank13DoubleDragonRoot(view({
   ownTurnResources:{energyPlayedTurn:6,
     energyPlayLocked:false,specialEnergyPlayLocked:true}})),null);
});
test('does not attach third DDE to same Pokémon and will not target non-Dragon',()=>{
 const own=view().ownPublic;
 assert.equal(chooseRank13DoubleDragonRoot(view({ownPublic:{
   ...own,bench:[{printing:'Regidrago VSTAR SIT',
     energies:[ENERGY,ENERGY]}]}})),null);
 assert.equal(chooseRank13DoubleDragonRoot(view({ownPublic:{
   ...own,bench:[{printing:'Tapu Lele-GX GRI',energies:[]}]}})),null);
});
test('requires public owner root and held exact Energy printing',()=>{
 assert.throws(()=>chooseRank13DoubleDragonRoot(view({
   decisionKind:'owner-prompt'})));
 assert.equal(chooseRank13DoubleDragonRoot(view({
   ownHand:['Grass Energy MEE']})),null);
});
