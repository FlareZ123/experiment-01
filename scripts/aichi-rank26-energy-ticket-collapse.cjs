'use strict';
const path = require('node:path');
const {choose, hardCrisisBarriers, sourceRank26Barriers} =
  require('./aichi-rank26-crisis-barriers.cjs');

/**
 * Exact physical opening-hand and six-Prize combinations conditioned on an
 * initial Basic, for five distinct marked non-Basics:
 * D (single Double Colorless), T (single Redeemable Ticket), R (Escape Rope),
 * L1 and L2 (the two indistinguishable but physical Lightning cards).
 * M is the unique Basic Meloetta, included in basicCount.
 *
 * A: D,T initially Prized.
 * B: Meloetta is the only opening Basic and R,T initially Prized.
 * C: T,L1,L2 initially Prized.
 *
 * C adds an independently sufficient specific turn-one energy barrier.
 * The all-pairs and triple overlaps must be subtracted/added explicitly.
 * Counts refer to restricted first-player Crisis Punch availability only.
 *
 * @param {{deckSize:number,basicCount:number,handSize:number,prizeCount:number}} options
 */
function energyTicketCollapse(options) {
  const {deckSize:N,basicCount:B,handSize:h,prizeCount:p} = options;
  if (![N,B,h,p].every(Number.isInteger) ||
      B < 1 || N-B < 5 || h < 1 || p < 5 || N-h < p) {
    throw new RangeError('Need one Basic, five distinct non-Basics and five Prize slots');
  }
  const prior = hardCrisisBarriers(options);
  const validHands = choose(N,h) - choose(N-B,h);
  const total = validHands * choose(N-h,p);
  const a = BigInt(prior.bothSpecialEnergyAndTicketPrized.favorableDeals);
  const b = BigInt(prior.forcedMeloettaActiveAndRopeTicketPrized.favorableDeals);
  const ab = BigInt(prior.overlap.favorableDeals);
  const c = (choose(N-3,h) - choose(N-B-3,h)) *
    choose(N-h-3,p-3);
  const ac = (choose(N-4,h) - choose(N-B-4,h)) *
    choose(N-h-4,p-4);
  const bc = choose(N-B-4,h-1) * choose(N-h-4,p-4);
  const abc = choose(N-B-5,h-1) * choose(N-h-5,p-5);
  const oldUnion = a+b-ab;
  const newUnion = oldUnion+c-ac-bc+abc;
  const newlyExcluded = newUnion-oldUnion;
  if (newUnion > total || newlyExcluded < 0n) {
    throw new Error('Invalid inclusion-exclusion arithmetic');
  }
  /** @param {bigint} numerator */
  const format = numerator => ({
    favorableDeals: numerator.toString(),
    totalDeals: total.toString(),
    percent: 100 * Number(numerator) / Number(total)
  });
  return {
    model: 'rank26-firstturn-crisis-energy-ticket-three-event-v1',
    deckSize:N,basicCount:B,handSize:h,prizeCount:p,
    eventA_DceTicketPrized:format(a),
    eventB_ForcedMeloettaRopeTicketPrized:format(b),
    eventC_TicketBothLightningPrized:format(c),
    pairAB:format(ab),
    pairAC:format(ac),
    pairBC:format(bc),
    tripleABC:format(abc),
    priorTwoEventUnion:format(oldUnion),
    newDisjointIncrement:format(newlyExcluded),
    threeEventUnion:format(newUnion),
    firstTurnCrisisAvailabilityCeilingPercent:
      100-100*Number(newUnion)/Number(total),
    interpretation: 'Paper source-opening obstruction, never a game win/loss rate'
  };
}

/** Source-guarded official rank26 manifest, inherited from checked v1 count. */
function sourceRank26EnergyCollapse(root) {
  sourceRank26Barriers(root);
  return energyTicketCollapse({
    deckSize:60,basicCount:12,handSize:7,prizeCount:6
  });
}
if (require.main === module) {
  console.log(JSON.stringify(sourceRank26EnergyCollapse(
    path.resolve(__dirname, '..')),null,2));
}
module.exports = {energyTicketCollapse, sourceRank26EnergyCollapse};
