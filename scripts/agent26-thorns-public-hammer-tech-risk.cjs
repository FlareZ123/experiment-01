'use strict';
const assert=require('node:assert/strict');
const {choose,openingProbabilities}=require('./aichi-opening-basics.cjs');
const {countBasics}=require('./aichi-field-mulligan-census.cjs');
const {nextValidHandMarkerChance}=
  require('./agent26-public-mulligan-inference-boundary.cjs');

const VERSION='agent26-thorns-control-tech-public-risk-v1';

/**
 * Posterior for whether a possible paper-public Iron Thorns source carries
 * Crushing Hammer, given an *exact* number k of failed Basic-free sevens
 * and whether at least one Hammer was shown in those failed hands.
 * Other revealed cards are intentionally not used. This is source-tech
 * uncertainty, not a prediction of its next actual move.
 * @param {object} manifest Archived 29 exact source lists.
 * @param {{failedHands:number,hammerSeen:boolean}} observation
 * @returns {object}
 */
function thornsHammerBelief(manifest,observation){
  const {failedHands,hammerSeen}=observation;
  assert.ok(Number.isSafeInteger(failedHands)&&failedHands>=0);
  assert.ok(typeof hammerSeen==='boolean');
  assert.ok(!hammerSeen||failedHands>=1);
  const ranks=[6,24,29];
  const decks=ranks.map(rank=>{
    const deck=manifest.decks.find(d=>d.rank===rank);
    assert.ok(deck,'Missing printed Iron Thorns original '+rank);
    assert.equal(countBasics(deck),4);
    assert.equal(deck.cards.filter(c=>c.name==='Iron Thorns ex')
      .reduce((s,c)=>s+c.count,0),4);
    const hammerCopies=deck.cards.filter(c=>c.name==='Crushing Hammer')
      .reduce((s,c)=>s+c.count,0);
    return {rank,hammerCopies};
  });
  const q=openingProbabilities(4).initialMulliganProbability;
  const valid=1-q;
  const nonBasics=56;
  const rows=decks.map(d=>{
    const noHammerGivenFailed=Number(choose(nonBasics-d.hammerCopies,7))/
      Number(choose(nonBasics,7));
    const disclosedFactor=hammerSeen?
      1-noHammerGivenFailed**failedHands:
      noHammerGivenFailed**failedHands;
    const weight=q**failedHands*valid*disclosedFactor;
    return {...d,likelihood:weight,
      nextValidHandHammerChance:nextValidHandMarkerChance({
        basics:4,markers:d.hammerCopies})};
  });
  const sum=rows.reduce((s,r)=>s+r.likelihood,0);
  assert.ok(sum>0,'Public Hammer observation impossible');
  const models=rows.map(x=>({...x,posterior:x.likelihood/sum}));
  return {version:VERSION,observation,
    activeName:'Iron Thorns ex',knownCompatibleRanks:ranks,
    prior:'uniform 1/3 among three recovered four-Basic Iron Thorns sources',
    models,
    posteriorProbabilityFourHammers:models.filter(x=>x.hammerCopies===4)
      .reduce((s,x)=>s+x.posterior,0),
    posteriorNextValidHandHammerChance:models.reduce((s,x)=>
      s+x.posterior*x.nextValidHandHammerChance,0),
    priorFailedMulligansFullReshuffle:true,
    excludesOpponentsCurrentHandDeckOrderPrizes:true,
    fullGames:0,competitiveQualifiedGames:0
  };
}

/**
 * Event k>=1 unspecified, no Hammer disclosed in any invalid seven.
 * This marginalizes over the actual failure count, which a live policy
 * normally knows, so do not substitute for an exact-k observation.
 * @param {object} manifest
 * @returns {object}
 */
function thornsHammerBeliefAnyFailedWithoutHammer(manifest){
  const q=openingProbabilities(4).initialMulliganProbability;
  const p=1-q;
  const base=thornsHammerBelief(manifest,{failedHands:0,hammerSeen:false});
  const rows=base.models.map(d=>{
    const a=Number(choose(56-d.hammerCopies,7))/Number(choose(56,7));
    return {...d,likelihood:p*q*a/(1-q*a)};
  });
  const total=rows.reduce((n,x)=>n+x.likelihood,0);
  const models=rows.map(x=>({...x,posterior:x.likelihood/total}));
  return {version:VERSION,event:'at least one invalid seven, none disclosed Crushing Hammer',
    models,posteriorProbabilityFourHammers:models.filter(x=>
      x.hammerCopies===4).reduce((n,x)=>n+x.posterior,0),
    posteriorNextValidHandHammerChance:models.reduce((n,x)=>
      n+x.posterior*x.nextValidHandHammerChance,0),
    exactFailureCountUnobservedInThisAggregate:true,
    fullGames:0,competitiveQualifiedGames:0};
}
module.exports={VERSION,thornsHammerBelief,
  thornsHammerBeliefAnyFailedWithoutHammer};
