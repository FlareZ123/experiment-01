'use strict';
const assert=require('node:assert/strict');

/**
 * Describe actual first-player/physical-seat coverage for aligned candidate
 * comparison pairs. A complete two-start census can still confound seating
 * with who acts first. This module makes no winner or performance inference.
 * @param {object[]} pairs Validated v2 paired observations.
 * @param {number[]} ranks Registered opponent ranks.
 * @returns {object}
 */
function auditFourCellCoverage(pairs,ranks){
  assert.ok(Array.isArray(pairs)&&Array.isArray(ranks));
  assert.equal(new Set(ranks).size,ranks.length,'Duplicate source ranks');
  const byRank={};
  for(const rank of ranks){
    assert.ok(Number.isInteger(rank)&&rank>=1&&rank<=32);
    const counts={};
    for(const seat of [0,1])for(const first of ['candidate','source'])
      counts[`seat${seat}-${first}-first`]=0;
    let unalignedPairs=0;
    for(const pair of pairs.filter(p=>p.rank===rank)){
      if(!pair.firstObservationComparable){unalignedPairs++;continue;}
      assert.ok([0,1].includes(pair.candidateSeat));
      assert.ok(['candidate','source'].includes(pair.actualStarter));
      counts[`seat${pair.candidateSeat}-${pair.actualStarter}-first`]++;
    }
    const twoRealStarts=['candidate','source'].every(first=>
      [0,1].some(seat=>counts[`seat${seat}-${first}-first`]>0));
    const fourCellCovered=Object.values(counts).every(n=>n>0);
    const seatFirstConfounded=twoRealStarts&&!fourCellCovered&&
      [0,1].every(seat=>['candidate','source'].filter(first=>
        counts[`seat${seat}-${first}-first`]>0).length<=1);
    byRank[rank]={counts,unalignedPairs,twoRealStarts,fourCellCovered,
      seatFirstConfounded};
  }
  assert.ok(pairs.every(pair=>Object.hasOwn(byRank,pair.rank)),'Unregistered source rank');
  return {schema:'aichi-bilateral-four-cell-coverage-v1',byRank,
    allRanksFourCellCovered:ranks.every(rank=>byRank[rank].fourCellCovered),
    allRanksTwoRealStarts:ranks.every(rank=>byRank[rank].twoRealStarts),
    confoundedRanks:ranks.filter(rank=>byRank[rank].seatFirstConfounded),
    competitiveGameCertified:false};
}
module.exports={auditFourCellCoverage};
