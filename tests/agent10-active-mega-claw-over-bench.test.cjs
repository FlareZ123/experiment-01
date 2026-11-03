'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActiveMegaClawOverBenchedMega}=require('../simulation/twinleaf/agent10-active-mega-claw-over-bench.cjs');
const {chooseMegaAbsolStagedFunding}=require('../simulation/twinleaf/agent2-rank9-mega-absol-funding.cjs');
const CLAW='Your opponent reveals their hand, and you discard a card you find there.';
const attack={name:'Claw of Darkness',damage:200,text:CLAW,cost:[7,7,9]};
const card=(printing,energies=[])=>({
  printing,energies,tools:[],
  attacks:[attack],printed:{types:[7],stage:0}
});
const catalog={
  stages:{BASIC:0},basicEnergyTypes:{Darkness:7,Fairy:8},
  colorlessEnergyType:9,
  basicEnergies:new Set(['Darkness Energy MEE']),
  specialEnergies:new Set()
};
function make(active,benched=card('Mega Absol ex M1L')){
  return {decisionKind:'owner-root',globalTurn:7,
    ownTurnResources:{retreatedTurn:-1,energyPlayedTurn:-1},
    ownHand:['Darkness Energy MEE'],
    ownPublic:{active,bench:[benched],stadium:[],prizeCount:6},
    opponentPublic:{stadium:[],prizeCount:6}};
}
test('choose Active Mega one-away Claw instead of a competing zero-Energy Bench Mega',()=>{
  const view=make(card('Mega Absol ex M1L',['Darkness Energy MEE']));
  const proposed=chooseMegaAbsolStagedFunding(view,catalog);
  assert.equal(proposed.slot,'bench');
  assert.equal(proposed.remainingFutureAttachments,2);
  const improved=chooseActiveMegaClawOverBenchedMega(view,catalog,proposed);
  assert.equal(improved.slot,'active');
  assert.equal(improved.remainingFutureAttachments,1);
  assert.equal(improved.handIndex,proposed.handIndex);
});
test('keep initial Bench funding when Active is Squawkabilly with no attached Energy',()=>{
  const view=make({printing:'Squawkabilly ex PAL',energies:[],
    attacks:[{name:'Motivate',cost:[9],damage:20}],
    printed:{types:[9],stage:0}});
  const proposed=chooseMegaAbsolStagedFunding(view,catalog);
  assert.equal(proposed.slot,'bench');
  assert.equal(chooseActiveMegaClawOverBenchedMega(view,catalog,proposed),null);
});
test('equal one-unit deficit gains should preserve Bench choice',()=>{
  const view=make(card('Mega Absol ex M1L',[]));
  const proposed=chooseMegaAbsolStagedFunding(view,catalog);
  assert.equal(proposed.slot,'bench');
  assert.equal(proposed.remainingFutureAttachments,2);
  assert.equal(chooseActiveMegaClawOverBenchedMega(view,catalog,proposed),null);
});
test('already fully funded Active Claw allows second attacker funding',()=>{
  const view=make(card('Mega Absol ex M1L',[
    'Darkness Energy MEE','Darkness Energy MEE','Darkness Energy MEE']));
  const proposed=chooseMegaAbsolStagedFunding(view,catalog);
  assert.equal(chooseActiveMegaClawOverBenchedMega(view,catalog,proposed),null);
});
test('no predicted hand/intent card identity, no priority override',()=>{
  const view=make(card('Mega Absol ex M1L',['Darkness Energy MEE']));
  const proposed=chooseMegaAbsolStagedFunding(view,catalog);
  assert.equal(chooseActiveMegaClawOverBenchedMega(view,catalog,
    {...proposed,printing:'Prism Energy ASC'}),null);
});
