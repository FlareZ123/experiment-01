'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./agent1-prize-failure-budget.cjs');
const {originalAndCandidateOccupancy}=
  require('./agent50-setup-bench-occupancy-tradeoff.cjs');

const VERSION='agent7-rank26-opponent-mulligan-bench-preservation-v1';

/**
 * Marginal probability that none of a designated class appears in the
 * opponent-mulligan bonus cards, conditional on a source mulligan failure
 * probability q. The source's number M of failed 7-card draws is geometric:
 * P(M=m)=(1-q)*q**m. The receiving player's bonus cards are sampled without
 * replacement from its remaining physical deck; M can exceed that deck size,
 * in which case no additional physical card exists to draw.
 *
 * The sum computes the hypergeometric class-absence probability for each
 * possible bonus count. It preserves the geometric tail when the receiving
 * deck contains zero remaining target cards.
 *
 * @param {number} remaining Other deck size after opening hand.
 * @param {number} targetCount Remaining cards that could Bench as an eligible Basic.
 * @param {number} mulliganFailure Probability that the original opposing
 * seven contain zero eligible Basics.
 * @returns {number} Exact combinatorial expectation evaluated in double precision.
 */
function noTargetInBonus(remaining,targetCount,mulliganFailure){
  assert.ok(Number.isSafeInteger(remaining)&&remaining>=0&&remaining<=60);
  assert.ok(Number.isSafeInteger(targetCount)&&
    targetCount>=0&&targetCount<=remaining);
  assert.ok(Number.isFinite(mulliganFailure)&&
    mulliganFailure>=0&&mulliganFailure<1);
  let noTarget=1;
  let opponentWeight=1-mulliganFailure;
  let total=0;
  for(let m=0;m<=remaining;m++){
    total+=opponentWeight*noTarget;
    if(m<remaining){
      noTarget*= (remaining-targetCount-m)/(remaining-m);
      // Beyond all non-target cards, no-target probability must stay zero.
      if(noTarget<0)noTarget=0;
    }
    opponentWeight*=mulliganFailure;
  }
  if(targetCount===0)
    total+=Math.pow(mulliganFailure,remaining+1);
  return Math.min(1,Math.max(0,total));
}

/**
 * Condition on an authentic Basic-valid physical opening seven. Compare:
 * GREEDY: bench all other Basics, including Ability-trigger supports;
 * STRICT: preserve hand-to-Bench trigger supports, bench only ordinary Basics;
 * ADAPTIVE: preserve those supports unless a protected trigger must be
 * Benched to avoid losing one's last Pokémon to a single source-first KO.
 *
 * Optional opposing mulligan bonus draws are included. The adaptive choice
 * can guarantee at least two initial Pokémon whenever greedy can do so,
 * but that does not prove it produces the better actual game result.
 *
 * @param {number} basics Eligible Basic copies in this candidate sixty.
 * @param {number} triggers Subset with a known in-turn Bench Ability.
 * @param {number} opposingBasics Eligible Basic copies in source opponent.
 * @param {{deckSize?:number,openingCards?:number,
 *  opponentDeckSize?:number,opponentOpeningCards?:number}} [options]
 * @returns {object}
 */
