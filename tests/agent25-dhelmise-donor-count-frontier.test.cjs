'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {study,donorScenario}=require('../scripts/agent25-dhelmise-donor-count-frontier.cjs');

/** Exact BigInt enumeration is converted to Number only for reporting. */
function near(value,expected){
  assert.ok(Math.abs(value-expected)<1e-12,
    'Expected '+expected+' got '+value);
}

test('original fixed v2 exactly reproduces baseline direct access and 60 count',()=>{
  const r=study();
  assert.equal(r.scenarios.length,3);
  const s=r.scenarios[0];
  assert.equal(s.absoluteDeckCards,60);
  assert.equal(s.donors,8);
  assert.equal(s.basicCount,14);
  assert.equal(s.hypotheticalNonDonorCardsCut,0);
  near(s.cardLocationUnconditional,0.07243542827872268);
  near(s.cardLocationConditionalBasicValid,0.08408944118690072);
  near(s.wobbuffetPrizeOnlyProbability,0.9896558115974278);
  near(s.silentLabPrizeOnlyProbability,0.9896558115974278);
  assert.equal(r.candidate60Unchanged,true);
});

test('hypothetical 10 and 12 donors improve named lock survival without establishing a decklist',()=>{
  const r=study();
  const [eight,ten,twelve]=r.scenarios;
  assert.deepEqual(r.scenarios.map(s=>s.hypotheticalNonDonorCardsCut),[0,2,4]);
  assert.deepEqual(r.scenarios.map(s=>s.donors),[8,10,12]);
  assert.deepEqual(r.scenarios.map(s=>s.basicCount),[14,15,16]);
  near(ten.cardLocationUnconditional,0.0728199405374246);
  near(twelve.cardLocationUnconditional,0.0728312274076978);
  near(ten.wobbuffetPrizeOnlyProbability,0.99901425898842);
  near(twelve.wobbuffetPrizeOnlyProbability,0.9999412750035654);
  assert.ok(eight.cardLocationUnconditional<ten.cardLocationUnconditional);
  assert.ok(ten.cardLocationUnconditional<twelve.cardLocationUnconditional);
  assert.ok(eight.cardLocationConditionalBasicValid>
    ten.cardLocationConditionalBasicValid);
  assert.ok(ten.cardLocationConditionalBasicValid>
    twelve.cardLocationConditionalBasicValid);
  assert.ok(r.additionalScenariosAreAbstractNotCompleteDecklists);
  for(const s of r.scenarios){
    assert.equal(s.garbotoxinPrizeOnlyProbability,0);
    assert.equal(s.competitiveQualifiedGames,undefined);
  }
});

test('donor scenario labels are limited to the supported 2, 3, 4 copies',()=>{
  assert.throws(()=>donorScenario(1));
  assert.throws(()=>donorScenario(5));
});
