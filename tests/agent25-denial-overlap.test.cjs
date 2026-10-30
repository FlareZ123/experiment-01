'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choose,conditionalCoheldProbability,rank6Overlap} =
  require('../simulation/evaluation/agent25-denial-overlap.cjs');

const rank6 = {total:60,basics:4,groupA:4,groupB:2,opening:7};

test('BigInt combinations preserve exact integer arithmetic', () => {
  assert.equal(choose(60,7), 386206920n);
  assert.equal(choose(8,3), 56n);
  assert.equal(choose(8,10), 0n);
});

test('rank6 coheld first seven conditional on Basic-valid opening', () => {
  const r=conditionalCoheldProbability({...rank6,oneDraw:false});
  assert.deepEqual([r.numerator,r.denominator],['612457','9643095']);
});

test('rank6 coheld by the first ordinary draw after a valid opening', () => {
  const r=conditionalCoheldProbability({...rank6,oneDraw:true});
  assert.deepEqual([r.numerator,r.denominator],['820454','9643095']);
  assert.ok(r.probability>0.08 && r.probability<0.09);
});

test('category exclusivity and physical cardinality are enforced', () => {
  assert.throws(()=>conditionalCoheldProbability({...rank6,basics:59,
    oneDraw:false}),isAssertionError);
  assert.throws(()=>conditionalCoheldProbability({...rank6,
    oneDraw:'yes'}),isAssertionError);
});

test('published rank6 original 60 is the measured input', () => {
  const r=rank6Overlap();
  assert.equal(r.rank,6);
  assert.equal(r.counts.groupA,4);
  assert.equal(r.counts.groupB,2);
  assert.equal(r.counts.basics,4);
  assert.equal(r.seven.numerator,'612457');
  assert.equal(r.sevenPlusOneDraw.numerator,'820454');
});

/** @param {unknown} error @returns {boolean} */
function isAssertionError(error) { return error instanceof assert.AssertionError; }