function sourceMulliganBenchTradeoff(
  basics,triggers,opposingBasics,options={}
){
  const deckSize=options.deckSize??60;
  const openingCards=options.openingCards??7;
  const sourceSize=options.opponentDeckSize??60;
  const sourceHand=options.opponentOpeningCards??7;
  assert.ok(Number.isSafeInteger(deckSize)&&deckSize>=openingCards);
  assert.ok(Number.isSafeInteger(openingCards)&&openingCards>=1&&openingCards<=7);
  assert.ok(Number.isSafeInteger(sourceSize)&&sourceSize>=sourceHand);
  assert.ok(Number.isSafeInteger(sourceHand)&&sourceHand>=1&&sourceHand<=7);
  assert.ok(Number.isSafeInteger(basics)&&basics>=1&&basics<=deckSize);
  assert.ok(Number.isSafeInteger(triggers)&&triggers>=0&&triggers<=basics);
  assert.ok(Number.isSafeInteger(opposingBasics)&&
    opposingBasics>=1&&opposingBasics<=sourceSize);
  const ordinary=basics-triggers;
  const nonBasic=deckSize-basics;
  const remaining=deckSize-openingCards;
  const valid=choose(deckSize,openingCards)-
    choose(nonBasic,openingCards);
  const denominator=Number(valid);
  const opponentBad=Number(choose(
    sourceSize-opposingBasics,sourceHand))/
    Number(choose(sourceSize,sourceHand));
  const answer={
    version:VERSION,
    candidateBasics:basics,recognizedEntryTriggers:triggers,
    sourceOpponentBasics:opposingBasics,deckSize,openingCards,
    opponentMulliganFailure:opponentBad,
    opponentExpectedMulligans:opponentBad/(1-opponentBad),
    greedyLoneAfterBonus:0,
    strictEntryPreservingLoneAfterBonus:0,
    adaptiveProtectionLoneAfterBonus:0,
    necessaryTriggerSacrificeForSecondPokemon:0,
    greedyLoneWithoutBonus:0,
    strictEntryPreservingLoneWithoutBonus:0,
    additionalLoneFromStrictProtectionWithoutBonus:0,
    additionalLoneFromStrictProtectionAfterBonus:0,
    sevenBasicValidOpeningWeight:0,
    sourceFirstAssumed:true,
    attackSuccessProbabilityModeled:false,
    exactOriginalSourceGameWon:false,
    qualifiedCompetitiveGames:0
  };
  let accounted=0n;
  for(let t=0;t<=Math.min(triggers,openingCards);t++){
    for(let r=0;r<=Math.min(ordinary,openingCards-t);r++){
      if(t+r===0)continue;
      const w=choose(triggers,t)*choose(ordinary,r)*
        choose(nonBasic,openingCards-t-r);
      if(!w)continue;
      accounted+=w;
      const frequency=Number(w)/denominator;
      if(t+r===openingCards)
        answer.sevenBasicValidOpeningWeight+=frequency;
      const nOrdinary=ordinary-r;
      const nAllBasic=basics-r-t;
      const noOrdinary=noTargetInBonus(
        remaining,nOrdinary,opponentBad);
      const noBasic=noTargetInBonus(
        remaining,nAllBasic,opponentBad);
      if(t+r===1){
        answer.greedyLoneWithoutBonus+=frequency;
        answer.greedyLoneAfterBonus+=frequency*noBasic;
      }
      if(r<=1){
        answer.strictEntryPreservingLoneWithoutBonus+=frequency;
        answer.strictEntryPreservingLoneAfterBonus+=frequency*noOrdinary;
      }
    }
  }
  assert.equal(accounted,valid);
  answer.adaptiveProtectionLoneAfterBonus=
    answer.greedyLoneAfterBonus;
  answer.necessaryTriggerSacrificeForSecondPokemon=
    answer.strictEntryPreservingLoneAfterBonus-
    answer.greedyLoneAfterBonus;
  answer.additionalLoneFromStrictProtectionAfterBonus=
    answer.necessaryTriggerSacrificeForSecondPokemon;
  answer.additionalLoneFromStrictProtectionWithoutBonus=
    answer.strictEntryPreservingLoneWithoutBonus-
    answer.greedyLoneWithoutBonus;
  assert.ok(answer.necessaryTriggerSacrificeForSecondPokemon>=-1e-12);
  assert.ok(answer.strictEntryPreservingLoneAfterBonus>=
    answer.greedyLoneAfterBonus-1e-12);
  assert.ok(answer.greedyLoneAfterBonus<=
    answer.greedyLoneWithoutBonus+1e-12);
  return answer;
}

/**
 * Use Agent50's independently source-locked Basic classification for all
 * authenticated 29 original printed source inventories and four separately
 * frozen candidate 60s. The *same rank26 original* is the opponent for every
 * matchup scenario; its mulligan process is independent of candidate opens.
 * @returns {object}
 */
function original29VsRank26OpeningTradeoff(){
  const input=originalAndCandidateOccupancy();
  const sourceRank26=input.originalRows.find(row=>row.rank===26);
  assert.equal(sourceRank26?.basics,12,
    'Original rank26 printed source must remain 12 Basic cards');
  const originalRows=input.originalRows.map(row=>({
    rank:row.rank,archetype:row.archetype,
    ...sourceMulliganBenchTradeoff(
      row.basics,row.entrySupportBasics,sourceRank26.basics)
  }));
  const candidates=input.candidateRows.map(row=>({
    candidate:row.name,...sourceMulliganBenchTradeoff(
      row.basics,row.entrySupportBasics,sourceRank26.basics)
  }));
  const keys=[
    'greedyLoneAfterBonus','strictEntryPreservingLoneAfterBonus',
    'adaptiveProtectionLoneAfterBonus',
    'necessaryTriggerSacrificeForSecondPokemon',
    'greedyLoneWithoutBonus','strictEntryPreservingLoneWithoutBonus',
    'additionalLoneFromStrictProtectionAfterBonus',
    'additionalLoneFromStrictProtectionWithoutBonus'
  ];
  const means={};
  for(const key of keys)
    means[key]=originalRows.reduce((sum,row)=>sum+row[key],0)/
      originalRows.length;
  assert.ok(Math.abs(means.additionalLoneFromStrictProtectionWithoutBonus-
    input.originalEqualRankMeans.extraSoloActiveSetupProbability)<1e-12);
  return {
    version:VERSION,
    sourceOpponentRank:26,
    sourceOpponentArchetype:sourceRank26.archetype,
    sourceOpponentPrintedBasicCount:sourceRank26.basics,
    authenticatedOriginalRows:originalRows.length,
    missingOriginalSourceRanks:[23,25,28],
    proposedCandidateRows:candidates.length,
    equalRankMeans:means,
    originalRows,candidates,
    caveat:'Optional source mulligan bonus draws only. No actual source turn policy, Energy, attack permission, KO or game outcome is modeled.',
    selectedPolicyChanged:false,
    competitiveGamesQualified:0
  };
}
/**
 * A full 29-by-29 original printed-source pairing, conditional on the
 * candidate's Basic-valid first seven and on the opponent later finishing
 * its own mulligans. The original opposing source's Basic count determines
 * the geometric bonus distribution; each paired conditional calculation
 * remains separate. Four fixed experimental candidate 60s are summarized
 * separately, preserving the "one unchanged deck against all" constraint.
 *
 * @returns {object}
 */
