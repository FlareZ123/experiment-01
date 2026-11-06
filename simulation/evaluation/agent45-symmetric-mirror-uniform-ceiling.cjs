'use strict';

const assert=require('node:assert/strict');

const VERSION='agent45-uniform-32-equal-policy-mirror-ceiling-v1';

/**
 * Exact printing/copy identity for a complete original published 60.
 * A normalized name-only signature is insufficient for this paper-format
 * claim because printing aliases, errata and display printings matter.
 * @param {{name:string,count:number,category:string,printing:{set:string,number:string,language?:string}}[]} cards
 */
function printedSixtyKey(cards){
  assert.ok(Array.isArray(cards)&&cards.length>0);
  const merged=new Map();
  let count=0;
  for(const row of cards){
    assert.ok(typeof row.name==='string'&&row.name);
    assert.ok(Number.isSafeInteger(row.count)&&row.count>0);
    assert.ok(typeof row.printing?.set==='string'&&row.printing.set);
    assert.ok(typeof row.printing?.number==='string'&&row.printing.number);
    assert.ok(typeof row.category==='string'&&row.category);
    count+=row.count;
    const id=JSON.stringify([row.category,row.name,row.printing.set,
      row.printing.number,row.printing.language??null]);
    merged.set(id,(merged.get(id)??0)+row.count);
  }
  assert.equal(count,60,'only physically complete exact printed 60s qualify');
  return JSON.stringify([...merged].sort((a,b)=>a[0].localeCompare(b[0])));
}

/**
 * This bound applies ONLY if the fixed candidate and any exact matching
 * original are played with the same symmetric decision policy (or equal
 * optimal skill), seat and coin-flip advantage are averaged fairly, and all
 * 32 opponents have equal field weight. For a symmetric mirror,
 * P(candidate wins)<=1/2, with ties scored as no win; every other opponent
 * is optimistically assigned candidate win probability 1.
 *
 * A fixed original human policy and a stronger challenger policy, unequal
 * seating or arbitrary field weights invalidate the numerical ceiling.
 *
 * @param {object[]} candidate Exact printed candidate 60.
 * @param {{rank:number,cards:object[]}[]} knownOriginals Complete roster rows.
 * @param {number} [totalFieldRanks] Expected full benchmark size.
 */
function conditionalMirrorCeiling(candidate,knownOriginals,totalFieldRanks=32){
  assert.ok(Number.isSafeInteger(totalFieldRanks)&&totalFieldRanks>0);
  assert.ok(Array.isArray(knownOriginals)&&knownOriginals.length<=totalFieldRanks);
  const key=printedSixtyKey(candidate);
  const ranks=new Set();
  const exactMatchingRanks=[];
  for(const original of knownOriginals){
    assert.ok(Number.isSafeInteger(original.rank)&&original.rank>=1&&
      original.rank<=totalFieldRanks);
    assert.ok(!ranks.has(original.rank),'duplicate source rank');
    ranks.add(original.rank);
    if(printedSixtyKey(original.cards)===key)
      exactMatchingRanks.push(original.rank);
  }
  const matching=exactMatchingRanks.length;
  return {
    schema:VERSION,registeredFullFieldRanks:totalFieldRanks,
    knownAuthenticatedOriginalRanks:knownOriginals.length,
    originalRanksStillUnverified:totalFieldRanks-knownOriginals.length,
    exactMatchingKnownOriginalRanks:exactMatchingRanks,
    conditionalHalfWinMirrorRanks:matching,
    // Exact fraction = (2 * N - matchingKnown) / (2 * N).
    optimisticUniformFieldCeilingNumerator:2*totalFieldRanks-matching,
    optimisticUniformFieldCeilingDenominator:2*totalFieldRanks,
    optimisticUniformFieldCeilingPercent:
      100*(2*totalFieldRanks-matching)/(2*totalFieldRanks),
    oneObjectiveTarget995AchievableUnderTheseAssumptions:
      100*(2*totalFieldRanks-matching)/(2*totalFieldRanks)>=99.5,
    caveat:'Only under equal-strength symmetric mirror policy, fair randomized seating and uniform full-field weights. Missing original lists may add more exact mirrors, lowering this optimistic ceiling.',
    observedCompetitiveGames:0
  };
}

module.exports={VERSION,printedSixtyKey,conditionalMirrorCeiling};

if(require.main===module){
  const originals=require('../../results/aichi-2026/full-decklists.json').decks;
  const champion=originals.find(row=>row.rank===1);
  assert.ok(champion);
  const result=conditionalMirrorCeiling(champion.cards,originals,32);
  assert.deepEqual(result.exactMatchingKnownOriginalRanks,[1]);
  assert.equal(result.optimisticUniformFieldCeilingPercent,98.4375);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
