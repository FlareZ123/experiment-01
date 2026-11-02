'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,countViablePrizeSets,rank5,counts,doubleFunded,guzmaFunded}=
  require('../scripts/agent13-dual-mew-prize-availability.cjs');
test('simple binomial exactness including invalid k',()=>{
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(6,3),20n);
  assert.equal(choose(5,8),0n);
});
test('tiny complete prize subsets match exhaustive sample enumeration',()=>{
  const deck=['A','A','B','B','O','O','O'];
  let counted=0n,all=0n;
  for(let a=0;a<deck.length;a++)for(let b=a+1;b<deck.length;b++){
    all++;
    const remaining=deck.filter((_,i)=>i!==a&&i!==b);
    if(remaining.filter(x=>x==='A').length>=2&&remaining.filter(x=>x==='B').length>=1)counted++;
  }
  const exact=countViablePrizeSets(7,2,[{copies:2,needed:2},{copies:2,needed:1}]);
  assert.deepEqual(exact,{good:counted,total:all});
});
test('original printings and competing six-Prize events are exact',()=>{
  assert.equal(rank5.player,'Yamato Nakano');
  assert.deepEqual(counts,[3,4,4,4,2]);
  assert.deepEqual(doubleFunded,{good:48624495n,total:50063860n});
  assert.deepEqual(guzmaFunded,{good:48315178n,total:50063860n});
  assert.ok(doubleFunded.good>guzmaFunded.good);
});
