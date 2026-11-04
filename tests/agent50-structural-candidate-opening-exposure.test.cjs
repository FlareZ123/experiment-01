'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,CANDIDATES,indexedCardById,
  structuralCandidateBenchTriggerExposure
}=require('../simulation/evaluation/agent50-structural-candidate-opening-exposure.cjs');

test('structural source printing identity includes actual Basic and Trainer cards',()=>{
  const lele=indexedCardById('sm2-60','Tapu Lele-GX');
  assert.equal(lele.supertype,'Pokémon');
  assert.ok(lele.subtypes.includes('Basic'));
  const tag=indexedCardById('sm12-206','Tag Call');
  assert.equal(tag.supertype,'Trainer');
  assert.throws(()=>indexedCardById('sm2-60','Crobat V'),
    {name:'AssertionError'});
});

test('same exact physical-hand audit applies to all four fixed structural candidates',()=>{
  const result=structuralCandidateBenchTriggerExposure();
  assert.equal(result.schema,VERSION);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.rows.length,4);
  assert.deepEqual(result.rows.map(r=>r.name),
    CANDIDATES.map(x=>x.name));
  const [apex,adp,sentinel,arven]=result.rows;
  assert.deepEqual(result.rows.map(r=>r.basics),[12,7,14,12]);
  assert.deepEqual(result.rows.map(r=>r.triggers),[1,2,0,2]);
  assert.deepEqual(apex.qualifying.map(x=>x.name),['Tapu Lele-GX']);
  assert.deepEqual(adp.qualifying.map(x=>x.name).sort(),
    ['Crobat V','Tapu Lele-GX']);
  assert.deepEqual(arven.qualifying.map(x=>x.name).sort(),
    ['Crobat V','Tapu Lele-GX']);
  assert.deepEqual(sentinel.qualifying,[]);
  assert.ok(Math.abs(apex.avoidableTriggerGivenValid-
    0.10488747110447827)<1e-12);
  assert.ok(Math.abs(adp.avoidableTriggerGivenValid-
    0.1583537788567146)<1e-12);
  assert.equal(sentinel.avoidableTriggerGivenValid,0);
  assert.ok(Math.abs(arven.avoidableTriggerGivenValid-
    0.1896386208404634)<1e-12);
  assert.ok(result.rows.every(x=>x.consumedTriggerGivenValid>=
    x.avoidableTriggerGivenValid));
  console.log('AGENT50_CANDIDATE4_SETUP_ENTRY_TRIGGER',JSON.stringify(result));
});
