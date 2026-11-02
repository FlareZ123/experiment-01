'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preserveGroups,run}=require(
  '../scripts/agent9-rank5-vip-crobat-genesect-exact-partition.cjs');

test('inclusion-exclusion preserves at least one of each required physical group',()=>{
  assert.equal(preserveGroups(6,2,[1,1,1]),3n);
  assert.equal(preserveGroups(6,2,[0,1,1]),0n);
  assert.equal(preserveGroups(6,0,[1,1,1]),1n);
  assert.equal(preserveGroups(6,4,[1,1,1]),0n);
});

test('source rank5 first-seven, six-Prize and first-draw conditional exact result',()=>{
  const r=run();
  assert.equal(r.sourceRank,5);
  assert.equal(r.originalSourceCount,29);
  assert.deepEqual(r.sourcePrintings,{
    mew:4,vip:3,crobat:1,genesect:4,dedenne:1,clefairy:1,vmax:3,other:43
  });
  assert.equal(r.sampleSpace.prizeCount,6);
  assert.equal(r.sampleSpace.firstTurnDraws,1);
  assert.equal(r.sampleSpace.holdingVipByFirstTurn,true);
  assert.ok(Math.abs(r.probabilityForcedMewOnlyOpening-
    0.17669930927182764)<1e-14);
  assert.ok(Math.abs(r.probabilityJointForcedMewOpeningAndHeldVipByFirstTurn-
    0.06345539094519494)<1e-14);
  assert.deepEqual(r.conditionalGenericVipTargetCollision,{
    numerator:'202420334440923',denominator:'236098172335480',
    probability:0.8573566344821043
  });
  assert.equal(r.competitiveQualifiedGames,0);
});
