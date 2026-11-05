'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {TAG,selectTwoDiscardables,discardPenalty}=
  require('../simulation/twinleaf/agent45-owner-ghala-after-tagcall.cjs');

const card=fullName=>({fullName});
const originals=[
  TAG,'Thunder Mountain Prism Star LOT','Double Colorless Energy SUM',
  'Plumeria BUS','Guzma BUS'
];
const roster=[...originals,...Array.from({length:55},(_,i)=>'Filler '+i+' TEST')];

test('default paid option is blocked by two protected owner cards',()=>{
  const hand=[card('Guzma BUS'),card('Plumeria BUS')];
  assert.equal(selectTwoDiscardables(hand,roster,2).length,0);
  assert.deepEqual(selectTwoDiscardables(hand,roster,2,
    Number.POSITIVE_INFINITY).map(x=>x.fullName),
  ['Guzma BUS','Plumeria BUS']);
});

test('physical Prism Star is a high-cost choice under unbounded feasibility',()=>{
  const hand=[card('Thunder Mountain Prism Star LOT'),
    card('Plumeria BUS')];
  assert.equal(selectTwoDiscardables(hand,roster,2).length,0);
  const all=selectTwoDiscardables(hand,roster,2,
    Number.POSITIVE_INFINITY);
  assert.deepEqual(all.map(x=>x.fullName),
    ['Plumeria BUS','Thunder Mountain Prism Star LOT']);
  assert.ok(discardPenalty(all[1],roster,2)>
    discardPenalty(all[0],roster,2));
});

test('existing high-DCI native Tag Call remains first even under relaxed choice',()=>{
  const hand=[card('Guzma BUS'),card(TAG),
    card('Double Colorless Energy SUM')];
  assert.deepEqual(selectTwoDiscardables(hand,roster,2,
    Number.POSITIVE_INFINITY).map(x=>x.fullName),
    [TAG,'Guzma BUS']);
});
