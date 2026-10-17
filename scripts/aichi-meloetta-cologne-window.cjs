'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {audit,choose,loadBasicIndex,mulliganProbability} =
  require('./aichi_opening_audit.cjs');
const {bonusAtLeast} = require('./aichi_bonus_draws.cjs');

/**
 * Probability of directly holding a distinguished non-Basic singleton
 * (Canceling Cologne) by the beginning of the candidate's first turn.
 *
 * A validated opening has at least one Basic. One ordinary turn draw follows
 * six inaccessible initial Prizes; all offered opposing-mulligan bonus cards
 * are elected up to 46, leaving at least one card for the ordinary draw.
 * No Trainer search, shuffle, opening play or lock suppression is assumed.
 *
 * @param {number} ownBasics Number of the singleton-holder's Basic Pokémon.
 * @param {number} opponentBasics Number of the opponent's Basic Pokémon.
 * @returns {object} Exact finite-population probabilities under this model.
 */
function directSingletonWindow(ownBasics, opponentBasics) {
  if(!Number.isInteger(ownBasics)||ownBasics<1||ownBasics>59||
     !Number.isInteger(opponentBasics)||opponentBasics<1||opponentBasics>60) {
    throw new RangeError('Invalid Basic Pokémon counts for singleton model');
  }
  const pOwn = mulliganProbability(ownBasics);
  const pOpponent = mulliganProbability(opponentBasics);
  const validSevens = choose(60,7)-choose(60-ownBasics,7);
  const includeInSeven =
    (choose(59,6)-choose(59-ownBasics,6))/validSevens;
  const missSeven = 1-includeInSeven;

  // Exactly one ordinary draw is possible after accepting at most 46
  // opponent-mulligan bonus cards. Each unseen physical card is uniformly
  // located among the 53 cards not in the opening seven, including 6 Prizes.
  const firstDraw = includeInSeven+missSeven/53;
  let cappedExpectedBonuses = 0;
  for(let k=1;k<=46;k++) {
    cappedExpectedBonuses += bonusAtLeast(pOpponent,pOwn,k);
  }
  const withOptionalBonuses =
    includeInSeven+missSeven*(1+cappedExpectedBonuses)/53;
  return {
    ownBasics,opponentBasics,
    openingSeven:includeInSeven,
    openingPlusFirstDraw:firstDraw,
    firstTurnWithAllPossibleBonuses:withOptionalBonuses,
    expectedAcceptedBonuses:cappedExpectedBonuses,
    atLeastOneOffered:bonusAtLeast(pOpponent,pOwn,1),
    offersExceedCap:bonusAtLeast(pOpponent,pOwn,47)
  };
}

/**
 * Validate that the count assumptions match the actual published Aichi
 * rank-26 Meloetta list and three complete Iron Thorns lists.
 * @param {string} root Repository root.
 * @returns {object} Sealed source-backed direct-access evidence.
 */
function sourceCologneWindow(root) {
  const manifest=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const rows=audit(manifest.decks,loadBasicIndex(
    path.join(root,'resources/cards/en')));
  const meloetta=manifest.decks.find(d=>d.rank===26);
  const melon=rows.find(d=>d.rank===26);
  if(!meloetta||!melon||melon.basicCount!==12) {
    throw new Error('Unexpected rank-26 exact source inventory');
  }
  const singleton=meloetta.cards.filter(c=>c.name==='Canceling Cologne')
    .reduce((n,c)=>n+c.count,0);
  if(singleton!==1) {
    throw new Error('Expected exactly one source-registered Canceling Cologne');
  }
  const ranks=[6,24,29];
  for(const rank of ranks) {
    const entry=manifest.decks.find(d=>d.rank===rank);
    const row=rows.find(d=>d.rank===rank);
    if(!entry||!row||row.basicCount!==4||entry.archetype!=='Iron Thorns'||
       entry.cards.some(c=>c.category==='Pokémon'&&
         (c.name!=='Iron Thorns ex'||c.count!==4))) {
      throw new Error('Four-Iron-Thorns source identity changed at rank '+rank);
    }
  }
  return {
    source:'Aichi 2026 published rank-26 Meloetta Donk and ranks 6, 24, 29',
    ranks,
    singleton:'Canceling Cologne',
    copies:singleton,
    ...directSingletonWindow(melon.basicCount,4)
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(sourceCologneWindow(
    path.resolve(__dirname,'..')),null,2)+'\n');
}

module.exports={directSingletonWindow,sourceCologneWindow};
