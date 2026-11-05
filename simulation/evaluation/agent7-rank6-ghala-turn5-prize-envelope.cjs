'use strict';
const assert=require('node:assert/strict');
const roster=require('../../results/aichi-2026/full-decklists.json');
const {combinations}=
  require('./agent7-rank6-preserved-mail-hit-bound.cjs');

const VERSION='agent7-rank6-t5-held-ghala-two-singleton-prize-envelope-v1';

/**
 * A conditional deck/Prize resource envelope. Twelve exposed owner cards are
 * held/in play/discard after the same authentic source T3 Plumeria, leaving
 * 48 unseen cards partitioned into six Prize cards and a 42-card deck.
 * This is not a native payoff probability or a playable-game certificate.
 * @returns {object}
 */
function sourceT5GhalaPrizeEnvelope(){
  const card=roster.decks.find(row=>row.rank===6).cards;
  const copies=name=>card.filter(row=>row.name===name)
    .reduce((n,row)=>n+row.count,0);
  assert.equal(copies('Guzma & Hala'),2);
  assert.equal(copies('Double Colorless Energy'),1);
  assert.equal(copies('Thunder Mountain ♢'),1);
  assert.equal(copies('Speed Lightning Energy'),4);
  assert.equal(copies('Capture Energy'),2);
  assert.equal(copies('Spiky Energy'),1);
  const hidden=48,prizes=6;
  const allPrizeChoices=combinations(hidden,prizes);
  const bothSingletonsPrized=combinations(hidden-2,prizes-2);
  assert.equal(bothSingletonsPrized*376n,allPrizeChoices*5n);
  const possibleAccess=allPrizeChoices-bothSingletonsPrized;
  return {
    version:VERSION,hiddenCards:48,unknownPrizeCards:6,
    exposedNonPrizeCards:12,residualDeckCards:42,
    otherUnseenSpecialEnergyCopies:6,
    unfavorablePrizeFraction:'5/376',
    nominalResourceAccessFraction:'371/376',
    nominalResourceAccessProbability:
      Number(possibleAccess)/Number(allPrizeChoices),
    condition:'held Guzma and Hala, active Speed Lightning, two hand discards, unspent Supporter and attachment, no relevant locks',
    neverReadsActualPrizeIdentities:true,
    attestedNativeAttack:false,competitiveGamesQualified:0
  };
}

module.exports={VERSION,sourceT5GhalaPrizeEnvelope};
