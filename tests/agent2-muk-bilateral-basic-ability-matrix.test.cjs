'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {bilateralMukAbilityMatrix}=
  require('../scripts/agent2-muk-bilateral-basic-ability-matrix.cjs');
const root=path.resolve(__dirname,'..');

test('original rank26 exposes 11 of its 12 Basic copies to opposing Muk',()=>{
 const x=bilateralMukAbilityMatrix(root);
 assert.equal(x.sourceRank26.basics,12);
 assert.equal(x.sourceRank26.basicAbilityCopiesSilencedByOpposingMuk,11);
 assert.equal(x.sourceRank26.abilityNames.length,7);
 assert.equal(x.sourceRank26.abilityNames.find(x=>x.name==='Unown').copies,4);
 assert.equal(x.independentGameResults,0);
});

test('both unchanged candidate 60s expose only three Basic Ability copies',()=>{
 const x=bilateralMukAbilityMatrix(root);
 for(const key of ['v0','v1']){
  const candidate=x.candidate[key];
  assert.equal(candidate.basics,12);
  assert.equal(candidate.basicAbilityCopiesSilencedByOwnMuk,3);
  assert.equal(candidate.basicAbilitiesSilenced.length,3);
  assert.deepEqual(candidate.basicAbilitiesSilenced.map(x=>x.name),
    ['Kyurem','Tapu Lele-GX','Latias ex']);
  assert.deepEqual(candidate.basicAbilitiesSilenced.map(x=>x.abilities[0]),
    ['Plasma Bane','Wonder Tag','Skyliner']);
  assert.equal(candidate.nonBasicAbilityCopiesNotCoveredByMuk,6);
  assert.deepEqual(candidate.nonBasicAbilitiesNotCovered.map(x=>x.name),
    ['Regidrago VSTAR','Alolan Muk','Hisuian Goodra VSTAR']);
 }
 assert.equal(x.sourceRank26MinusOwnBasicAbilityCopies,8);
});
