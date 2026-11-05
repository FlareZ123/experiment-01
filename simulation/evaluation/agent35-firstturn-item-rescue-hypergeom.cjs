'use strict';
const assert=require('node:assert/strict');
const VERSION='agent35-exact-firstturn-item-rescue-v1';

/**
 * Exact binomial count for public deck populations.
 * @param {number} n Deck population.
 * @param {number} k Sample.
 * @returns {bigint}
 */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  const r=Math.min(k,n-k);
  let result=1n;
  for(let i=1;i<=r;i++)
    result=result*BigInt(n-r+i)/BigInt(i);
  return result;
}

/**
 * A mathematical model, not a game simulator: sample a seven-card hand
 * conditioned on one Basic, then one ordinary card from the residual deck.
 * Category counts are disjoint. No opponent interactions, compensation
 * draws, effects, search legality, or game outcomes are represented.
 * @param {{deckSize?:number,basics:number,energies:number,items:number,
 * openingHand?:number}} deck
 * @returns {object}
 */
function firstOwnTurnRescue(deck){
  const N=deck.deckSize??60,B=deck.basics;
  const E=deck.energies,L=deck.items,h=deck.openingHand??7;
  for(const n of [N,B,E,L,h])
    assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(N>h&&h>0&&B>0&&B+E+L<=N);
  const c=(n,k)=>Number(choose(n,k));
  const combinations=c(N,h);
  const valid=1-c(N-B,h)/combinations;
  const unconditioned=(missing)=>{
    const p=(c(N-missing,h)-c(N-missing-B,h))/combinations;
    return p*(N-missing-h)/(N-h)/valid;
  };
  const noEnergy=unconditioned(E);
  const noEnergyNoItem=unconditioned(E+L);
  const noItem=unconditioned(L);
  const rescue=noEnergy-noEnergyNoItem;
  return {
    schema:VERSION,deckSize:N,basics:B,energies:E,items:L,
    legalSetupProbability:valid,
    noEnergySeenProbability:noEnergy,
    noEnergyOrItemSeenProbability:noEnergyNoItem,
    itemSeenProbability:1-noItem,
    itemRescueProbability:rescue,
    itemGivenNoEnergyProbability:noEnergy?rescue/noEnergy:0,
    gameSimulation:false,competitiveGamesQualified:0
  };
}

module.exports={VERSION,choose,firstOwnTurnRescue};
