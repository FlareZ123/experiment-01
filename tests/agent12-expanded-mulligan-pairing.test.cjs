'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {openingMulliganProbability, pairedSetupMulligans,
  opponentEligibleAtLeast} =
  require('../scripts/agent12-expanded-mulligan-pairing.cjs');

/** @param {number} actual @param {number} expected @param {number} eps */
function close(actual, expected, eps = 1e-12) {
  assert.ok(Math.abs(actual - expected) < eps,
    'Expected ' + expected + ', received ' + actual);
}

test('four Iron Thorns ex Basics yield exact 60 choose 7 hypergeometric failure', () => {
  close(openingMulliganProbability(4), 0.6005003742553344);
  close(openingMulliganProbability(14), 0.1385906808712801);
  close(openingMulliganProbability(11), 0.22242114149585926);
});

test('combinatorial identities are correct at extreme Basic concentrations', () => {
  close(openingMulliganProbability(1), 53/60);
  close(openingMulliganProbability(53), 1/Math.round(1/(
    openingMulliganProbability(53))));
  assert.equal(openingMulliganProbability(54), 0);
  assert.equal(openingMulliganProbability(60), 0);
  assert.throws(() => openingMulliganProbability(0), RangeError);
  assert.throws(() => openingMulliganProbability(61), RangeError);
  assert.throws(() => openingMulliganProbability(4.2), RangeError);
});

test('symmetric two-four-Basic setup has equal optional draw eligibility', () => {
  const x = pairedSetupMulligans(4,4);
  close(x.expectedOptionalDrawsAvailableToOpponent,
    0.9391633268408608);
  close(x.expectedOptionalDrawsAvailableToMe,
    x.expectedOptionalDrawsAvailableToOpponent);
  close(x.probabilityOnlyMySetupNeedsRedraws,
    x.probabilityOnlyOpposingSetupNeedsRedraws);
  close(x.probabilityOnlyMySetupNeedsRedraws +
    x.probabilityOnlyOpposingSetupNeedsRedraws +
    x.probabilityNeitherSetupNeedsRedraws,1);
});

test('pure-four-Basic Aichi versus 14-Basic champion is strongly asymmetric', () => {
  const x = pairedSetupMulligans(4,14);
  close(x.expectedIndependentMyFailedHands,1.503131256095683);
  close(x.expectedOptionalDrawsAvailableToOpponent,1.4123525560019534);
  close(x.expectedOptionalDrawsAvailableToMe,0.07010959980469617);
  close(x.probabilityOnlyMySetupNeedsRedraws,0.5642343175423022);
  close(x.expectedSharedRestartRounds,0.09077870009372943);
  close(opponentEligibleAtLeast(4,14,5),0.07336900454006669);
});

test('both player seats are equivalent under symmetric setup mulligan rules', () => {
  for (const [a,b] of [[4,14],[4,11],[7,17],[11,1],[60,4]]) {
    const x=pairedSetupMulligans(a,b),y=pairedSetupMulligans(b,a);
    close(x.expectedOptionalDrawsAvailableToMe,
      y.expectedOptionalDrawsAvailableToOpponent);
    close(x.expectedOptionalDrawsAvailableToOpponent,
      y.expectedOptionalDrawsAvailableToMe);
    close(x.probabilityNeitherSetupNeedsRedraws,
      y.probabilityNeitherSetupNeedsRedraws);
  }
});

test('probability mass from each possible one-sided mulligan count sums to one', () => {
  const x=pairedSetupMulligans(4,14);
  const none=1-opponentEligibleAtLeast(4,14,1);
  let total=none;
  let expectation=0;
  for(let n=1;n<=150;n++){
    const exact=opponentEligibleAtLeast(4,14,n)-
      opponentEligibleAtLeast(4,14,n+1);
    total+=exact;
    expectation+=n*exact;
  }
  close(total,1);
  close(expectation,x.expectedOptionalDrawsAvailableToOpponent);
  assert.equal(opponentEligibleAtLeast(4,14,0),1);
  assert.throws(()=>opponentEligibleAtLeast(4,14,-1),RangeError);
  assert.throws(()=>opponentEligibleAtLeast(4,14,2.5),RangeError);
});

test('independent deterministic 300k duel-round simulation agrees with analytic formula', () => {
  const x=pairedSetupMulligans(4,14);
  let seed=0x4c61b2ff;
  function random(){
    seed=(Math.imul(1664525,seed)+1013904223)>>>0;
    return seed/4294967296;
  }
  const trials=300000;
  let totalOpponent=0,totalMe=0;
  for(let i=0;i<trials;i++){
    let mySuccess,themSuccess;
    do{
      mySuccess=random()>=x.qMe;
      themSuccess=random()>=x.qThem;
    }while(!mySuccess&&!themSuccess);
    if(!mySuccess){
      do{
        totalOpponent++;
        mySuccess=random()>=x.qMe;
      }while(!mySuccess);
    }else if(!themSuccess){
      do{
        totalMe++;
        themSuccess=random()>=x.qThem;
      }while(!themSuccess);
    }
  }
  close(totalOpponent/trials,x.expectedOptionalDrawsAvailableToOpponent,.015);
  close(totalMe/trials,x.expectedOptionalDrawsAvailableToMe,.005);
});
