'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {directAngeOpen,survivingHits}=
  require('../scripts/mega-floette-ange-threshold.cjs');

test('Exact three singleton plus Psychic turn-one possession is rare',()=>{
  const result=directAngeOpen();
  assert.equal(result.fraction,'989527/821083950');
  assert.ok(result.probability>0.0012&&result.probability<0.0013);
});

test('Ange plus 150 HP does not add a survived 200-damage Claw hit',()=>{
  assert.equal(survivingHits(250,200),1);
  assert.equal(survivingHits(400,200),1);
  assert.equal(survivingHits(250,220),1);
  assert.equal(survivingHits(400,220),1);
  assert.equal(survivingHits(250,180),1);
  assert.equal(survivingHits(400,180),2);
  assert.equal(survivingHits(400,100),3);
  assert.throws(()=>survivingHits(0,200),RangeError);
});
