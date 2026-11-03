'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {choose,fromRepository}=
  require('../../scripts/aichi-opening-basics.cjs');
const {auditPinnedRoster}=
  require('./agent14-authenticated-mobility-roster-audit.cjs');

const VERSION='agent14-29-source-legal-opening-mobility-prize-collapse-v1';
const RESOURCE_NAMES=Object.freeze(['Guzma','Float Stone','Escape Rope']);

/**
 * Count exactly the six-Prize layouts where all copies of the three named
 * Trainer mobility families are Prized after a valid opening seven.
 *
 * Basic cards and the named Trainer copies are disjoint. The accepted hand
 * follows a uniform shuffle conditioned on containing at least one Basic;
 * the subsequent Prize set is uniform from the remaining deck. Opponent
 * bonus draw, Prize recovery, search and all other movement cards are outside
 * this necessary-resource model.
 *
 * numerator:
 *  [C(N-m,h)-C(N-m-B,h)] C(N-h-m,p-m)
 * denominator:
 *  [C(N,h)-C(N-B,h)] C(N-h,p)
 *
 * @param {number} basicCount Exact printed Basic Pokemon copies.
 * @param {number} namedMobilityCount Copies of the three names combined.
 * @param {{deckSize?:number,handSize?:number,prizeSize?:number}} [sizes]
 * @returns {object} Exact integer ratio and displayed probabilities.
 */
function namedMobilityPrizeCollapse(basicCount,namedMobilityCount,sizes={}){
  const N=sizes.deckSize??60,h=sizes.handSize??7,p=sizes.prizeSize??6;
  assert.ok([N,h,p,basicCount,namedMobilityCount].every(Number.isSafeInteger));
  assert.ok(N>0&&h>0&&p>=0&&h+p<=N);
  assert.ok(basicCount>0&&namedMobilityCount>=0&&
    basicCount+namedMobilityCount<=N);
  const validHands=choose(N,h)-choose(N-basicCount,h);
  assert.ok(validHands>0n);
  const denominator=validHands*choose(N-h,p);
  const favorable=namedMobilityCount>p?0n:
    (choose(N-namedMobilityCount,h)-
      choose(N-namedMobilityCount-basicCount,h))*
      choose(N-h-namedMobilityCount,p-namedMobilityCount);
  assert.ok(favorable>=0n&&favorable<=denominator);
  return {
    basicCount,namedMobilityCount,
    exactNumerator:favorable.toString(),
    exactDenominator:denominator.toString(),
    conditionalOnValidSeven:Number(favorable)/Number(denominator),
    unconditionalOnOpening:
      namedMobilityCount>p?0:
        Number(choose(p,namedMobilityCount))/
          Number(choose(N,namedMobilityCount)),
    model:{
      deckSize:N,openingHandSize:h,prizeSize:p,
      conditionedOnAtLeastOnePrintedBasic:true,
      opponentOptionalDrawModeled:false,
      recoveryAndSearchModeled:false,
      allSwitchAndRetreatResourcesCovered:false,
      strategicallyPlayableEscapeCertified:false,
      competitiveGameQualified:false
    }
  };
}

/**
 * Combine two already independently verified original-source surveys:
 * the exact printed-stage Basic audit and exact-name mobility counts.
 * @param {object} mobility Existing pinned original-source inventory.
 * @param {object} opening Original printed Basic-stage audit.
 * @returns {object} Field-wide necessary-resource failure model.
 */
function census(mobility,opening){
  assert.equal(mobility.originalCompleteSixties,29);
  assert.equal(opening.published,29);
  assert.equal(opening.printedPokemonValidated,102);
  assert.equal(mobility.anyCoreMobility,29);
  assert.deepEqual(mobility.missingOriginalSixties,[23,25,28]);
  const basics=new Map(opening.rows.map(r=>[r.rank,r.basicCount]));
  assert.equal(basics.size,29);
  const rows=mobility.rows.map(row=>{
    const basicCount=basics.get(row.rank);
    assert.ok(Number.isSafeInteger(basicCount),
      'Missing exact printed Basic count at rank '+row.rank);
    const counts=RESOURCE_NAMES.map(name=>
      row.printedMobilityCopies[name]);
    assert.ok(counts.every(n=>Number.isSafeInteger(n)&&n>=0));
    const namedMobilityCount=counts.reduce((a,b)=>a+b,0);
    assert.equal(namedMobilityCount,row.potentialRepositionResourceCount);
    assert.ok(namedMobilityCount>0);
    return {rank:row.rank,archetype:row.archetype,
      originalNames:Object.fromEntries(RESOURCE_NAMES.map((name,i)=>
        [name,counts[i]])),
      ...namedMobilityPrizeCollapse(basicCount,namedMobilityCount)};
  }).sort((a,b)=>a.rank-b.rank);
  assert.equal(rows.length,29);
  assert.equal(new Set(rows.map(r=>r.rank)).size,29);
  const countByCopies=Object.fromEntries(
    [...new Set(rows.map(r=>r.namedMobilityCount))].sort((a,b)=>a-b)
      .map(n=>[n,rows.filter(r=>r.namedMobilityCount===n).length]));
  const avg=rows.reduce((s,r)=>s+r.conditionalOnValidSeven,0)/29;
  const avgUnconditional=
    rows.reduce((s,r)=>s+r.unconditionalOnOpening,0)/29;
  return {
    schema:VERSION,scope:'29 authenticated original printed sixties',
    rosterGitBlob:mobility.sourceGitBlob,
    printedBasicVersion:opening.version,
    namedResourceFamilies:[...RESOURCE_NAMES],
    availableSourceCount:29,missingSourceRanks:[23,25,28],
    independentSourceLists:29,countByCopies,
    equalWeightConditionalCollapseProbability:avg,
    equalWeightUnconditionalCollapseProbability:avgUnconditional,
    rows,allEscapeOptionsPrized:false,fullPrizeRecoveryModeled:false,
    competitiveGameQualified:false
  };
}

/** @returns {object} Exact original-source authenticated 29-deck census. */
function auditPinnedSources(){
  const mobility=auditPinnedRoster();
  const basic=fromRepository(path.resolve(__dirname,'../..'));
  return census(mobility,basic);
}

if(require.main===module){
  const result=auditPinnedSources();
  process.stdout.write('AGENT14_MOBILITY_PRIZE_COLLAPSE '+
    JSON.stringify({
      29:result.availableSourceCount,
      distribution:result.countByCopies,
      equalWeightConditional:result.equalWeightConditionalCollapseProbability,
      conditionalRank7:result.rows.find(r=>r.rank===7).conditionalOnValidSeven,
      conditionalRank31:result.rows.find(r=>r.rank===31).conditionalOnValidSeven,
      qualifiedGames:0
    })+'\n');
}

module.exports={VERSION,RESOURCE_NAMES,namedMobilityPrizeCollapse,
  census,auditPinnedSources};
