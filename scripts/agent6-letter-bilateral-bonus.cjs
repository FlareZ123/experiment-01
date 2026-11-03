'use strict';
const assert=require('node:assert/strict');
const {choose,energyStarvedWithLetter}=
  require('./agent6-rank11-letter-opportunity.cjs');
const SOURCE={n:60,b:11,e:8,l:4,h:7,p:6};

/**
 * Exact setup coupling with an original rank11 source and opponent Basic
 * count. Source takes every optional bonus card, then one normal turn draw.
 * Bonus draws >=47 are omitted and reported as explicit tail mass.
 * @param {number} opponentBasics 1 through 60 starting Basics.
 */
function allBonusLetterOpportunity(opponentBasics){
  assert.ok(Number.isSafeInteger(opponentBasics)&&
    opponentBasics>=1&&opponentBasics<=60);
  const total=Number(choose(60,7));
  const sourceMulligan=Number(choose(49,7))/total;
  const opposingMulligan=Number(choose(60-opponentBasics,7))/total;
  const cycle=1-sourceMulligan*opposingMulligan;
  const baseline=energyStarvedWithLetter({...SOURCE,d:1}).probability;
  const p0=(1-opposingMulligan)/cycle;
  let value=p0*baseline;
  let covered=p0;
  for(let k=1;k<=46;k++){
    const weight=(1-opposingMulligan)*(1-sourceMulligan)*
      (opposingMulligan**k)/cycle;
    value+=weight*energyStarvedWithLetter({...SOURCE,d:k+1}).probability;
    covered+=weight;
  }
  const omittedTail=(1-sourceMulligan)*
    (opposingMulligan**47)/cycle;
  assert.ok(Math.abs(covered+omittedTail-1)<1e-10);
  return {opponentBasics,baselineProbability:baseline,
    allBonusProbability:value,modeledMass:covered,
    omittedKAtLeast47:omittedTail,
    offeredBonusProbability:1-p0,
    sourceMulligan,opposingMulligan,
    opponentResponsesModeled:false,competitiveQualifiedGames:0};
}

/** Equal rank weighting over the 29 independently audited original lists. */
function known29LetterOpportunities(openingAudit){
  const decks=openingAudit.decks;
  assert.equal(decks.length,29);
  assert.ok(decks.every(d=>d.unresolved_pokemon.length===0&&
    d.basic_count_known>=1&&d.basic_count_known<=60));
  const rows=decks.map(d=>({rank:d.rank,player:d.player,
    ...allBonusLetterOpportunity(d.basic_count_known)}));
  const average=rows.reduce((sum,row)=>sum+row.allBonusProbability,0)/29;
  return {known:29,totalTarget:32,missingRanks:[23,25,28],
    equalRankAverage:average,baselineProbability:rows[0].baselineProbability,
    rows,competitiveQualifiedGames:0};
}
module.exports={allBonusLetterOpportunity,known29LetterOpportunities};
