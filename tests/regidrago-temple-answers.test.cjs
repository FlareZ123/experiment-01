'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choose,exactOpeningResponse,regidragoTempleResponses} =
  require('../scripts/regidrago-temple-answers.cjs');

/** Independent enumeration of unordered opening hands and their next draw. */
function bruteCategories(cards, opening) {
  let numerator = 0;
  let denominator = 0;
  /** @param {number[]} indices @param {number} next */
  function inspect(indices, next) {
    const hand = indices.map(i => cards[i]);
    const valid = hand.includes('R') || hand.includes('B');
    if (!valid) return;
    const counter = hand.includes('U') || cards[next] === 'U';
    const liveMarshadow = (hand.includes('R') && hand.includes('B')) ||
      cards[next] === 'R';
    denominator++;
    if (counter || liveMarshadow) numerator++;
  }
  /** @param {number[]} indices @param {number} start */
  function collect(indices, start) {
    if (indices.length === opening) {
      for (let i = 0; i < cards.length; i++) {
        if (!indices.includes(i)) inspect(indices,i);
      }
      return;
    }
    for (let i = start; i < cards.length; i++) {
      collect([...indices,i],i+1);
    }
  }
  collect([],0);
  return numerator / denominator;
}

test('integer combinatorics and input guards', () => {
  assert.equal(choose(60,7).toString(),'386206920');
  assert.equal(choose(6,3),20n);
  assert.equal(choose(2,7),0n);
  assert.throws(() => exactOpeningResponse({basics:0,outs:1}),RangeError);
  assert.throws(() => exactOpeningResponse({basics:10,outs:50,marshadow:11}),RangeError);
});

test('independent exhaustive small-deck exact response', () => {
  for (const cards of [
    ['U','R','B','B','N','N','N','N'],
    ['R','B','B','N','N','N','N','N'],
    ['U','B','B','N','N','N','N','N'],
    ['U','R','B','N','N','N','N','N'],
    ['B','B','N','N','N','N','N','N']
  ]) {
    const actual = exactOpeningResponse({
      size:cards.length,opening:3,basics:cards.filter(x=>x==='R'||x==='B').length,
      outs:cards.filter(x=>x==='U').length,marshadow:cards.filter(x=>x==='R').length
    });
    assert.ok(Math.abs(actual.probability - bruteCategories(cards,3)) < 1e-13,
      JSON.stringify(cards));
  }
});

test('exactly nine source-published Regidrago ranks and counter counts', () => {
  const report = regidragoTempleResponses();
  assert.deepEqual(report.rows.map(r=>r.rank),[10,12,13,14,18,20,21,27,32]);
  assert.deepEqual(report.rows.map(r=>r.basics),[15,15,11,14,16,14,14,15,13]);
  assert.deepEqual(report.rows.map(r=>r.stadiums),[1,2,2,1,3,2,2,2,2]);
  assert.deepEqual(report.rows.map(r=>r.removalItems),[0,1,1,1,0,1,1,0,1]);
  assert.deepEqual(report.rows.map(r=>r.faba),[1,0,0,0,0,0,0,0,0]);
  assert.deepEqual(report.rows.map(r=>r.marshadow),[1,1,0,1,1,1,1,1,0]);
});

test('reproduce isolated first-eight response probabilities', () => {
  const rows = regidragoTempleResponses().rows;
  const lookup = rank => rows.find(x=>x.rank===rank);
  assert.ok(Math.abs(lookup(10).includingBenchMarshadow - 0.2389716155)<1e-10);
  assert.ok(Math.abs(lookup(10).includingFabaSupporter - 0.3401734791)<1e-10);
  assert.ok(Math.abs(lookup(18).includingBenchMarshadow - 0.4312197517)<1e-10);
  assert.ok(Math.abs(lookup(13).includingBenchMarshadow - 0.3375910028)<1e-10);
  for (const row of rows) {
    assert.ok(row.stadiumOnly <= row.stadiumOrItem);
    assert.ok(row.stadiumOrItem <= row.includingBenchMarshadow);
    assert.ok(row.includingBenchMarshadow <= row.includingFabaSupporter);
  }
});
