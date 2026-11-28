'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ENERGY,runMobilityCounterline:line,energySwapDeck:swap}=
  require('../../simulation/evaluation/2026-11/agent25-mobility-energy-frontier.cjs');
const P=ENERGY;
const scene=()=>({
  activePsychic:true, activeRetreatCost:2, retreatAlreadyUsed:false,
  retreatBlocked:false,activeAsleepOrParalyzed:false,
  handAttachmentAlreadyUsed:false,specialEnergyPlayLocked:false,
  specialEnergyEffectsSuppressed:false,hasBenchedAttacker:true,
  psychicTotalBefore:5,benchedPsychic:5,benchedColorless:0,
  targetRemainingHP:140
});
const result=(mods,energy)=>line({...scene(),...mods},energy);
for(const e of [P.MYSTERY,P.JET,P.WARP]) {
  test(e+' bypasses Item and Supporter double-lock with stranded Psychic V',()=>{
    const r=result({},e);
    assert.equal(r.attachmentLegal,true);
    assert.equal(r.canPromoteAttacker,true);
    assert.equal(r.potentialKnockout,true);
    assert.equal(r.maxGeistDamage,e===P.MYSTERY?190:160);
  });
}
test('Basic Psychic fails to escape from 2C with no preexisting Active Energy',()=>{
  const r=result({},P.BASIC);
  assert.equal(r.attachmentLegal,true);
  assert.equal(r.canPromoteAttacker,false);
  assert.equal(r.maxGeistDamage,null);
});
for(const field of ['retreatAlreadyUsed','retreatBlocked','activeAsleepOrParalyzed']) {
  test('Mystery requires ordinary retreat, Jet and Warp forcibly switch: '+field,()=>{
    assert.equal(result({[field]:true},P.MYSTERY).canPromoteAttacker,false);
    assert.equal(result({[field]:true},P.JET).canPromoteAttacker,true);
    assert.equal(result({[field]:true},P.WARP).canPromoteAttacker,true);
  });
}
test('Mystery allows 190 threshold with five old Psychic; Jet/Warp only 160',()=>{
  for(const e of [P.BASIC,P.JET,P.WARP])
    assert.equal(result({targetRemainingHP:190},e).potentialKnockout,false);
  assert.equal(result({targetRemainingHP:190},P.MYSTERY).potentialKnockout,true);
});
test('Jet supplies third [C] on 2-Psychic VMAX; actual Max Geist costs [C,C,C]',()=>{
  for(const e of [P.MYSTERY,P.WARP])
    assert.equal(result({benchedPsychic:2,psychicTotalBefore:2},e).canPayMaxGeist,false);
  const jet=result({benchedPsychic:2,psychicTotalBefore:2},P.JET);
  assert.equal(jet.canPromoteAttacker,true);
  assert.equal(jet.canPayMaxGeist,true);
  assert.equal(jet.maxGeistDamage,70);
});
test('Max Geist printed [C,C,C] can be paid by three non-Psychic Energies',()=>{
  const r=result({benchedPsychic:0,benchedColorless:3,psychicTotalBefore:5},P.MYSTERY);
  assert.equal(r.canPayMaxGeist,true);
  assert.equal(r.maxGeistDamage,190);
});
test('Mystery cannot attach to a non-Psychic Active; Jet/Warp can switch',()=>{
  assert.equal(result({activePsychic:false},P.MYSTERY).attachmentLegal,false);
  assert.equal(result({activePsychic:false},P.JET).canPromoteAttacker,true);
  assert.equal(result({activePsychic:false},P.WARP).canPromoteAttacker,true);
});
test('Temple of Sinnoh suppresses all three special effects, not Basic',()=>{
  for(const e of [P.MYSTERY,P.JET,P.WARP]){
    const r=result({specialEnergyEffectsSuppressed:true},e);
    assert.equal(r.effectLive,false);
    assert.equal(r.canPromoteAttacker,false);
  }
  assert.equal(result({specialEnergyEffectsSuppressed:true},P.BASIC).attachmentLegal,true);
});
test('opposing Shadow Mist Special Energy play lock disables all three',()=>{
  for(const e of [P.MYSTERY,P.JET,P.WARP])
    assert.equal(result({specialEnergyPlayLocked:true},e).attachmentLegal,false);
  assert.equal(result({specialEnergyPlayLocked:true},P.BASIC).attachmentLegal,true);
});
test('ordinary attachment already used closes all four energy routes',()=>{
  for(const e of Object.values(P))
    assert.equal(result({handAttachmentAlreadyUsed:true},e).attachmentLegal,false);
});
test('no Bench recipient means no special mobility line',()=>{
  for(const e of Object.values(P))
    assert.equal(result({hasBenchedAttacker:false},e).canPromoteAttacker,false);
});
test('malformed or unknown visibility fails closed',()=>{
  assert.throws(()=>line({activePsychic:true},P.MYSTERY),/UNKNOWN_PUBLIC_CONSTRAINT/);
  assert.throws(()=>line(scene(),'imaginary 5th Energy'),/UNKNOWN_ENERGY_PRINTING/);
  assert.throws(()=>line({...scene(),benchedPsychic:null},P.MYSTERY),/UNKNOWN_PUBLIC_COUNT/);
});
test('exact unchanged Hood sixty can be varied 1-for-1 without making a new archetype',()=>{
  const source=require('../../results/aichi-2026/candidate-hood-shadow-rider.json').cards;
  for(const e of [P.MYSTERY,P.JET,P.WARP]){
    const altered=swap(source,e);
    assert.equal(altered.reduce((n,x)=>n+x.count,0),60);
    assert.equal(altered.find(x=>x.name==='Psychic Energy').count,10);
    assert.equal(altered.at(-1).count,1);
  }
  assert.equal(source.find(row=>row.name==='Psychic Energy'&&row.printing.set==='MEE').count,11,
    'source original must remain unchanged');
});
