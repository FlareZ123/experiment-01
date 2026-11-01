'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {joint,field}=
  require('../scripts/agent3-rank26-coupled-lone-basic-root.cjs');

test('joint setup event respects coupled both-mulligan resets',()=>{
  const rank6=joint(4);
  assert.ok(Math.abs(rank6.opponentOneBasicGivenValidSeven-
    0.8417535034135824)<1e-13);
  assert.ok(Math.abs(rank6.conditionalJointSetupAndSourceRoot-
    0.02688030536)<2e-11);
  assert.ok(rank6.excludedTailBound<5e-11);
  assert.equal(rank6.sourceFirstAssumed,true);
});

test('different opponent Basic density alters forced-lone intersection',()=>{
  const c=joint(14,'hand-aware');
  const n=joint(17,'hand-aware');
  assert.ok(Math.abs(c.conditionalJointSetupAndSourceRoot-
    0.01064360433)<2e-11);
  assert.ok(Math.abs(n.conditionalJointSetupAndSourceRoot-
    0.00773584364)<2e-11);
  assert.ok(joint(4).conditionalJointSetupAndSourceRoot>
    c.conditionalJointSetupAndSourceRoot);
  assert.ok(c.conditionalJointSetupAndSourceRoot>
    n.conditionalJointSetupAndSourceRoot);
});

test('conditional bonus policy differences cannot be mistaken for wins',()=>{
  const no=joint(14,'none');
  const all=joint(14,'all');
  const hand=joint(14,'hand-aware');
  assert.ok(no.conditionalJointSetupAndSourceRoot<
    all.conditionalJointSetupAndSourceRoot);
  assert.ok(all.conditionalJointSetupAndSourceRoot<
    hand.conditionalJointSetupAndSourceRoot);
  assert.ok(hand.components.onlySourceInitiallyInvalid>0);
});

test('full 29-authenticated-source field retains unavailable original 60s',()=>{
  const x=field();
  assert.equal(x.publishedOriginalOpponentLists,29);
  assert.deepEqual(x.missingRanks,[23,25,28]);
  assert.equal(x.scenarios.length,29);
  const champion=x.scenarios.find(v=>v.rank===1);
  const thorns=x.scenarios.find(v=>v.rank===6);
  assert.equal(champion.opposingBasics,14);
  assert.equal(thorns.opposingBasics,4);
  assert.equal(champion.sourceBonusPolicy,'hand-aware');
});
