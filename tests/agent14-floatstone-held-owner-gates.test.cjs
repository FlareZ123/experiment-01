'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {FIELDS,heldFloatGateFlags}=require(
  '../simulation/twinleaf/agent14-floatstone-held-owner-gates.cjs');

const dark='Darkness Energy MEE';
const catalog={
  stages:{BASIC:0},basicEnergyTypes:{Darkness:7,Psychic:5,
    Lightning:4,Fairy:8},colorlessEnergyType:9,
  basicEnergies:new Set([dark]),specialEnergies:new Set(),
  specialConditions:{ASLEEP:1,PARALYZED:2}
};

/** @returns {object} Owner-only synthetic paid-attacker fixture. */
function scenario(){
  const pokemon=energy=>({
    printing:'Mega Absol ex M1L',
    printed:{stage:0,types:[7],retreatCost:[9,9]},
    energies:Array(energy).fill(dark),tools:[],
    attacks:[{name:'Claw of Darkness',damage:200,cost:[7,7,9]}],
    specialConditions:[],publicRestrictions:{}
  });
  return {decisionKind:'owner-root',globalTurn:12,
    ownHand:['Float Stone BKT'],ownTurnResources:{
      retreatedTurn:10,toolPlayLocked:false},
    ownPublic:{active:pokemon(1),bench:[pokemon(3)],
      publicTurnRestrictions:{},stadium:[]},
    opponentPublic:{active:{tools:[]},stadium:[],bench:[]}};
}

test('positive synthetic held Float: all coarse public gates true',()=>{
  const actual=heldFloatGateFlags(scenario(),catalog);
  assert.equal(actual.held,true);
  assert.deepEqual(FIELDS.filter(key=>!actual[key]),[]);
});

test('independent co-occurrences expose empty active/bench without fake eligibility',()=>{
  const view=scenario();
  view.ownPublic.active.energies=[];
  view.ownPublic.bench=[];
  const f=heldFloatGateFlags(view,catalog);
  assert.equal(f.held,true);
  assert.equal(f.activeHasEnergy,false);
  assert.equal(f.benchOccupied,false);
  assert.equal(f.benchHasPayableAttack,false);
  assert.equal(f.benchHasPayable80DamageAttack,false);
  assert.equal(f.allCoarseStructuralGates,false);
});

test('projected below 80 remains payable yet excluded from helper threshold',()=>{
  const view=scenario();
  view.ownPublic.bench[0].attacks[0].damage=30;
  const f=heldFloatGateFlags(view,catalog);
  assert.equal(f.benchHasPayableAttack,true);
  assert.equal(f.benchHasPayable80DamageAttack,false);
  assert.equal(f.allCoarseStructuralGates,false);
});

test('retreat quota, occupied Tool, and opposing Tool Jammer reported separately',()=>{
  const view=scenario();
  view.ownTurnResources.retreatedTurn=12;
  view.ownPublic.active.tools=['Muscle Band XY'];
  view.opponentPublic.active.tools=['Tool Jammer BST'];
  const f=heldFloatGateFlags(view,catalog);
  assert.equal(f.unusedRetreat,false);
  assert.equal(f.activeToolSlotEmpty,false);
  assert.equal(f.publicToolUnsuppressed,false);
  assert.equal(f.benchHasPayable80DamageAttack,true);
  assert.equal(f.allCoarseStructuralGates,false);
});

test('nonheld owner roots have no artificial funded Bench search',()=>{
  const view=scenario();
  view.ownHand=[];
  const f=heldFloatGateFlags(view,catalog);
  assert.equal(f.held,false);
  assert.equal(f.benchHasPayableAttack,false);
  assert.equal(f.benchHasPayable80DamageAttack,false);
});

test('cannot access concealed opponent hand, deck or Prize cards',()=>{
  const view=scenario();
  const deny=new Proxy({},{get(){throw Error('hidden zone accessed');}});
  view.opponentPublic.hand=deny;
  view.opponentPublic.deck=deny;
  view.opponentPublic.prizes=deny;
  view.ownPublic.deck=deny;
  view.ownPublic.prizes=deny;
  assert.equal(heldFloatGateFlags(view,catalog).allCoarseStructuralGates,
    true);
});
