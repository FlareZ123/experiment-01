'use strict';
const assert=require('node:assert/strict');
const roster=require('../../results/aichi-2026/full-decklists.json');
const {selectTwoDiscardables,discardPenalty}=
  require('../twinleaf/agent45-owner-ghala-after-tagcall.cjs');

const VERSION='agent7-rank6-t5-two-payment-ghala-feasible-cost-frontier-v1';
const COMMON=[
  'Captivating Poké Puff STS','Echoing Horn CRE',
  "Team Rocket's Handiwork FCO",'Sidney FST'
];

/** @param {object} row @returns {string} Native printing for counted hand cards. */
function printed(row){
  return row.name+' '+row.printing.set;
}

/** @returns {object} Conditional owner T5 G&H two-card payments in both paid-Plumeria arms. */
function compareGhalaDiscardPayments(){
  const six=roster.decks.find(row=>row.rank===6);
  const one=roster.decks.find(row=>row.rank===1);
  assert.ok(six&&one);
  const source=six.cards.flatMap(row=>
    Array.from({length:row.count},()=>printed(row)));
  assert.equal(source.length,60);
  const opponentHasOriginalSpecialEnergy=one.cards.some(row=>
    row.category==='Energy'&&row.name!=='Psychic Energy');
  assert.equal(opponentHasOriginalSpecialEnergy,false);
  const priorAllMail=[...COMMON,
    'Enhanced Hammer TWM','Enhanced Hammer TWM'];
  const preservedMail=[...COMMON,
    'Enhanced Hammer TWM',"Trainers' Mail ROS"];
  const choose=hand=>selectTwoDiscardables(
    hand.map(fullName=>({fullName})),source,5,40)
    .map(card=>card.fullName).sort();
  const baseline=choose(priorAllMail);
  const alternative=choose(preservedMail);
  assert.deepEqual(baseline,['Enhanced Hammer TWM','Enhanced Hammer TWM']);
  assert.deepEqual(alternative,
    ['Enhanced Hammer TWM',"Trainers' Mail ROS"]);
  return {version:VERSION,
    ownerTurn:5,sourceRank:6,opponentRank:1,
    sourcePrints:60,opponentHasOriginalSpecialEnergy,
    baselineAfterPlayingGhala:priorAllMail,
    alternativeAfterPlayingGhala:preservedMail,
    boundedSelectorCutoff:40,
    baselinePaidHandPrints:baseline,
    alternativePaidHandPrints:alternative,
    baselineWithinCutoff:true,alternativeWithinCutoff:true,
    penalties:{
      hammer:discardPenalty({fullName:'Enhanced Hammer TWM'},source,5),
      mail:discardPenalty({fullName:"Trainers' Mail ROS"},source,5)
    },
    actualNativeGhalaPlayed:false,competitiveGamesQualified:0};
}
module.exports={VERSION,compareGhalaDiscardPayments};
