'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {choose}=require('../simulation/evaluation/agent2-original29-fss-first-tool-collision.cjs');
const {
  SCALE,exactFssFloatFirst,analyzeSource29
}=require('../simulation/evaluation/agent2-original29-fss-first-float-opening.cjs');

test('rank3 independent category partition and generalized no-V Float event agree exactly',()=>{
  const profile={fss:1,float:1,otherTools:2,basic:11,vBasic:1};
  const rank3=exactFssFloatFirst(profile,true);
  assert.equal(rank3.validStarts,'300306336');
  assert.equal(rank3.scaledNumerator,'529011945');
  assert.ok(Math.abs(rank3.probabilityGivenValidStart-
    0.004194224693281197)<1e-14);
  const anyV=exactFssFloatFirst(profile,false);
  assert.equal(anyV.scaledNumerator,'608135220');
  assert.ok(Math.abs(anyV.probabilityGivenValidStart-
    0.0048215466223130235)<1e-14);
});

test('single known Basic and two Tools admits exact half-order source formula',()=>{
  const p={fss:1,float:1,otherTools:0,basic:1,vBasic:0};
  const actual=exactFssFloatFirst(p,true);
  assert.equal(actual.scaledNumerator,String(choose(57,4)*SCALE/2n));
  assert.equal(actual.validStarts,String(choose(60,7)-choose(59,7)));
  assert.deepEqual(exactFssFloatFirst({...p,vBasic:1},true)
    .scaledNumerator,'0');
  assert.equal(exactFssFloatFirst({...p,vBasic:1},false)
    .scaledNumerator,actual.scaledNumerator);
});

test('all 29 originals remain represented, with absent-FSS classifications explicit',()=>{
  const a=analyzeSource29();
  assert.equal(a.originalSourceCount,29);
  assert.equal(a.rows.length,29);
  assert.ok(a.fssFloatRanks.includes(3));
  assert.ok(a.fssFloatRanks.includes(11));
  assert.ok(a.highestNoOpeningV.length<=8);
  assert.equal(a.qualifiedGames,0);
  for(const row of a.rows){
    if(row.fss===0){
      assert.equal(row.firstToolEventPossible,false);
      assert.equal(row.float,null);
      assert.equal(row.noOpeningV,null);
      continue;
    }
    assert.ok(row.allValid.probabilityGivenValidStart>=0);
    assert.ok(row.noOpeningV.probabilityGivenValidStart>=0);
    assert.ok(row.noOpeningV.probabilityGivenValidStart<=
      row.allValid.probabilityGivenValidStart);
    if(row.float===0){
      assert.equal(row.firstToolEventPossible,false);
      assert.equal(row.noOpeningV.scaledNumerator,'0');
    }else assert.equal(row.firstToolEventPossible,true);
  }
  const rank3=a.rows.find(row=>row.rank===3);
  assert.equal(rank3.noOpeningV.scaledNumerator,'529011945');
  assert.equal(rank3.allValid.scaledNumerator,'608135220');
  console.log('AGENT2_ORIGINAL29_FSS_FIRST_FLOAT',JSON.stringify({
    eligibleRanks:a.fssFloatRanks,top:a.highestNoOpeningV
  }));
});
