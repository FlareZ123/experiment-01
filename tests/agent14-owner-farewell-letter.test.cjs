'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerFarewellLetter}=
  require('../simulation/twinleaf/agent14-owner-farewell-letter.cjs');
const unown=()=>({printing:'Unown AOR',abilities:['Farewell Letter'],
  energies:[],tools:[],evolutionPrintings:['Unown AOR']});
const view=()=>({decisionKind:'owner-root',globalTurn:3,
  ownPublic:{active:{printing:'Unown AOR'},bench:[null,unown(),null],
    deckCount:23,stadium:[]},opponentPublic:{stadium:[]}});
test('proposes an exact bench printing and native neutral intent',()=>{
  assert.deepEqual(chooseOwnerFarewellLetter(view()),{
    kind:'use-farewell-letter',benchIndex:1,printing:'Unown AOR',
    abilityName:'Farewell Letter'});
});
test('does not try to use Active Unown or another printing',()=>{
  const v=view();v.ownPublic.bench=[null];assert.equal(chooseOwnerFarewellLetter(v),null);
  v.ownPublic.bench=[{...unown(),printing:'Unown LOT'}];
  assert.equal(chooseOwnerFarewellLetter(v),null);
});
test('does not sacrifice Unown with attached resources',()=>{
  const v=view();v.ownPublic.bench[1].energies=['Psychic Energy MEE'];
  assert.equal(chooseOwnerFarewellLetter(v),null);
  v.ownPublic.bench[1].energies=[];v.ownPublic.bench[1].tools=['Float Stone BKT'];
  assert.equal(chooseOwnerFarewellLetter(v),null);
});
test('requires a currently printed Ability and a draw cushion',()=>{
  const v=view();v.ownPublic.bench[1].abilities=[];
  assert.equal(chooseOwnerFarewellLetter(v),null);
  v.ownPublic.bench[1]=unown();v.ownPublic.deckCount=1;
  assert.equal(chooseOwnerFarewellLetter(v),null);
});
test('respects Silent Lab but not Path to the Peak',()=>{
  const v=view();v.opponentPublic.stadium=['Silent Lab PRC'];
  assert.equal(chooseOwnerFarewellLetter(v),null);
  v.opponentPublic.stadium=['Path to the Peak CRE'];
  assert.equal(chooseOwnerFarewellLetter(v)?.benchIndex,1);
});
test('declines non-owner root and never reads concealed opponent hand',()=>{
  const v=view();v.decisionKind='owner-prompt';
  assert.equal(chooseOwnerFarewellLetter(v),null);
  v.decisionKind='owner-root';
  Object.defineProperty(v,'opponentHiddenHand',{get(){throw new Error('information leak');}});
  assert.equal(chooseOwnerFarewellLetter(v)?.abilityName,'Farewell Letter');
});
test('first eligible physical bench slot, skipping unavailable candidates',()=>{
  const v=view();v.ownPublic.bench=[{...unown(),tools:['Float Stone BKT']},
    null,unown(),unown()];
  assert.equal(chooseOwnerFarewellLetter(v).benchIndex,2);
});
