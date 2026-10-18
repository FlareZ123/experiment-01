'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../scripts/new-moon-lockbreak-access.cjs');
const {discardConstrainedBox,poolCount,main,TIERS}=
  require('../scripts/new-moon-secret-box-discard-sensitivity.cjs');

/**
 * Independent first-seven-and-eighth-card enumeration. The normal draw is
 * uniformly any of the remaining 53 physical cards after conditioning on a
 * legal initial seven; random Prize assignment preserves that marginal.
 * @param {number} D
 */
function independentFirstSeven(D){
  const valid=choose(60,7)-choose(43,7);
  let total=0n;
  for(let b=1;b<=7;b++){
    for(let s=0;s<=1;s++){
      for(let d=0;d<=Math.min(D,7-b-s);d++){
        const o=7-b-s-d;
        if(o<0||o>40-D)continue;
        const hands=choose(17,b)*choose(D,d)*choose(40-D,o);
        const validDraws=s===1?
          (d>=3?51:d===2?D-d:0):
          (d>=3?1:0);
        total+=hands*BigInt(validDraws);
      }
    }
  }
  const numerator=total*437n;
  const denominator=valid*53n*442n;
  return Number(numerator)/Number(denominator);
}

test('exact two independent arrangements agree over every potential pool size',()=>{
  for(let D=0;D<=40;D++){
    const actual=discardConstrainedBox(D).probability;
    assert.ok(Math.abs(actual-independentFirstSeven(D))<2e-15,
      'Mismatch at D='+D);
  }
});

test('source-scale exact fractions and structural zeros are reproducible',()=>{
  const expected={
    0:['0','1'],2:['0','1'],
    4:['4816131','12836534386'],
    6:['640619','377545129'],
    8:['27503791','6418267193'],
    10:['53003316','6418267193'],
    12:['174253497','12836534386'],
    14:['9911643','493712861'],
    16:['176625694','6418267193'],
    20:['43489803','987425722'],
    30:['522307023','6418267193'],
    40:['2843559','29041933']
  };
  for(const [n,[numerator,denominator]] of Object.entries(expected)){
    const observed=discardConstrainedBox(Number(n));
    assert.deepEqual([observed.numerator,observed.denominator],
      [numerator,denominator]);
  }
  assert.throws(()=>discardConstrainedBox(-1));
  assert.throws(()=>discardConstrainedBox(41));
  assert.throws(()=>discardConstrainedBox(0.3));
});

test('every sensitivity tier is tied to the frozen 60 and nested copies',()=>{
  const report=main();
  assert.equal(report.candidateHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(TIERS.length,5);
  assert.deepEqual(report.rows.map(row=>row.designatedCopies),
    [0,6,10,14,16,40]);
  assert.throws(()=>poolCount(['Field Blower']));
  assert.throws(()=>poolCount(['Mewtwo & Mew-GX']));
  assert.throws(()=>poolCount(['Secret Box']));
});
