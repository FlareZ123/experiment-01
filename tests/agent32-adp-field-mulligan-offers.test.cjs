'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../simulation/evaluation/agent5-adp-thorton-prize-availability.cjs');
const {
  VERSION,normalize,numberKey,originalBasicCounts,bonusOffers,main
}=require('../simulation/evaluation/agent32-adp-field-mulligan-offers.cjs');

test('candidate 7-Basic first-seven failure is exact without an independence shortcut',()=>{
  const x=bonusOffers(7,7);
  assert.equal(x.candidateMulliganProbability.numerator,'3853577');
  assert.equal(x.candidateMulliganProbability.denominator,'9655173');
  assert.ok(Math.abs(x.candidateMulliganProbability.fraction-0.39912045076768693)<1e-14);
  assert.equal(x.candidateMulliganProbability.fraction,x.opponentMulliganProbability.fraction);
});

test('if opponent always has Basic, candidate failed seven offers exactly geometric count',()=>{
  const x=bonusOffers(7,60);
  const q=Number(choose(53,7))/Number(choose(60,7));
  assert.ok(Math.abs(x.opponentOfferedAtLeastOne.fraction-q)<1e-14);
  assert.ok(Math.abs(x.opponentExpectedOfferCount.fraction-q/(1-q))<1e-14);
  assert.ok(Math.abs(x.opponentOfferedAtLeastThree.fraction-q**3)<1e-14);
});

test('simultaneous both-invalid hands do not create an opponent bonus opportunity',()=>{
  const x=bonusOffers(7,1);
  const qA=Number(choose(53,7))/Number(choose(60,7));
  const qB=Number(choose(59,7))/Number(choose(60,7));
  const expected=qA*(1-qB)/(1-qA*qB);
  assert.ok(Math.abs(x.opponentOfferedAtLeastOne.fraction-expected)<1e-14);
  assert.ok(x.opponentOfferedAtLeastOne.fraction<qA);
  assert.ok(x.opponentExpectedOfferCount.fraction>x.opponentOfferedAtLeastOne.fraction);
});

test('probability and expected-offer formulas obey tail-sum identity',()=>{
  const x=bonusOffers(7,11);
  const q=x.candidateMulliganProbability.fraction;
  const p=x.opponentOfferedAtLeastOne.fraction;
  assert.ok(Math.abs(x.opponentExpectedOfferCount.fraction-p/(1-q))<1e-14);
  assert.ok(Math.abs(x.opponentOfferedAtLeastTwo.fraction-p*q)<1e-14);
  assert.ok(Math.abs(x.opponentOfferedAtLeastThree.fraction-p*q*q)<1e-14);
});

test('all 29 authentic printed Pokémon match exact bundled Basic subtypes',()=>{
  const roster=originalBasicCounts();
  assert.equal(roster.length,29);
  assert.deepEqual(roster.filter(x=>[23,25,28].includes(x.rank)),[]);
  assert.deepEqual(roster.map(x=>x.rank),[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,26,27,29,30,31,32]);
  for(const d of roster){
    assert.ok(Number.isSafeInteger(d.basicCopies)&&d.basicCopies>0);
    assert.equal(d.basicCopies,
      d.basicPrintings.reduce((s,p)=>s+p.count,0));
  }
  assert.equal(normalize('Tapu Lele-GX'),'tapulelegx');
  assert.equal(numberKey('SWSH217'),'217');
});

test('shared source roster computes bounded non-winning extra-card offers',()=>{
  const x=main();
  assert.equal(x.version,VERSION);
  assert.equal(x.candidateBasicCount,7);
  assert.equal(x.inputOriginalCount,29);
  assert.deepEqual(x.missingOriginalRanks,[23,25,28]);
  assert.ok(x.equalRankMeanOpponentChanceAtLeastOneOffer>0);
  assert.ok(x.equalRankMeanOpponentChanceAtLeastOneOffer<1);
  assert.ok(x.equalRankMeanOpponentExpectedOffers>
    x.equalRankMeanOpponentChanceAtLeastOneOffer);
  assert.equal(x.qualifiedGames,0);
  for(const d of x.rows){
    assert.ok(d.offers.opponentOfferedAtLeastOne.fraction>0);
    assert.ok(d.offers.opponentOfferedAtLeastOne.fraction<1);
    assert.ok(d.offers.opponentExpectedOfferCount.fraction>0);
  }
});
