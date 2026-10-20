'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {decks}=require('../results/aichi-2026/full-decklists.json');
const {minimumAttachments,attachmentFloorByPrizes}=
  require('../scripts/aichi-thorns-attachment-floor.cjs');
const source=rank=>decks.find(x=>x.rank===rank);

test('physical attachment counts preserve typed Lightning cost',()=>{
  const options=(thunderAvailable,dceAvailable,lightningUnits,colorlessUnits)=>
    ({thunderAvailable,dceAvailable,lightningUnits,colorlessUnits});
  assert.equal(minimumAttachments(options(true,true,0,0)),1);
  assert.equal(minimumAttachments(options(true,false,1,1)),2);
  assert.equal(minimumAttachments(options(false,true,1,0)),2);
  assert.equal(minimumAttachments(options(false,false,1,2)),3);
  assert.equal(minimumAttachments(options(false,false,0,3)),null);
  assert.equal(minimumAttachments(options(true,false,0,1)),null);
});

test('all three published Iron Thorns 60s share the rare no-recovery cost collapse',()=>{
  for(const rank of [6,24,29]){
    const r=attachmentFloorByPrizes(source(rank));
    assert.equal(r.unconditional.unavailable.numerator,'1');
    assert.equal(r.unconditional.unavailable.denominator,'910252');
    assert.equal(r.conditionedOnBasicValidFirstSeven.unavailable.numerator,'1395');
    assert.equal(r.conditionedOnBasicValidFirstSeven.unavailable.denominator,'1181171992');
    assert.equal(Object.values(r.conditionedOnBasicValidFirstSeven)
      .reduce((p,x)=>p+x.probability,0),1);
  }
});

test('source rank6 and 29: separate one/two/three-attachment floors',()=>{
  for(const rank of [6,29]){
    const x=attachmentFloorByPrizes(source(rank)).conditionedOnBasicValidFirstSeven;
    assert.deepEqual([x['1'].numerator,x['1'].denominator],['1726933','2142910']);
    assert.deepEqual([x['2'].numerator,x['2'].denominator],['55841776583','301198857960']);
    assert.deepEqual([x['3'].numerator,x['3'].denominator],['328241363','37649857245']);
  }
});

test('rank24 three DCEs change one-turn floor without changing five-card hard Prize collapse',()=>{
  const x=attachmentFloorByPrizes(source(24)).conditionedOnBasicValidFirstSeven;
  assert.deepEqual([x['1'].numerator,x['1'].denominator],['3671646149','4088672280']);
  assert.deepEqual([x['2'].numerator,x['2'].denominator],['1354886293','13288184910']);
  assert.deepEqual([x['3'].numerator,x['3'].denominator],['11101','340722690']);
});

test('source deck printing multiplicity mutation is rejected',()=>{
  const tampered=structuredClone(source(24));
  tampered.cards.find(c=>c.name==='Speed Lightning Energy').count--;
  assert.throws(()=>attachmentFloorByPrizes(tampered),assert.AssertionError);
});
