'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,bilateral,main
}=require('../simulation/evaluation/agent32-adp-vs-champion-mulligan-delta.cjs');
const {bonusOffers,originalBasicCounts}=
  require('../simulation/evaluation/agent32-adp-field-mulligan-offers.cjs');

/** @param {number} a @param {number} b */
function close(a,b){
  assert.ok(Math.abs(a-b)<1e-12,a+' != '+b);
}

test('candidate printed-60 and rank1 baseline both have real source Basic counts',()=>{
  const x=main();
  assert.equal(x.version,VERSION);
  assert.equal(x.adpBasicCount,7);
  assert.equal(x.championBasicCount,14);
  assert.equal(x.comparedOriginalCount,29);
  assert.deepEqual(x.omittedOriginalRanks,[23,25,28]);
  assert.equal(originalBasicCounts().find(r=>r.rank===1).basicCopies,14);
  assert.equal(x.qualifiedGames,0);
});

test('bilateral offer count symmetry under exchanged candidate/source roles',()=>{
  for(const a of [4,7,10,14,16]){
    for(const b of [4,7,10,14,16]){
      const ab=bilateral(a,b),ba=bilateral(b,a);
      close(ab.sourceExpectedOffers.fraction,ba.candidateExpectedOffers.fraction);
      close(ab.candidateExpectedOffers.fraction,ba.sourceExpectedOffers.fraction);
      close(ab.sourceAtLeastOneOffer.fraction,ba.candidateAtLeastOneOffer.fraction);
      close(ab.sourceNetExpectedOfferAdvantage,
        -ba.sourceNetExpectedOfferAdvantage);
    }
    close(bilateral(a,a).sourceNetExpectedOfferAdvantage,0);
  }
});

test('independent source-side directional helper matches production formula',()=>{
  for(const count of [4,10,11,12,13,14,15,16]){
    const x=bilateral(7,count);
    close(x.sourceExpectedOffers.fraction,
      bonusOffers(7,count).opponentExpectedOfferCount.fraction);
    close(x.candidateExpectedOffers.fraction,
      bonusOffers(count,7).opponentExpectedOfferCount.fraction);
  }
});

test('exact equal-29 opponent offer means separate source and candidate benefits',()=>{
  const x=main().equalRankComparison;
  close(x.adpExpectedSourceOffers,0.5686149720464142);
  close(x.referenceExpectedSourceOffers,0.1306613789434515);
  close(x.extraExpectedSourceOffersUnderADP,0.4379535931029627);
  close(x.adpExpectedCandidateOffers,0.23863274478001223);
  close(x.referenceExpectedCandidateOffers,0.30401790240400356);
  close(x.adpNetSourceOfferAdvantage,0.32998222726640203);
  close(x.referenceNetSourceOfferAdvantage,-0.17335652346055203);
  close(x.adpMinusReferenceNetSourceOfferAdvantage,0.503338750726954);
});

test('same original rank6 and champion rank1 have expected directional contrast',()=>{
  const x=main(),r6=x.rows.find(r=>r.rank===6),r1=x.rows.find(r=>r.rank===1);
  assert.equal(r6.originalBasicCopies,4);
  close(r6.adp.sourceExpectedOffers.fraction,0.3490052334976388);
  close(r6.reference.sourceExpectedOffers.fraction,0.07010959980469617);
  close(r6.adp.candidateExpectedOffers.fraction,1.187909438967942);
  close(r6.reference.candidateExpectedOffers.fraction,1.4123525560019536);
  assert.equal(r1.originalBasicCopies,14);
  close(r1.adp.sourceExpectedOffers.fraction,0.6056738414317842);
  close(r1.reference.sourceExpectedOffers.fraction,0.14130477493045135);
  close(r1.adp.candidateExpectedOffers.fraction,0.10233509070483007);
  close(r1.reference.candidateExpectedOffers.fraction,0.14130477493045135);
});

test('every original matchup provides more source offers under ADP',()=>{
  const x=main();
  for(const row of x.rows){
    assert.ok(row.adpMinusReferenceExpectedOffersToSource>0);
    assert.ok(row.adpMinusReferenceNetSourceOffers>0);
  }
});
