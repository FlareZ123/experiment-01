'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const model = require('../scripts/agent11-rank10-last-bench-mulligan-bound.cjs');

/** @param {number} actual @param {number} expected */
function approx(actual, expected) {
  assert.ok(Math.abs(actual-expected) < 1e-12,
    'Expected '+expected+', received '+actual);
}

test('exact BigInt binomial boundary and direct rank-10 starting seven', () => {
  assert.equal(model.choose(60,7),386206920n);
  assert.equal(model.choose(5,6),0n);
  assert.equal(model.choose(3,-1),0n);
  approx(model.conditionalEvent(7,2),0.04714352107357597);
  approx(model.conditionalEvent(7,7),0.0000081947660882799);
});

test('extra natural card draws preserve the exact two threshold probabilities', () => {
  approx(model.conditionalEvent(8,2),0.061214744241438405);
  approx(model.conditionalEvent(8,7),0.000057129359306073394);
  approx(model.conditionalEvent(10,7),0.0006469759133174366);
});

test('simultaneous mulligan handling avoids false geometric bonus attribution', () => {
  approx(model.bonusProbability(0),0.4298279743398403);
  approx(model.bonusProbability(1),0.22778351086131168);
  const mass = Array.from({length:40},(_,k)=>model.bonusProbability(k))
    .reduce((sum,p)=>sum+p,0);
  assert.ok(mass > 0.999999998 && mass <= 1);
});

test('max-bonus pre-search upper-envelope reproduces independent enumeration', () => {
  const setup = model.openingEnvelope(0);
  const afterFirstDraw = model.openingEnvelope(1);
  approx(setup.coheldProbabilityLower,0.06900332226689027);
  approx(setup.sevenBasicsProbabilityLower,0.0010673692848246897);
  approx(afterFirstDraw.coheldProbabilityLower,0.08425683375443278);
  approx(afterFirstDraw.sevenBasicsProbabilityLower,0.001774486128442847);
  assert.ok(setup.residualMassUpper < 3e-11);
  assert.ok(afterFirstDraw.residualMassUpper < 4e-11);
});
