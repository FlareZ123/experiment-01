'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,ratio,sourceCounts,study}=
  require('../scripts/agent46-champion-copycat-prize-frontier.cjs');

test('Exact BigInt binomial and rational identities',()=>{
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(14,15),0n);
  assert.equal(choose(0,0),1n);
  assert.deepEqual(ratio(3n,12n),{
    numerator:'1',denominator:'4',probability:0.25,percent:25
  });
});

test('Original champion source multiplicities have exactly fourteen Basic Pokemon',()=>{
  const counts=sourceCounts();
  assert.equal(counts.sourceRank,1);
  assert.equal(counts.sourceSize,60);
  assert.equal(counts.basicPokemonCount,14);
  assert.equal(counts.threeDistinctRequiredBasicSingletons,3);
  assert.equal(counts.requiredClefairyCopies,2);
  assert.equal(counts.heavyBallCopies,1);
  assert.equal(counts.otherBasics,9);
  assert.equal(counts.otherNonbasics,45);
});

test('Legal-opening conditional reproduces independently derived exact pair and extends it',()=>{
  const out=study();
  assert.equal(out.earlierMimikyuDialgaBaselineUnreachable.numerator,
    '139744719');
  assert.equal(out.earlierMimikyuDialgaBaselineUnreachable.denominator,
    '5904101632');
  assert.equal(out.fullExactPayloadStructurallyBlocked.numerator,
    '11638172101');
  assert.equal(out.fullExactPayloadStructurallyBlocked.denominator,
    '248618029660');
  assert.ok(Math.abs(out.legalInitialOpening.probability-
    0.8614093191287199)<1e-12);
  assert.ok(Math.abs(out.fullExactPayloadStructurallyBlocked.percent-
    4.681145658227561)<1e-10);
  assert.ok(Math.abs(out.additionalBlockBeyondEarlierPair.percent-
    2.31423655485798)<1e-10);
  assert.equal(out.noNaturalLineProbabilityInferred,true);
  assert.equal(out.competitivelyQualifiedGames,0);
});
