'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  minimumZeroLossTrials,
  minimumBalancedFieldZeroLossDesign,
  minimumSimultaneousEveryMatchupZeroLossDesign
}=require('../simulation/evaluation/agent8-zero-loss-field-certification.cjs');

test('exact one-sided threshold for a single prespecified distribution',()=>{
  const n=minimumZeroLossTrials(.995,.05);
  assert.equal(n,598);
  assert.ok(.995**n<=.05);
  assert.ok(.995**(n-1)>.05);
});

test('32 equally replicated authentic opponents: 19 each, 608 total',()=>{
  const design=minimumBalancedFieldZeroLossDesign({
    opponentCount:32,target:.995,alpha:.05
  });
  assert.equal(design.perOpponent,19);
  assert.equal(design.total,608);
  assert.ok(design.allWinNullProbabilityBound<.05);
  assert.ok(.995**(32*18)>.05);
  assert.equal(design.interpretation,'equal-field-average-only');
  assert.equal(design.enablesChosenPostHocDeckSelection,false);
  assert.equal(design.requiresIndependentFullyQualifiedGames,true);
  assert.ok(Object.isFrozen(design));
});

test('Bonferroni joint every-opponent gate needs 1,290 each, 41,280 total',()=>{
  const design=minimumSimultaneousEveryMatchupZeroLossDesign({
    opponentCount:32,target:.995,alpha:.05
  });
  assert.equal(design.perOpponentAlpha,.05/32);
  assert.equal(design.perOpponent,1290);
  assert.equal(design.total,41280);
  assert.ok(design.familywiseNullBound<=.05);
  assert.ok(32*(.995**(1290-1))>.05);
  assert.equal(design.interpretation,'simultaneous-every-matchup');
  assert.equal(design.enablesChosenPostHocDeckSelection,false);
});

test('simple exact powers and one-opponent limits remain consistent',()=>{
  assert.equal(minimumZeroLossTrials(.5,.25),2);
  const balanced=minimumBalancedFieldZeroLossDesign({
    opponentCount:1,target:.995,alpha:.05
  });
  const simultaneous=minimumSimultaneousEveryMatchupZeroLossDesign({
    opponentCount:1,target:.995,alpha:.05
  });
  assert.equal(balanced.total,simultaneous.total);
  assert.equal(balanced.total,598);
});

test('invalid target, alpha and field size are rejected',()=>{
  for(const target of [-1,0,1,NaN,Infinity])
    assert.throws(()=>minimumZeroLossTrials(target,.05));
  for(const alpha of [-1,0,1,NaN,Infinity])
    assert.throws(()=>minimumZeroLossTrials(.995,alpha));
  for(const opponentCount of [0,-1,2.5,NaN,Infinity]){
    assert.throws(()=>minimumBalancedFieldZeroLossDesign({
      opponentCount,target:.995,alpha:.05
    }));
    assert.throws(()=>minimumSimultaneousEveryMatchupZeroLossDesign({
      opponentCount,target:.995,alpha:.05
    }));
  }
});