function authenticatedFieldMulliganBenchMatrix(){
  const input=originalAndCandidateOccupancy();
  const memo=new Map();
  const risk=(candidate,source)=>{
    const key=[
      candidate.basics,candidate.entrySupportBasics,source.basics
    ].join(':');
    if(!memo.has(key))
      memo.set(key,sourceMulliganBenchTradeoff(
        candidate.basics,candidate.entrySupportBasics,source.basics));
    return memo.get(key);
  };
  const rows=input.originalRows.flatMap(candidate=>
    input.originalRows.map(source=>({
      candidateRank:candidate.rank,
      candidateArchetype:candidate.archetype,
      sourceOpponentRank:source.rank,
      sourceOpponentArchetype:source.archetype,
      sourceOpponentBasics:source.basics,
      addedSoloStrictVsGreedy:
        risk(candidate,source).necessaryTriggerSacrificeForSecondPokemon,
      greedyLoneAfterBonus:risk(candidate,source).greedyLoneAfterBonus,
      strictLoneAfterBonus:
        risk(candidate,source).strictEntryPreservingLoneAfterBonus
    })));
  const sourceSummaries=input.originalRows.map(source=>{
    const list=rows.filter(row=>row.sourceOpponentRank===source.rank);
    return {
      rank:source.rank,archetype:source.archetype,
      sourceBasics:source.basics,
      meanAdditionalLoneAgainstOriginal29:
        list.reduce((sum,row)=>sum+row.addedSoloStrictVsGreedy,0)/
        list.length
    };
  });
  const candidateSummaries=input.candidateRows.map(candidate=>{
    const list=input.originalRows.map(source=>risk(candidate,source));
    return {
      candidate:candidate.name,basics:candidate.basics,
      triggers:candidate.entrySupportBasics,
      meanAdditionalLoneAcrossKnown29:
        list.reduce((sum,row)=>
          sum+row.necessaryTriggerSacrificeForSecondPokemon,0)/
          list.length,
      againstRank26:list[input.originalRows.findIndex(x=>x.rank===26)]
        .necessaryTriggerSacrificeForSecondPokemon,
      againstRank6:list[input.originalRows.findIndex(x=>x.rank===6)]
        .necessaryTriggerSacrificeForSecondPokemon
    };
  });
  assert.equal(rows.length,29*29);
  assert.equal(candidateSummaries.length,4);
  const rank26=sourceSummaries.find(x=>x.rank===26);
  const original29AgainstRank26=original29VsRank26OpeningTradeoff();
  assert.ok(Math.abs(rank26.meanAdditionalLoneAgainstOriginal29-
    original29AgainstRank26.equalRankMeans
      .necessaryTriggerSacrificeForSecondPokemon)<1e-12);
  return {
    version:VERSION,
    authenticatedSourcePairs:rows.length,
    knownOriginalCount:29,
    missingSourceRanks:[23,25,28],
    equalPairMeanAdditionalSolo:
      rows.reduce((sum,row)=>sum+row.addedSoloStrictVsGreedy,0)/
        rows.length,
    sourceSummaries,candidateSummaries,rows,
    selectedPolicyChanged:false,qualifiedCompetitiveGames:0,
    claimBoundary:'Physical two-deck opening and optional bonus cards only. Neither source attack capability nor matchup game strength is modeled.'
  };
}

module.exports={VERSION,noTargetInBonus,
  sourceMulliganBenchTradeoff,original29VsRank26OpeningTradeoff,
  authenticatedFieldMulliganBenchMatrix};
