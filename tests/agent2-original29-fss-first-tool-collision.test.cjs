'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  choose,exactOpeningCollision,analyzeOriginal29
}=require('../simulation/evaluation/agent2-original29-fss-first-tool-collision.cjs');

/** @param {number|null} actual @param {number} expected */
function near(actual,expected){
  assert.equal(typeof actual,'number');
  assert.ok(Math.abs(actual-expected)<1e-12);
}

test('basic conditioning and first-held Tool ordering are exact',()=>{
  assert.equal(choose(60,7),386206920n);
  const a=exactOpeningCollision({fss:1,otherTool:1,basic:1,vBasic:0});
  near(a.conditionalAny,15/(59*58));
  near(a.conditionalNoV,a.conditionalAny);
  const b=exactOpeningCollision({fss:1,otherTool:1,basic:1,vBasic:1});
  near(b.conditionalAny,15/(59*58));
  near(b.conditionalNoV,0);
});

test('full authenticated original field and stage-resolved tool collision',()=>{
  const result=analyzeOriginal29();
  assert.equal(result.totalAuthenticatedSourceDecks,29);
  assert.deepEqual(result.fssWithAlternativeToolRanks,
    [1,3,4,5,8,9,11,16,19,22,26,30]);
  const r11=result.rows.find(x=>x.rank===11);
  assert.deepEqual([r11.fss,r11.otherTool,r11.basic,r11.vBasic],
    [2,4,11,3]);
  near(r11.probabilities.conditionalNoV,0.021419066340755907);
  const r5=result.rows.find(x=>x.rank===5);
  assert.deepEqual([r5.basic,r5.vBasic],[11,9]);
  near(r5.probabilities.conditionalNoV,0.002085583036116827);
  near(result.equalSourceWeightConditionalNoV,0.004174603546998419);
});
