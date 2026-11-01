'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const INTENT={kind:'play-plumeria-payment-menu',
  printing:'Plumeria BUS',handIndex:1};

/** Native Supporter is first moved from hand into its resolving public zone. */
test('genuine public Plumeria owner Supporter quota is a physical root witness',()=>{
  const before={supporterSpent:0,supporterTurn:0,handCount:8};
  const after={supporterSpent:1,supporterTurn:1,handCount:7};
  assert.equal(rootPhysicalWitness(INTENT,before,after,{}),
    'confirmed-public-effect');
});

test('no accepted Supporter action cannot be promoted to physical confirmation',()=>{
  const before={supporterSpent:0,supporterTurn:0};
  const copies=[
    {supporterSpent:0,supporterTurn:1},
    {supporterSpent:1,supporterTurn:0},
    {supporterSpent:0,supporterTurn:0}
  ];
  for(const after of copies)
    assert.equal(rootPhysicalWitness(INTENT,before,after,{}),
      'no-confirmed-public-effect');
});

test('root public witness remains distinct from mandatory Plumeria payment settlement',()=>{
  const before={supporterSpent:0,supporterTurn:0};
  const after={supporterSpent:1,supporterTurn:1};
  assert.equal(rootPhysicalWitness(INTENT,before,after,{}),
    'confirmed-public-effect');
  // This receipt only proves native Supporter dispatch. It cannot confirm
  // the separate two owner-card discards, chosen target or Energy removal.
  assert.equal(Object.hasOwn(after,'physicallySettledEnergyDiscard'),false);
});
