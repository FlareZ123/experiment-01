'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  choose,basicOpeningDistribution,directColorlessAttackerReady,
  directVoltorbAttachment,directFreeFrontliner,main
}=require('../scripts/agent2-firstturn-opening-frontier.cjs');

/** @param {number} actual @param {number} expected @param {number} epsilon */
function close(actual,expected,epsilon=1e-7){
  assert.ok(Math.abs(actual-expected)<=epsilon,
    'Expected '+actual+' approximately '+expected);
}
test('safe exact n choose seven and invalid combinations',()=>{
  assert.equal(choose(60,7),386206920);
  assert.equal(choose(60,61),0);
  assert.equal(choose(0,0),1);
  assert.equal(choose(8,3),56);
});
test('physical first-seven Basics conditional on no mulligan',()=>{
  const four=basicOpeningDistribution(4);
  close(four.pValid,0.3994996);
  close(four.pAtLeastTwoGivenValid,0.1582465);
  close(four.pExactlyOneGivenValid,0.8417535);
  const sixteen=basicOpeningDistribution(16);
  close(sixteen.pAtLeastTwoGivenValid,0.6753399);
});
test('direct first-turn setup with C Energy vs free Energy requirement',()=>{
  const withEightEnergy=directColorlessAttackerReady(4,8,8);
  close(withEightEnergy,0.3302029);
  close(directFreeFrontliner(4,8),0.4936035007);
  assert.ok(directColorlessAttackerReady(4,8,12)>withEightEnergy);
  assert.equal(directColorlessAttackerReady(4,8,0),0);
});
test('Hisuian Voltorb can search one or two Basic Energy for real benches',()=>{
  close(directVoltorbAttachment(4,8,8,1),0.3302028);
  close(directVoltorbAttachment(4,8,8,2),0.1215130);
  close(directVoltorbAttachment(4,8,2,1),0.3160827);
  assert.equal(directVoltorbAttachment(4,8,0,1),0);
  assert.ok(directVoltorbAttachment(4,8,8,2)<
    directVoltorbAttachment(4,8,8,1));
});
test('reuses authoritative Stage census instead of a duplicate promo resolver',()=>{
  const existing=require('../scripts/aichi-opening-basics.cjs')
    .fromRepository(require('node:path').resolve(__dirname,'..'));
  const ours=main(false);
  assert.equal(existing.published,29);
  assert.ok(existing.printedPokemonValidated>0);
  assert.deepEqual(ours.originalRankOpeningRows.map(r=>({
    rank:r.rank,basicCount:r.basicPokemonCount})),
    existing.rows.map(r=>({rank:r.rank,basicCount:r.basicCount})));
});
test('29 original registered Aichi 60s map uniquely to actual Basic card printing',()=>{
  const result=main(false);
  assert.equal(result.exactPublishedOriginalSixties,29);
  assert.deepEqual(result.missingOriginalRankSixties,[23,25,28]);
  assert.equal(result.originalRankOpeningRows.length,29);
  for(const d of result.originalRankOpeningRows){
    assert.ok(d.basicPokemonCount>=1);
    assert.equal(d.pValid>0,true);
    assert.equal(d.pAtLeastTwoGivenValid>=0,true);
    assert.ok(d.pAtLeastTwoGivenValid<=1);
    assert.equal(d.basicPokemonCount+d.stageOrVMAXCount,d.pokemonCount);
  }
  for(const rank of [6,24,29]){
    const d=result.originalRankOpeningRows.find(x=>x.rank===rank);
    assert.equal(d.basicPokemonCount,4);
    close(d.pAtLeastTwoGivenValid,0.1582465);
  }
  assert.equal(result.competitiveQualified,false);
  assert.equal(result.simulationWins,0);
});
