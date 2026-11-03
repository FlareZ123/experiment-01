'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
const V='Shadow Rider Calyrex VMAX CRE';
const outcome=(before,after,intent={kind:'retreat-emergency-floatstone',
  printing:V})=>rootPhysicalWitness(intent,before,after,{});
const base=()=>({
  activePokemonPrinting:V,targetPokemonPrinting:V,
  activePokemonPhysicalId:101,targetPokemonPhysicalId:202,
  turn:31,retreatedTurn:0
});
const swapped=()=>({
  activePokemonPrinting:V,targetPokemonPrinting:V,
  activePokemonPhysicalId:202,targetPokemonPhysicalId:101,
  retreatedTurn:31
});
test('distinct physical instances prove same-printing switch',()=>{
  assert.equal(outcome(base(),swapped()),'confirmed-public-effect');
});
test('missing physical IDs cannot certify same-printing switch',()=>{
  const before=base();delete before.targetPokemonPhysicalId;
  assert.equal(outcome(before,swapped()),'no-confirmed-public-effect');
});
test('unchanged positions and duplicate IDs are rejected',()=>{
  const after=swapped();
  after.activePokemonPhysicalId=101;
  assert.equal(outcome(base(),after),'no-confirmed-public-effect');
  const before=base();before.targetPokemonPhysicalId=101;
  assert.equal(outcome(before,swapped()),'no-confirmed-public-effect');
});
test('retreat must be used during the real observed turn',()=>{
  const after=swapped();after.retreatedTurn=29;
  assert.equal(outcome(base(),after),'no-confirmed-public-effect');
});
test('legacy different-printing witness remains supported',()=>{
  const before=base(),after=swapped();
  before.activePokemonPrinting='Garbodor BKP';
  after.targetPokemonPrinting='Garbodor BKP';
  assert.equal(outcome(before,after),'confirmed-public-effect');
});
