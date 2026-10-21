'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose, rank6PrizeEnergyFeasibility} =
  require('./aichi-rank6-energy-prize-frontier.cjs');

/**
 * Three source-specific, physically distinct singleton non-Basic resources:
 * D = Double Colorless Energy; M = Thunder Mountain Prism Star;
 * G = Gladion, the deck's only initial-Prize retrieval Supporter.
 * E: at least two of D,M,G in the initial face-down six Prizes.
 *
 * First attacking turn going second allows one hand Energy attachment.
 * With no acceleration and the one-Energy reduction of M, D+M is the only
 * source printed route for Volt Cyclone (LCC) on that first turn.
 * If >=2 marked cards are Prized, D+M cannot both be made accessible by
 * the one-per-turn, one-Prize-card Gladion Supporter.
 *
 * Later turns can use multiple single-unit Special Energy attachments;
 * this is a FIRST-TURN obstruction only.
 *
 * @param {{deckSize:number,basicCount:number,handSize:number,prizeCount:number}} options
 */
function firstTurnEnergyTripletBarrier(options) {
  const {deckSize:N,basicCount:B,handSize:h,prizeCount:p} = options;
  if (![N,B,h,p].every(Number.isInteger) ||
      B < 1 || N-B < 3 || h < 1 || p < 3 || N-h < p) {
    throw new RangeError('Need >=1 Basic, 3 singleton non-Basics, >=3 Prizes');
  }
  const validHands = choose(N,h)-choose(N-B,h);
  const total = validHands*choose(N-h,p);
  const pair = (choose(N-2,h)-choose(N-B-2,h)) *
    choose(N-h-2,p-2);
  const allThree = (choose(N-3,h)-choose(N-B-3,h)) *
    choose(N-h-3,p-3);
  const atLeastTwo = 3n*pair-2n*allThree;
  assert.ok(atLeastTwo >= 0n && atLeastTwo <= total);
  /** @param {bigint} numerator */
  const row = numerator => ({
    physicalDeals:numerator.toString(),
    totalDeals:total.toString(),
    percent:100*Number(numerator)/Number(total)
  });
  return {
    model:'rank6-firstturn-volt-cyclone-3-singleton-prize-barrier-v1',
    deckSize:N,basicCount:B,handSize:h,prizeCount:p,
    designatedPairPrized:row(pair),
    allThreePrized:row(allThree),
    atLeastTwoPrized:row(atLeastTwo),
    firstTurnVoltCycloneAvailabilityCeilingPercent:
      100-100*Number(atLeastTwo)/Number(total),
    note:'Only first-turn going-second Volt Cyclone; no later-attack or win-rate inference'
  };
}

/** Use exact rank6 official print/copy guard from previous energy proof. */
function rank6SourceFirstTurnTriplet(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(
    root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const deck = manifest.decks.find(row=>row.rank===6);
  if (!deck) throw new Error('Missing rank6 published source');
  rank6PrizeEnergyFeasibility(deck);
  const count = name => deck.cards
    .filter(x=>x.name===name).reduce((n,x)=>n+x.count,0);
  assert.equal(count('Gladion'),1);
  assert.equal(count('Double Colorless Energy'),1);
  assert.equal(count('Thunder Mountain ♢'),1);
  assert.equal(count('Guzma & Hala'),2);
  assert.equal(count('Iron Thorns ex'),4);
  return firstTurnEnergyTripletBarrier({
    deckSize:60,basicCount:4,handSize:7,prizeCount:6
  });
}
if (require.main===module) {
  console.log(JSON.stringify(rank6SourceFirstTurnTriplet(
    path.resolve(__dirname,'..')),null,2));
}
module.exports={firstTurnEnergyTripletBarrier,rank6SourceFirstTurnTriplet};
