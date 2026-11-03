'use strict';

const assert=require('node:assert/strict');
const candidate=require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const {
  originalBasicCounts,bonusOffers
}=require('./agent32-adp-field-mulligan-offers.cjs');

const VERSION='agent32-adp-vs-champion-bilateral-opening-compensation-v1';
const ADP_BASIC=7;
const CHAMPION_RANK=1;
const EXPECTED_HASH='bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b';

/**
 * Both opening-side bonus opportunities from the actual two-player mulligan
 * protocol. Candidate offers opponent extras when only candidate mulligans;
 * source offers candidate extras when only source mulligans. Equal starting
 * seat and first-player order do not change seven-card legality arithmetic.
 * @param {number} candidateBasics
 * @param {number} sourceBasics
 * @returns {object}
 */
function bilateral(candidateBasics,sourceBasics){
  const toSource=bonusOffers(candidateBasics,sourceBasics);
  const toCandidate=bonusOffers(sourceBasics,candidateBasics);
  return {
    sourceAtLeastOneOffer:toSource.opponentOfferedAtLeastOne,
    sourceExpectedOffers:toSource.opponentExpectedOfferCount,
    candidateAtLeastOneOffer:toCandidate.opponentOfferedAtLeastOne,
    candidateExpectedOffers:toCandidate.opponentExpectedOfferCount,
    sourceNetExpectedOfferAdvantage:
      toSource.opponentExpectedOfferCount.fraction-
      toCandidate.opponentExpectedOfferCount.fraction,
    sourceNetAtLeastOneDifference:
      toSource.opponentOfferedAtLeastOne.fraction-
      toCandidate.opponentOfferedAtLeastOne.fraction
  };
}

/** @returns {object} Source provenance and same-29-roster symmetric comparison. */
function main(){
  assert.equal(candidate.canonicalCardsSha256,EXPECTED_HASH);
  const source=originalBasicCounts();
  assert.equal(source.length,29);
  const champion=source.find(r=>r.rank===CHAMPION_RANK);
  assert.ok(champion);
  assert.equal(champion.basicCopies,14,
    'Original rank1 benchmark Basic count changed');
  const candidateBasics=candidate.cards.reduce((n,row)=>
    n+(['sm12-156','swsh12-135','sm2-60','swsh3-104'].includes(row.id)?
      row.count:0),0);
  assert.equal(candidateBasics,ADP_BASIC);
  const rows=source.map(opponent=>{
    const adp=bilateral(candidateBasics,opponent.basicCopies);
    const reference=bilateral(champion.basicCopies,opponent.basicCopies);
    return {
      rank:opponent.rank,
      archetype:opponent.archetype,
      originalBasicCopies:opponent.basicCopies,
      adp,reference,
      adpMinusReferenceExpectedOffersToSource:
        adp.sourceExpectedOffers.fraction-
        reference.sourceExpectedOffers.fraction,
      adpMinusReferenceExpectedOffersToCandidate:
        adp.candidateExpectedOffers.fraction-
        reference.candidateExpectedOffers.fraction,
      adpMinusReferenceNetSourceOffers:
        adp.sourceNetExpectedOfferAdvantage-
        reference.sourceNetExpectedOfferAdvantage
    };
  });
  /** @param {(row:object)=>number} project */
  const mean=project=>rows.reduce((sum,row)=>sum+project(row),0)/rows.length;
  return {
    version:VERSION,
    sourceOriginals:'results/aichi-2026/full-decklists.json',
    comparedOriginalCount:rows.length,
    omittedOriginalRanks:[23,25,28],
    candidateSha:EXPECTED_HASH,
    adpBasicCount:candidateBasics,
    reference:'rank1 exact original Shadow Rider Calyrex printed 60',
    championBasicCount:champion.basicCopies,
    equalRankComparison:{
      adpExpectedSourceOffers:mean(r=>r.adp.sourceExpectedOffers.fraction),
      referenceExpectedSourceOffers:
        mean(r=>r.reference.sourceExpectedOffers.fraction),
      extraExpectedSourceOffersUnderADP:
        mean(r=>r.adpMinusReferenceExpectedOffersToSource),
      adpExpectedCandidateOffers:mean(r=>r.adp.candidateExpectedOffers.fraction),
      referenceExpectedCandidateOffers:
        mean(r=>r.reference.candidateExpectedOffers.fraction),
      adpNetSourceOfferAdvantage:
        mean(r=>r.adp.sourceNetExpectedOfferAdvantage),
      referenceNetSourceOfferAdvantage:
        mean(r=>r.reference.sourceNetExpectedOfferAdvantage),
      adpMinusReferenceNetSourceOfferAdvantage:
        mean(r=>r.adpMinusReferenceNetSourceOffers)
    },
    rows,
    qualifiedGames:0,
    caution:'Offers are optional, can be declined, may advantage either player, and are not win probabilities. Different candidates may alter opponent actual setup and gameplay. This exact pre-game comparison has no simulator or match outcomes.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,bilateral,main};
