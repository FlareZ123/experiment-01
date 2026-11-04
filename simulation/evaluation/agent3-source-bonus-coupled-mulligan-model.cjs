'use strict';

const assert=require('node:assert/strict');
const {mulliganDisagreement,choose,frozenRankOneNewMoonCase}=
  require('./agent3-coupled-opening-input-order.cjs');

/**
 * Independent uniformly shuffled source and two candidates sharing an ideal
 * uniform index shuffle on each candidate attempt. Every retry uses a fresh
 * independent index permutation, coupled between the candidate arms.
 * Source takes all bonus cards permitted by net excess opponent mulligans.
 * This is a purely mathematical model, NEVER an actual Twinleaf/TCG win rate.
 *
 * Let C_A,C_B,S be the number of attempts with no Basic before each deck's
 * successful setup. Then source extra card counts are max(C_A-S,0) and
 * max(C_B-S,0). Calculate whether those counts differ, integrating all
 * arbitrarily many mulligan attempts exactly via geometric series.
 *
 * @param {boolean[]} refBasicPositions 60 ordered Basic flags.
 * @param {boolean[]} otherBasicPositions 60 ordered Basic flags.
 * @param {number} sourceBasicCount At least one Basic required in source 60.
 * @returns {object}
 */
function sourceBonusDisagreement(refBasicPositions,otherBasicPositions,
  sourceBasicCount) {
  if(!Number.isSafeInteger(sourceBasicCount) ||
      sourceBasicCount<1 || sourceBasicCount>60){
    throw new TypeError('Source must have one to sixty Basic Pokémon');
  }
  const events=mulliganDisagreement(refBasicPositions,otherBasicPositions);
  if(events.referenceBasics===0||events.challengerBasics===0) {
    throw new TypeError('Each candidate must contain a valid Basic Pokémon');
  }
  const qRef=events.referenceMulligan;
  const qOther=events.challengerMulligan;
  const pBoth=events.jointMulligan;
  const pNeither=1-qRef-qOther+pBoth;
  const qSource=choose(60-sourceBasicCount,7)/choose(60,7);
  // P(C_ref != C_other and max(C_ref,C_other)>S)
  const correction=1+pNeither/(1-pBoth);
  const probability=(1-qSource)*(
    qRef/(1-qSource*qRef)+
    qOther/(1-qSource*qOther)-
    correction*pBoth/(1-qSource*pBoth)
  );
  if(!Number.isFinite(probability)||probability<-1e-10||
      probability>1+1e-10)throw new Error('Bad exact geometric probability');
  return {
    model:'agent3-ideal-coupled-mulligan-source-bonus-v1',
    sourceBasicCount,sourceMulliganProbability:qSource,
    candidateFirstMulliganDisagreement:events.disagreement,
    candidateAnyMulliganCountDisagreement:
      events.disagreement/(1-pBoth),
    sourceBonusCardCountDisagreement:Math.max(0,Math.min(1,probability)),
    sourceBonusDifferenceRequiresSourceSurvival:true,
    assumesFullOptionalBonusDraws:true,
    assumesTrueIndependentUniformPerAttemptShuffles:true,
    certifiesNativeRng:false,competitiveQualified:false
  };
}

/**
 * Reproduce original 29/32 source roster rank5 and rank6 Basic counts.
 * Rank5 has 4 Mew V, 4 Genesect V, Dedenne GX, Crobat V, Clefairy ex
 * and 3 evolved Mew VMAX. Rank6 uses only 4 Iron Thorns ex.
 */
function historicalRankFiveSixPrediction(){
  const source=require('../../results/aichi-2026/full-decklists.json');
  const rank5=source.decks.find(row=>row.rank===5);
  const rank6=source.decks.find(row=>row.rank===6);
  assert.ok(rank5&&rank6);
  const pokemon5=rank5.cards.filter(row=>row.category==='Pokémon');
  const pokemon6=rank6.cards.filter(row=>row.category==='Pokémon');
  assert.ok(pokemon5.some(row=>row.name==='Mew VMAX'&&row.count===3));
  assert.equal(pokemon6.length,1);
  assert.equal(pokemon6[0].name,'Iron Thorns ex');
  const basic5=pokemon5.filter(row=>row.name!=='Mew VMAX')
    .reduce((sum,row)=>sum+row.count,0);
  const basic6=pokemon6.reduce((sum,row)=>sum+row.count,0);
  assert.equal(basic5,11);
  assert.equal(basic6,4);
  const trial=frozenRankOneNewMoonCase();
  const ref=new Set(trial.historicalReferenceBasicPositions);
  const moon=new Set(trial.historicalChallengerBasicPositions);
  const refFlags=Array.from({length:60},(_,i)=>ref.has(i));
  const moonFlags=Array.from({length:60},(_,i)=>moon.has(i));
  return {
    sourceRank5BasicCount:basic5,
    sourceRank6BasicCount:basic6,
    rank5:sourceBonusDisagreement(refFlags,moonFlags,basic5),
    rank6:sourceBonusDisagreement(refFlags,moonFlags,basic6),
    observedSetupOnlySourceBonusDisagreement:{rank5:4,rank6:1,perRankContexts:24},
    historicalObservedDataWereNotHeldOut:true,
    note:'Predictions under ideal uniform independent shuffle streams; comparison with fixed 24+24 native historical runs is descriptive, neither model fitting nor statistical proof.'
  };
}
module.exports={sourceBonusDisagreement,historicalRankFiveSixPrediction};
