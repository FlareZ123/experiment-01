'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  firstSevenMulliganProbability,
  mulliganBonusExposure,
  loadRegisteredStartingBasicCounts,
  fieldMeanBonusExposure
} = require('../simulation/evaluation/agent1-original-field-mulligan-bonus.cjs');

const RANKS = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,
  20,21,22,24,26,27,29,30,31,32];
const BASIC_COUNTS = [14,14,11,13,11,4,11,10,11,15,11,15,11,14,14,
  11,13,16,16,14,14,12,4,12,15,4,16,15,13];

/** @param {number} x @param {number} y */
function near(x, y) {
  assert.ok(Math.abs(x-y) < 1e-11,
    'Expected ' + y + ', found ' + x);
}

test('all 29 original sixties resolve exact printed Basic stages', () => {
  const state=loadRegisteredStartingBasicCounts();
  assert.deepEqual(state.originals.map(x=>x.rank), RANKS);
  assert.deepEqual(state.originals.map(x=>x.basics), BASIC_COUNTS);
  assert.deepEqual(state.missingRanks, [23,25,28]);
});

test('four candidate 60s resolve their printed eligible Basic counts', () => {
  const state=loadRegisteredStartingBasicCounts();
  assert.deepEqual(state.candidates.map(x=>x.basics), [12,7,14,12]);
});

test('exact independent seven-card physical no-Basic screens', () => {
  near(firstSevenMulliganProbability(4), 0.6005009259303993);
  near(firstSevenMulliganProbability(7), 0.39912045076768693);
  near(firstSevenMulliganProbability(12), 0.1906466927107365);
  near(firstSevenMulliganProbability(14), 0.1385906808712801);
  near(firstSevenMulliganProbability(60), 0);
});

test('three post-repeat mutually exclusive setup entry states sum to one', () => {
  for(const a of [4,7,12,14,60]){
    for(const b of [4,7,12,14,60]){
      const x=mulliganBonusExposure(a,b);
      near(x.candidateOffersOpponent.atLeastOne+
        x.opponentOffersCandidate.atLeastOne+
        x.bothValidAfterJointAttempts, 1);
    }
  }
});

test('equal Basic counts yield symmetric bonus offer probabilities and expectations', () => {
  const x=mulliganBonusExposure(12,12);
  near(x.candidateOffersOpponent.atLeastOne,x.opponentOffersCandidate.atLeastOne);
  near(x.candidateOffersOpponent.expectedMaximumCards,
    x.opponentOffersCandidate.expectedMaximumCards);
  near(x.candidateOffersOpponent.atLeastOne,0.16012400411879034);
});

test('actual two-player retry process differs from naive own mulligan rate', () => {
  const x=mulliganBonusExposure(7,14);
  near(x.candidateOffersOpponent.atLeastOne,0.36393942058983347);
  assert.ok(x.candidateOffersOpponent.atLeastOne < x.candidateFirstSevenMulligan);
  near(x.candidateOffersOpponent.expectedMaximumCards,0.6056711739227135);
});

test('opposing low-Basic Iron Thorns can instead offer the candidate more draws', () => {
  const x=mulliganBonusExposure(7,4);
  near(x.candidateOffersOpponent.atLeastOne,0.20971065036894675);
  near(x.opponentOffersCandidate.atLeastOne,0.4745740724083772);
  near(x.opponentOffersCandidate.expectedMaximumCards,1.187909072855862);
});

test('at least two offered cards has geometric continuation probability', () => {
  const x=mulliganBonusExposure(7,14);
  near(x.candidateOffersOpponent.atLeastTwo,
    x.candidateOffersOpponent.atLeastOne*x.candidateFirstSevenMulligan);
  near(x.opponentOffersCandidate.atLeastTwo,
    x.opponentOffersCandidate.atLeastOne*x.opponentFirstSevenMulligan);
});

test('small explicitly enumerated joint retry tree matches closed form', () => {
  // Both mulligan 0..60 times before the first asymmetrical/valid stage.
  const A=firstSevenMulliganProbability(7);
  const B=firstSevenMulliganProbability(14);
  let gift=0,receive=0,bothValid=0,weight=1;
  for(let n=0;n<61;n++){
    gift += weight*A*(1-B);
    receive += weight*B*(1-A);
    bothValid += weight*(1-A)*(1-B);
    weight*=A*B;
  }
  const x=mulliganBonusExposure(7,14);
  near(gift,x.candidateOffersOpponent.atLeastOne);
  near(receive,x.opponentOffersCandidate.atLeastOne);
  near(bothValid,x.bothValidAfterJointAttempts);
});

test('equal rank-weighted 29-original candidate mulligan exposure is reproducible', () => {
  const field=loadRegisteredStartingBasicCounts().originals;
  const seven=fieldMeanBonusExposure(7,field);
  const twelve=fieldMeanBonusExposure(12,field);
  const fourteen=fieldMeanBonusExposure(14,field);
  for(const x of [seven,twelve,fourteen]) assert.equal(x.authenticatedFieldSize,29);
  near(seven.opponentAnyOffer,0.3413569924230461);
  near(seven.expectedOpponentBonus,0.5680955407105561);
  near(seven.expectedCandidateBonus,0.23985430809809943);
  near(seven.expectedOpponentMinusCandidateBonus,0.3282412326124567);
  near(twelve.expectedOpponentMinusCandidateBonus,-0.10043146740519845);
  near(fourteen.expectedOpponentMinusCandidateBonus,-0.17509751811449725);
});

test('none of the missing original 23,25,28 is backfilled with inferred Basics', () => {
  const r=loadRegisteredStartingBasicCounts();
  assert.deepEqual(r.missingRanks,[23,25,28]);
  assert.ok(r.originals.every(row=>!r.missingRanks.includes(row.rank)));
});
