'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {replay}=require('../simulation/evaluation/agent30-rank11-source-setup-replay.cjs');
const {classifyEightCardOpportunity}=require('../simulation/evaluation/agent30-rank11-eight-card-source-opportunity.cjs');

const cases=[
  [3149897025,1,null],
  [24941728,1,'direct'],
  [340754762,1,null],
  [2307728896,1,'heldSeal'],
  [2246176619,0,null],
  [3403930699,0,null],
  [2147808079,0,null],
  [1254634394,0,null]
];

test('all eight registered first-eight source resource classes',()=>{
  let any=0;
  for(const [seed,seat,kind] of cases){
    const value=classifyEightCardOpportunity(replay(seed,seat));
    assert.equal(value.direct,kind==='direct',String(seed));
    assert.equal(value.heldSeal,kind==='heldSeal',String(seed));
    assert.equal(value.any,kind!==null,String(seed));
    any+=Number(value.any);
  }
  assert.equal(any,2);
});

test('reject impossible physical source copied prizes',()=>{
  const deal=replay(2307728896,1);
  assert.equal(classifyEightCardOpportunity(deal).heldSeal,true);
  deal.prizeSix[0]='Unknown invalid printing';
  assert.throws(()=>classifyEightCardOpportunity(deal),/copy mismatch/);
});
