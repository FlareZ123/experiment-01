'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./aichi-opening-basics.cjs');
const VERSION='agent26-rank5-wally-first-turn-four-piece-hypergeometric-v1';
const N=[4,4,4,1,3,44];
const LABELS=['Mew V','Genesect V','Double Colorless Energy',
  'Wally','Mew VMAX','Other'];
const D7=choose(60,7),PRIZE_DEN=choose(52,6);
const gcd=(a,b)=>b===0n?a:gcd(b,a%b);
const reduced=(n,d)=>{const g=gcd(n,d);
  return {numerator:(n/g).toString(),denominator:(d/g).toString(),
    probability:Number(n)/Number(d)};};

/**
 * Exact random setup from fixed original rank5: initial 7, six Prizes,
 * first ordinary turn draw, no opponent mulligan bonus. Event requires
 * Mew V among initial seven so it may be the chosen Active; Genesect V,
 * DCE and singleton Wally among those seven plus the first turn draw;
 * and at least one Mew VMAX still in the deck for Wally to search.
 * Conditional on going second, Wally may evolve the Mew first turn and
 * DCE can pay Cross Fusion Strike copying a Benched Genesect attack.
 * This is a HAND-ACCESS event, not an observed/legal-attack probability.
 *
 * @param {object} field 29 authenticated original sources.
 */
function rank5LiteralFirstTurnWallyLine(field){
  assert.equal(field.decks.length,29);
  const source=field.decks.find(x=>x.rank===5);
  assert.ok(source);
  assert.equal(source.cards.reduce((s,x)=>s+x.count,0),60);
  for(let i=0;i<5;i++){
    const card=source.cards.find(x=>x.name===LABELS[i]);
    assert.equal(card?.count,N[i]);
  }
  assert.deepEqual(source.cards.filter(x=>x.category==='Energy')
    .map(x=>[x.name,x.count]),[['Double Colorless Energy',4]]);
  let numerator=0n,unprizedNotRequiredNumerator=0n;
  let futureMewAccessNumerator=0n;
  let examinedOpeningCategories=0;
  function visit(open,index,remaining){
    if(index===N.length){
      if(remaining!==0||open[0]===0)return;
      examinedOpeningCategories++;
      const ways=open.reduce((p,v,i)=>p*choose(N[i],v),1n);
      for(let k=0;k<N.length;k++){
        const left=N[k]-open[k];
        if(left===0)continue;
        const counts=open.slice();counts[k]++;
        if(counts[1]<1||counts[2]<1)continue;
        const weight=ways*BigInt(left);
        const availableVMAX=counts[4]>0?PRIZE_DEN:
          PRIZE_DEN-choose(49,3);
        futureMewAccessNumerator+=weight*availableVMAX;
        if(counts[3]<1)continue;
        unprizedNotRequiredNumerator+=weight*PRIZE_DEN;
        const vmaxRemaining=N[4]-counts[4];
        if(vmaxRemaining===0)continue;
        const allPrized=choose(52-vmaxRemaining,6-vmaxRemaining);
        numerator+=weight*(PRIZE_DEN-allPrized);
      }
      return;
    }
    for(let n=0;n<=Math.min(remaining,N[index]);n++){
      open.push(n);visit(open,index+1,remaining-n);open.pop();
    }
  }
  visit([],0,7);
  const denominator=D7*53n*PRIZE_DEN;
  const opening=reduced(numerator,denominator);
  const withoutPrizeGate=reduced(unprizedNotRequiredNumerator,denominator);
  const noMulliganCount=D7-choose(49,7);
  return {version:VERSION,sourceRank:5,categoryLabels:LABELS,
    cardCounts:N,openedCategoriesExamined:examinedOpeningCategories,
    firstTurnDrawCount:1,initialHandCount:7,prizeCount:6,
    openingLine:opening,withoutVmaxInDeckGate:withoutPrizeGate,
    futureMewPreparationWithoutWally:reduced(
      futureMewAccessNumerator,denominator),
    sourceValidInitialHand:reduced(noMulliganCount,D7),
    conditionalOnValidInitialHand:reduced(numerator*D7,
      denominator*noMulliganCount),
    assumesPlayerGoingSecond:true,opponentMulliganBonusesExcluded:true,
    alternateAccessAndDrawEffectsExcluded:true,
    noOpponentActionsOrLocksModeled:true,
    competitiveQualifiedGames:0};
}
module.exports={VERSION,rank5LiteralFirstTurnWallyLine};
