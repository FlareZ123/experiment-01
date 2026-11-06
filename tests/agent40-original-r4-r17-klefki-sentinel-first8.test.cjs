'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  choose, sourceOpener, candidateNatural,
  RANK4, RANK17, SENTINEL
} = require('../simulation/evaluation/agent40-original-r4-r17-klefki-sentinel-first8.cjs');

test('authentic original ranks4/17 each one Klefki among thirteen Basics', () => {
  for (const fixed of [RANK4,RANK17]) {
    assert.deepEqual(sourceOpener(fixed), {
      valid:323315421n,
      available:45057474n,
      forced:10737573n
    });
  }
});

test('Sentinel first-eight Fan Rotom sighting with and without held Hood', () => {
  const r=candidateNatural(SENTINEL);
  assert.deepEqual(r,{
    denominator:17632158720n,
    targetSeen:2675670888n,
    targetSeenNoHood:1823115086n
  });
  assert.ok(r.targetSeenNoHood<=r.targetSeen);
  assert.ok(r.targetSeen<=r.denominator);
});

test('small independent physical-deal enumeration checks candidate equations', () => {
  const deck=['T','B','H','X','X','X'];
  const got={denominator:0n,targetSeen:0n,targetSeenNoHood:0n};
  for(let i=0;i<deck.length;i++) {
    for(let j=i+1;j<deck.length;j++) {
      for(let draw=0;draw<deck.length;draw++) {
        if(draw===i||draw===j) continue;
        const opener=[deck[i],deck[j]];
        if(!opener.includes('T')&&!opener.includes('B')) continue;
        got.denominator+=1n;
        const natural=[...opener,deck[draw]];
        if(natural.includes('T')) {
          got.targetSeen+=1n;
          if(!natural.includes('H')) got.targetSeenNoHood+=1n;
        }
      }
    }
  }
  assert.deepEqual(got,{denominator:36n,targetSeen:24n,targetSeenNoHood:15n});
  assert.deepEqual(candidateNatural({
    cards:6,basics:2,targetBasics:1,hood:1,hand:2,draws:1
  }),got);
});

test('generalized source opener counts agree with small independent enumeration', () => {
  const toy=['K','B','B','X','X'];
  const got={valid:0n,available:0n,forced:0n};
  for(let i=0;i<toy.length;i++)for(let j=i+1;j<toy.length;j++) {
    const opener=[toy[i],toy[j]];
    const valid=opener.some(c=>c==='K'||c==='B');
    const available=opener.includes('K');
    const forced=available&&!opener.includes('B');
    if(valid)got.valid++;
    if(available)got.available++;
    if(forced)got.forced++;
  }
  assert.deepEqual(sourceOpener({
    cards:5,basics:3,keyBasic:1,hand:2
  }),got);
  assert.equal(choose(5,2),10n);
});
