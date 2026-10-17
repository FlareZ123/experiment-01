'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceEffectDigest,sourceEffectSnapshot} =
  require('../simulation/twinleaf/source-effect-checkpoint.cjs');

class PokemonCardList {
  constructor() {
    this.cards=[{fullName:'Regidrago V SIT'}];
    this.energies={cards:[]};
    this.tools=[];
    this.damage=0;
  }
}

function player() {
  const zone=()=>({cards:[]});
  return {
    deck:zone(),hand:zone(),discard:zone(),lostzone:zone(),
    stadium:zone(),supporter:zone(),prizes:[zone(),zone(),zone()],
    active:new PokemonCardList(),bench:[new PokemonCardList()]
  };
}

function state() {
  return {turn:4,players:[player(),player()]};
}

test('source effect checkpoint normalizes only wall clock in tracker IDs',()=>{
  const a=state(),b=state();
  a.players[0].bench[0].__uniqueId='1792203123649_kvpllne5v';
  b.players[0].bench[0].__uniqueId='1792203208269_kvpllne5v';
  assert.equal(sourceEffectDigest(a),sourceEffectDigest(b));
  assert.equal(sourceEffectSnapshot(a).schema,
    'source-selected-effect-and-primitive-fields-v3-clock-normalized');
  b.players[0].bench[0].__uniqueId='1792203208269_kvpllne5w';
  assert.notEqual(sourceEffectDigest(a),sourceEffectDigest(b));
});

test('non-statistics primitives and real damage remain significant',()=>{
  const a=state(),b=state();
  a.players[0].bench[0].gameplayLabel='1792203123649_kvpllne5v';
  b.players[0].bench[0].gameplayLabel='1792203208269_kvpllne5v';
  assert.notEqual(sourceEffectDigest(a),sourceEffectDigest(b));
  delete a.players[0].bench[0].gameplayLabel;
  delete b.players[0].bench[0].gameplayLabel;
  b.players[0].bench[0].damage=20;
  assert.notEqual(sourceEffectDigest(a),sourceEffectDigest(b));
});
