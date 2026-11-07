'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {joint,field}=require('../scripts/agent3-rank26-coupled-lone-basic-root.cjs');
const {sixCandidateRank26Root}=
  require('../simulation/evaluation/agent1-rank26-six-candidate-root.cjs');

test('six fixed candidate conditional Meloetta root reuses exact source coupling',()=>{
  const x=sixCandidateRank26Root(path.resolve(__dirname,'..'));
  assert.equal(x.schema,'agent1-rank26-source-energy-root-six-fixed-candidates-v1');
  assert.equal(x.sourceRank,26);
  assert.equal(x.printedDamage,280);
  assert.equal(x.candidateCount,6);
  assert.equal(x.certifiedPaperGames,0);
  assert.equal(x.estimatedWinRates,null);
  for(const c of x.candidates){
    assert.ok(c.basics>=1);
    assert.equal(c.basicCopiesAtMost280,c.basics,
      c.name+' has verified Basic HP at or below 280');
    assert.equal(c.conditionalExactlyOneHpAtMost280,
      c.conditionalExactlyOneBasic);
    const independent=joint(c.basics,'hand-aware');
    assert.equal(c.sourceDirectRootWithExactlyOneOpposingBasic,
      independent.conditionalJointSetupAndSourceRoot);
    assert.deepEqual(c.rootComponents,independent.components);
    assert.ok(c.excludedGeometricTailUpperBound<0.000001);
    assert.ok(c.sourceDirectRootWithExactlyOneOpposingBasic>=0);
    assert.ok(c.sourceDirectRootWithExactlyOneOpposingBasic<=
      c.conditionalExactlyOneBasic);
  }
  const champion=x.candidates.find(c=>c.name==='Champion');
  const f=field().scenarios.find(r=>r.rank===1);
  assert.equal(champion.sourceDirectRootWithExactlyOneOpposingBasic,
    f.conditionalJointSetupAndSourceRoot);
  console.log('AGENT1_RANK26_SIX_CANDIDATE_SOURCE_ROOT',JSON.stringify(x));
});
