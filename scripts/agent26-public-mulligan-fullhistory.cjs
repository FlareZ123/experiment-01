'use strict';
const assert = require('node:assert/strict');
const {choose,openingProbabilities}=require('./aichi-opening-basics.cjs');
const {countBasics,EVOLUTIONS}=require('./aichi-field-mulligan-census.cjs');
const VERSION='agent26-full-public-mulligan-hand-posterior-v1';
const OPENING_SIZE=7, DECK_SIZE=60;
const LOG_DENOM=Math.log(Number(choose(DECK_SIZE,OPENING_SIZE)));

/**
 * Aggregate physically possible non-Basic printings by their public name.
 * @param {object} deck Known hypothetical exact source 60.
 * @returns {{basics:number,counts:Map<string,number>}}
 */
function nonBasicInventory(deck){
  const basics=countBasics(deck);
  const counts=new Map();
  for(const card of deck.cards){
    if(card.category==='Pokémon'&&!EVOLUTIONS.has(
      card.printing.set+'-'+card.printing.number))continue;
    counts.set(card.name,(counts.get(card.name)??0)+card.count);
  }
  assert.equal([...counts.values()].reduce((n,c)=>n+c,0),DECK_SIZE-basics);
  return {basics,counts};
}

/**
 * Exact log probability of an unordered seven-card invalid hand. Each
 * mulligan returns its seven cards before the next independent reshuffle.
 * @param {{counts:Map<string,number>}} inventory
 * @param {string[]} shownNames Names printed on a publicly shown invalid hand.
 * @returns {number} Negative infinity means impossible.
 */
function logFailedHandMass(inventory,shownNames){
  assert.ok(Array.isArray(shownNames)&&shownNames.length===OPENING_SIZE);
  const shown=new Map();
  for(const name of shownNames){
    assert.ok(typeof name==='string'&&name.length>0);
    shown.set(name,(shown.get(name)??0)+1);
  }
  let mass=-LOG_DENOM;
  for(const [name,n] of shown){
    const available=inventory.counts.get(name)??0;
    if(n>available)return -Infinity;
    mass+=Math.log(Number(choose(available,n)));
  }
  return mass;
}

/**
 * Source identity posterior based only on the opponent-visible ordered series
 * of fully revealed Basic-free sevens, followed by an unobserved valid seven.
 * This model never removes prior failed-hand cards from any future hand,
 * presumes no private current hand, and omits unrecovered source ranks.
 * @param {object} manifest Original 29 published sources.
 * @param {string[][]} publicFailedHands Public card names per invalid seven.
 * @returns {object}
 */
function publicFailedHandHistoryPosterior(manifest,publicFailedHands){
  assert.ok(Array.isArray(manifest?.decks)&&manifest.decks.length===29);
  assert.deepEqual(manifest.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  assert.ok(Array.isArray(publicFailedHands));
  const seen=new Set();
  const rows=manifest.decks.map(deck=>{
    assert.ok(Number.isSafeInteger(deck.rank)&&!seen.has(deck.rank));
    seen.add(deck.rank);
    const inv=nonBasicInventory(deck);
    const p=1-openingProbabilities(inv.basics,DECK_SIZE,OPENING_SIZE)
      .initialMulliganProbability;
    let logLikelihood=Math.log(p);
    for(const hand of publicFailedHands){
      const part=logFailedHandMass(inv,hand);
      if(part===-Infinity){logLikelihood=-Infinity;break;}
      logLikelihood+=part;
    }
    return {rank:deck.rank,archetype:deck.archetype,basics:inv.basics,
      logLikelihood};
  }).sort((a,b)=>a.rank-b.rank);
  const finite=rows.map(x=>x.logLikelihood).filter(Number.isFinite);
  assert.ok(finite.length>0,'Impossible public history for recovered sources');
  const max=Math.max(...finite);
  const weights=rows.map(row=>row.logLikelihood===-Infinity?0:
    Math.exp(row.logLikelihood-max));
  const total=weights.reduce((n,w)=>n+w,0);
  const models=rows.map((r,i)=>({...r,posterior:weights[i]/total}));
  return {
    version:VERSION,
    revealedFailedHandCount:publicFailedHands.length,
    knownRecoveredRanks:29,omittedSourceRanks:[23,25,28],
    prior:'uniform recovered original 29',
    models,
    posteriorEntropyBits:-models.reduce((n,row)=>
      n+(row.posterior>0?row.posterior*Math.log2(row.posterior):0),0),
    sourceIdentitiesCompatible:models.filter(x=>x.posterior>0)
      .map(x=>x.rank),
    eventProbabilityUnderKnownField:Math.exp(max)*total/models.length,
    excludesConcealedHandsDeckOrderAndPrizes:true,
    fullGamesPlayed:0,competitiveQualifiedGames:0
  };
}
module.exports={VERSION,nonBasicInventory,logFailedHandMass,
  publicFailedHandHistoryPosterior};
