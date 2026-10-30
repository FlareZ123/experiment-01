'use strict';

const {audit,loadBasicIndex,mulliganProbability} = require('./aichi_opening_audit.cjs');
const {ticketCompressor} = require('./aichi-meloetta-ticket-compressor.cjs');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Probability that a random ordered draw of `draws` cards avoids all `excluded`
 * marked cards in a population of `population`. Computed as a falling-product
 * ratio so large middle binomial coefficients are never rounded to integers.
 * @param {number} population
 * @param {number} excluded
 * @param {number} draws
 * @returns {number}
 */
function avoid(population,excluded,draws) {
  if (draws > population - excluded) return 0;
  let value = 1;
  for (let i=0; i<draws; i++) value *= (population-excluded-i)/(population-i);
  return value;
}

/**
 * Physical resource visibility, conditional on a legal first seven: singleton
 * DCE in initial Prizes, singleton Ticket and at least one of `compressors`
 * seen within initial seven plus `laterDraws` non-Prize draws.
 *
 * Includes no search, K0 knowledge, card use, or winning play. Treat all
 * marked card classes as non-Basic. The original six Prizes are set before
 * bonus draws and the ordinary turn draw.
 *
 * @param {{deckSize:number,ownBasics:number,handSize:number,prizes:number,compressors:number,laterDraws:number}} p
 * @returns {number} Probability conditional on a valid initial hand.
 */
function ticketCompressorVisibility(p) {
  const {deckSize:n,ownBasics:b,handSize:h,prizes:q,compressors:c,laterDraws:k}=p;
  if (![n,b,h,q,c,k].every(Number.isSafeInteger) ||
      n<6 || b<1 || c<1 || h<1 || q<1 || k<0 ||
      b+c+2>n || h+q+k>n || h+q>=n) {
    throw new RangeError('Invalid physical resource-access model');
  }
  const m=n-1; // Condition first on the DCE occupying one of q Prize positions.
  const visible=h+k;
  const absentSpecials=excluded => avoid(m,excluded,visible);
  const absentBasicsAndSpecials=excluded =>
    avoid(m,b+excluded,h)*avoid(m-h,excluded,k);
  const bothVisible=1-absentSpecials(1)-absentSpecials(c)+absentSpecials(c+1);
  const noBasicBothVisible=avoid(m,b,h)-absentBasicsAndSpecials(1)-
    absentBasicsAndSpecials(c)+absentBasicsAndSpecials(c+1);
  const validSeven=1-avoid(n,b,h);
  const event=(q/n)*(bothVisible-noBasicBothVisible)/validSeven;
  return Math.max(0,Math.min(1,event)); // Only floating-point cancellation correction.
}

/**
 * Bonus-draw distribution from the actual simultaneous mulligan protocol:
 * both invalid -> both redraw with no awarded bonus, and a valid owner waits
 * while its invalid opponent redraws. Once the owner has a legal seven, its
 * final physical hand is independent of the offered-bonus count.
 *
 * @param {number} opponentMulligan Single-seven failure probability.
 * @param {number} ownMulligan Single-seven failure probability.
 * @param {number} n Nonnegative number of bonus cards offered.
 * @returns {number}
 */
function offeredBonusProbability(opponentMulligan,ownMulligan,n) {
  if (![opponentMulligan,ownMulligan].every(x=>Number.isFinite(x)&&x>=0&&x<1) ||
      !Number.isSafeInteger(n)||n<0) throw new RangeError('Invalid mulligan distribution');
  const d=1-opponentMulligan*ownMulligan;
  if (n===0) return (1-opponentMulligan)/d;
  return (1-ownMulligan)*(1-opponentMulligan)*
    opponentMulligan**n/d;
}

/**
 * Rank-26 source resource opportunity after electing to take every offered
 * opponent mulligan draw, followed by its one normal first-turn draw. A rare
 * overflow of offers is capped so one ordinary card remains to be drawn.
 * This is a physical visibility bound, not a policy or game win probability.
 *
 * @param {number} opponentBasics Basic count in a 60-card opposing deck.
 * @returns {object}
 */
function rank26TicketAgainstBasics(opponentBasics) {
  const ownBasics=12;
  const ownMulligan=mulliganProbability(ownBasics);
  const opponentMulligan=mulliganProbability(opponentBasics);
  const args={deckSize:60,ownBasics,handSize:7,prizes:6,compressors:4};
  const cap=60-7-6-1; // 46 optional draws + a preserved normal turn draw.
  const baseline=ticketCompressorVisibility({...args,laterDraws:1});
  let withAllOffers=0;
  for (let offers=0;offers<cap;offers++) {
    withAllOffers+=offeredBonusProbability(opponentMulligan,ownMulligan,offers)*
      ticketCompressorVisibility({...args,laterDraws:offers+1});
  }
  const tail=(1-ownMulligan)*opponentMulligan**cap/
    (1-ownMulligan*opponentMulligan);
  withAllOffers+=tail*ticketCompressorVisibility({...args,laterDraws:cap+1});
  return {
    opponentBasics,opponentMulligan,ownMulligan,
    probabilitySomeBonus:1-offeredBonusProbability(opponentMulligan,ownMulligan,0),
    expectedOffers:opponentMulligan*(1-ownMulligan)/
      ((1-opponentMulligan)*(1-opponentMulligan*ownMulligan)),
    noBonusVisibility:baseline,withAllOffersVisibility:withAllOffers,
    relativeIncrease:withAllOffers/baseline-1,
    cappedTailProbability:tail,
    assumption:'Takes all offered bonus cards, preserving the first turn draw; source hand valid, DCE initially Prized; no knowledge/search/action/attack modeled'
  };
}

/** @returns {object} Source-backed 29-of-32 opponent table. */
function sourceRank26Field() {
  const root=path.resolve(__dirname,'..');
  const data=JSON.parse(fs.readFileSync(path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const {verifyCompressor}=require('./aichi-meloetta-ticket-compressor.cjs');
  if(verifyCompressor(data)!==4) throw new Error('Source rank26 Compressor inventory changed');
  const rows=audit(data.decks,loadBasicIndex(path.join(root,'resources/cards/en')));
  const rank26=rows.find(r=>r.rank===26);
  if(rank26?.basicCount!==12||rows.length!==29) throw new Error('Source rank26 or opponent coverage changed');
  const baseline=ticketCompressor(60,12,7,6,4).directRoute;
  if(Math.abs(baseline-ticketCompressorVisibility({deckSize:60,ownBasics:12,
    handSize:7,prizes:6,compressors:4,laterDraws:1}))>1e-12) {
    throw new Error('Existing direct first-eight model disagrees');
  }
  const opponents=rows.map(row=>({rank:row.rank,archetype:row.archetype,
    ...rank26TicketAgainstBasics(row.basicCount)}));
  return {
    sourceRank:26,publishedSourceRanks:rows.length,missingRanks:[23,25,28],
    baselineWithoutOffers:baseline,
    observedPublishedRankMeanVisibility:opponents.reduce((s,x)=>s+x.withAllOffersVisibility,0)/opponents.length,
    opponents,qualifiesGameWinRate:false
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(sourceRank26Field(),null,2)+'\n');
module.exports={avoid,ticketCompressorVisibility,offeredBonusProbability,rank26TicketAgainstBasics,sourceRank26Field};
