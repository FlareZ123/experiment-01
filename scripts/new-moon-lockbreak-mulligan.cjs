'use strict';

const assert = require('node:assert/strict');
const {choose} = require('./new-moon-lockbreak-access.cjs');
const {bonusExactly, bonusAtLeast} = require('./aichi_bonus_draws.cjs');
const source = require('../results/als/new-moon-perfection-english-map.json');
const challenger = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const field = require('../results/aichi-2026/full-decklists.json');

/** @param {number} n @param {number} k */
function combination(n, k) {
  return k < 0 || k > n ? 0 : Number(choose(n,k));
}

/**
 * Non-Basic target access from valid initial 7, every optional opponent
 * mulligan bonus, plus next mandatory one-card draw. Prize identities are
 * averaged over uniformly: draws after initial hand are marginally sampled
 * from 53 remaining positions. The K>=47 tail is counted as at-most-47
 * physically observable cards; these extreme games may deck out and are
 * explicitly excluded from game success conclusions.
 *
 * @param {number} opponentBasics
 * @param {number} ownBasics
 * @param {number} targetNonBasicCopies
 */
function conditionalAccess(opponentBasics, ownBasics, targetNonBasicCopies) {
  assert.ok(Number.isInteger(opponentBasics) && opponentBasics >= 1 && opponentBasics <= 60);
  assert.ok(Number.isInteger(ownBasics) && ownBasics >= 1 && ownBasics <= 60);
  assert.ok(Number.isInteger(targetNonBasicCopies) && targetNonBasicCopies >= 0 &&
    targetNonBasicCopies <= 60-ownBasics);
  const denominator = combination(60,7);
  const pOpp = combination(60-opponentBasics,7)/denominator;
  const pOwn = combination(60-ownBasics,7)/denominator;
  const validInitialHands = denominator-combination(60-ownBasics,7);
  const missInitial = (combination(60-targetNonBasicCopies,7) -
    combination(60-ownBasics-targetNonBasicCopies,7))/validInitialHands;
  const noTargetAfterDraw = k => {
    const d = Math.min(k+1,47);
    return combination(53-targetNonBasicCopies,d)/combination(53,d);
  };
  let missWithBonuses = 0;
  for (let k=0;k<47;k++) {
    missWithBonuses += bonusExactly(pOpp,pOwn,k)*noTargetAfterDraw(k);
  }
  const tail47 = bonusAtLeast(pOpp,pOwn,47);
  missWithBonuses += tail47*noTargetAfterDraw(47);
  const firstDraw = 1-missInitial*noTargetAfterDraw(0);
  const withAllBonusOffers = 1-missInitial*missWithBonuses;
  return {
    copies:targetNonBasicCopies,
    directByFirstDraw:firstDraw,
    withAllOptionalBonusCards:withAllBonusOffers,
    upliftPercentagePoints:100*(withAllBonusOffers-firstDraw),
    chanceAtLeastOneBonus:bonusAtLeast(pOpp,pOwn,1),
    chanceAtLeastThreeBonus:bonusAtLeast(pOpp,pOwn,3),
    extremeKAtLeast47Tail:tail47,
    ownMulliganSeven:pOwn,
    opponentMulliganSeven:pOpp
  };
}

function main() {
  const thornsRanks = [6,24,29];
  for (const rank of thornsRanks) {
    const deck = field.decks.find(d=>d.rank===rank);
    assert.ok(deck);
    assert.equal(deck.archetype,'Iron Thorns');
    assert.deepEqual(deck.cards.filter(c=>c.category==='Pokémon')
      .map(c=>[c.name,c.count]),[['Iron Thorns ex',4]],
    'This opening model requires exactly four source Basic Pokémon');
  }
  const candidates = [
    {name:'source',list:source.entries.map(x=>({name:x.name,count:x.count}))},
    {name:'lockbreak-v1',list:challenger.entries.map(x=>({name:x.name_en,count:x.count}))}
  ];
  const rows = candidates.map(({name,list}) => {
    const copies = cardName => list.filter(x=>x.name===cardName)
      .reduce((n,x)=>n+x.count,0);
    const fieldBlower = copies('Field Blower');
    const cologne = copies('Canceling Cologne');
    assert.equal(name==='source',fieldBlower===0 && cologne===0);
    assert.equal(name==='lockbreak-v1',fieldBlower===2 && cologne===2);
    return {name,fieldBlower:conditionalAccess(4,17,fieldBlower),
      cologne:conditionalAccess(4,17,cologne),
      eitherCounter:conditionalAccess(4,17,fieldBlower+cologne)};
  });
  return {
    schema:'new-moon-vs-iron-thorns-mulligan-counter-access-v1',
    benchmarkOpponentRanks:thornsRanks,
    opponentConfirmedBasicCount:4,
    candidateBasicCount:17,
    candidatePrintHash:challenger.canonical_id_count_sha256,
    sourcePrintHash:source.sha256_id_counts,
    model:'Simultaneous redraws do not award bonuses; after own valid 7, accept every opponent mulligan offer; six random Prizes are marginally integrated. Then count one mandatory first turn draw. Extreme >=47 bonus offers use a capped target-visibility proxy.',
    limits:'Card visibility only, not legal Cologne use, Forest Seal access, Item-lock exposure, attack success, starter/turn order, gameplay, or win rate.',
    rows
  };
}

if (require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={combination, conditionalAccess, main};
