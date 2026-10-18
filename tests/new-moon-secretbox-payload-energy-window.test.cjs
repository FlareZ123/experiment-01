'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {firstEight,firstSevenThenDraw,main}=
  require('../scripts/new-moon-secretbox-payload-energy-window.cjs');

test('exact two independent order-of-operations formulations agree for all tiers',()=>{
  for(const D of [0,1,2,4,6,10,14,16,20,24,28,32]){
    assert.deepEqual(firstEight(D),firstSevenThenDraw(D),
      'Independent initial seven and eighth-card enumeration mismatch D='+D);
  }
});

test('reduced rational fractions match independently derived values',()=>{
  const examples={
    0:['0','1'],
    1:['5270294773','507909574318055'],
    2:['8579','421962203'],
    4:['19813905634','507909574318055'],
    6:['28498040313','507909574318055'],
    10:['8719698935','101581914863611'],
    14:['7987470107','72558510616865'],
    16:['8730443224','72558510616865'],
    20:['263322170','1916639903087'],
    24:['76372274364','507909574318055'],
    28:['11596187794','72558510616865'],
    32:['889136944','5346416571769']
  };
  for(const [D,[n,d]] of Object.entries(examples)){
    const got=firstEight(Number(D));
    assert.equal(got.numerator,n,'numerator D='+D);
    assert.equal(got.denominator,d,'denominator D='+D);
  }
});

test('frozen source identity, legal starter condition and no-win scope retained',()=>{
  const report=main();
  assert.equal(report.sourceHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.deepEqual(report.rows.map(row=>row.D),[0,6,10,14,16,32]);
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.ok(report.rows.every((r,i,a)=>i===0 ||
    r.strictCoVisibility.probability>a[i-1].strictCoVisibility.probability));
  assert.throws(()=>firstEight(-1));
  assert.throws(()=>firstEight(33));
  assert.throws(()=>firstSevenThenDraw(5.2));
});
