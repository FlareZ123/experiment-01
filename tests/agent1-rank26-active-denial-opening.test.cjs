'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {choose,readCardIndex}=
  require('../simulation/evaluation/aichi-forced-active-opener.cjs');
const {
  DENIAL_PRINTS,deniesMeloetta,fieldDenialResources
}=require('../simulation/evaluation/agent1-rank26-active-denial-opening.cjs');

const ROOT=path.resolve(__dirname,'..');

test('deny only source-certified printed first-turn Active suppressors',()=>{
  const index=readCardIndex(ROOT);
  const mel=index.byId.get('zsv10pt5-44');
  assert.deepEqual(Object.keys(DENIAL_PRINTS).sort(),['sv1-96','sv6-77']);
  const klefki=index.byId.get('sv1-96');
  const thorns=index.byId.get('sv6-77');
  assert.equal(klefki.abilities[0].name,'Mischievous Lock');
  assert.equal(thorns.abilities[0].name,'Initialization');
  assert.equal(deniesMeloetta(klefki,mel),true);
  assert.equal(deniesMeloetta(thorns,mel),true);
  assert.equal(deniesMeloetta(index.byId.get('xy11-80'),mel),false,
    'Same named Klefki from XY has a different Ability');
  assert.equal(deniesMeloetta(index.byId.get('sm1-58'),mel),false,
    'Stage 1 Alolan Muk is not a setup eligible Basic');
  assert.equal(deniesMeloetta(index.byId.get('sv1-96'),
    index.byId.get('sv6-77')),true,
  'Lock marker is applicable to the non-Future Basic ex target');
  assert.equal(deniesMeloetta(index.byId.get('sv6-77'),
    index.byId.get('sv6-77')),false,
  'Iron Thorns Future is explicitly excluded from Initialization');
});

test('all 29 exact originals and all six fixed candidate printed sixty cards admit',()=>{
  const r=fieldDenialResources(ROOT);
  assert.equal(r.admittedOriginals,29);
  assert.equal(r.admittedCandidates,6);
  assert.deepEqual(r.originalMissingRanks,[23,25,28]);
  assert.equal(r.originals.length,29);
  assert.equal(r.candidates.length,6);
  assert.equal(r.competitiveGamesQualified,0);
  assert.equal(r.winRateEstimate,null);
  const exposed=r.originals.filter(x=>x.denialCopies);
  assert.deepEqual(exposed.map(x=>x.rank),[4,6,17,24,29]);
  for(const x of r.originals.filter(x=>[6,24,29].includes(x.rank))){
    assert.equal(x.basics,4);
    assert.equal(x.denialCopies,4);
    assert.deepEqual(x.printings.map(x=>x.id),['sv6-77']);
    assert.equal(x.availabilityToChooseDenialActive.probability,1);
  }
  for(const x of r.originals.filter(x=>[4,17].includes(x.rank))){
    assert.equal(x.denialCopies,1);
    assert.equal(x.printings[0].id,'sv1-96');
  }
  const newMoon=r.candidates.find(x=>x.name==='New Moon Lockbreaker');
  assert.equal(newMoon.basics,17);
  assert.equal(newMoon.denialCopies,1);
  assert.equal(newMoon.printings[0].id,'sv1-96');
  assert.equal(r.candidates.filter(x=>x.denialCopies).length,1);
});

test('exact conditional resource fractions agree with independent hypergeometric',()=>{
  const r=fieldDenialResources(ROOT);
  for(const entry of [...r.originals,...r.candidates]){
    assert.equal(entry.status,'exact-first-seven-resource-only');
    const {basics:B,denialCopies:L}=entry;
    const denominator=choose(60,7)-choose(60-B,7);
    const forced=BigInt(L)*choose(60-B,6);
    const available=choose(60,7)-choose(60-L,7);
    assert.equal(entry.forcedDenialActive.numerator,String(forced));
    assert.equal(entry.availabilityToChooseDenialActive.numerator,
      String(available));
    assert.equal(entry.forcedDenialActive.denominator,String(denominator));
    assert.equal(entry.availabilityToChooseDenialActive.denominator,
      String(denominator));
    assert.ok(entry.forcedDenialActive.probability>=0);
    assert.ok(entry.forcedDenialActive.probability<=
      entry.availabilityToChooseDenialActive.probability);
    assert.ok(entry.availabilityToChooseDenialActive.probability<=1);
  }
  const nm=r.candidates.find(x=>x.name==='New Moon Lockbreaker');
  assert.ok(Math.abs(nm.forcedDenialActive.probability-
    0.017222457974413595)<1e-14);
  assert.ok(Math.abs(nm.availabilityToChooseDenialActive.probability-
    0.12728718241755504)<1e-14);
  console.log('AGENT1_RANK26_ACTIVE_DENIAL_SOURCE_EXACT',JSON.stringify({
    schema:r.schema,sourceRank:r.sourceRank,
    originalResources:r.originals.filter(x=>x.denialCopies).map(x=>({
      rank:x.rank,archetype:x.archetype,B:x.basics,L:x.denialCopies,
      forced:x.forcedDenialActive.probability,
      available:x.availabilityToChooseDenialActive.probability
    })),
    candidates:r.candidates.map(x=>({name:x.name,B:x.basics,L:x.denialCopies,
      forced:x.forcedDenialActive.probability,
      available:x.availabilityToChooseDenialActive.probability})),
    competitiveGamesQualified:0
  }));
});
