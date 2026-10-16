'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {canonicalUnseenCards}=require('../simulation/twinleaf/canonical-unseen-cards.cjs');

test('canonicalization removes hidden order of indistinguishable printing copies',()=>{
  const cards=[{fullName:'P CRE',id:7},{fullName:'E SUM',id:4},
    {fullName:'P CRE',id:2},{fullName:'P CRE',id:5}];
  const before=cards.map(x=>x.id);
  const expected=[4,2,5,7];
  assert.deepEqual(canonicalUnseenCards(cards).map(x=>x.id),expected);
  assert.deepEqual(canonicalUnseenCards([...cards].reverse()).map(x=>x.id),expected);
  assert.deepEqual(cards.map(x=>x.id),before);
});

test('indistinguishable cards without numeric ids preserve name-level order only',()=>{
  const cards=[{fullName:'B'},{fullName:'A'},{fullName:'A'}];
  assert.deepEqual(canonicalUnseenCards(cards).map(x=>x.fullName),['A','A','B']);
});
