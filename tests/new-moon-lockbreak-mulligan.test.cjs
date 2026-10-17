'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {conditionalAccess,main} = require('../scripts/new-moon-lockbreak-mulligan.cjs');
const {directByFirstDraw} = require('../scripts/new-moon-lockbreak-access.cjs');

test('Zero target cards are never discovered despite mulligan bonus cards', () => {
  const row = conditionalAccess(4,17,0);
  assert.equal(row.directByFirstDraw,0);
  assert.equal(row.withAllOptionalBonusCards,0);
});

test('First-draw marginal without bonus matches independent exact BigInt model', () => {
  for (const count of [0,1,2,3,4]) {
    const a = conditionalAccess(4,17,count).directByFirstDraw;
    const b = directByFirstDraw(17,count).probability;
    assert.ok(Math.abs(a-b)<1e-12, 'Distinct ways of counting first-draw mismatch for '+count);
  }
});

test('Four-Basic Aichi Thorns opening specifically lifts two counter copies', () => {
  const two = conditionalAccess(4,17,2);
  const four = conditionalAccess(4,17,4);
  assert.ok(Math.abs(two.directByFirstDraw-0.2437645937686035)<1e-12);
  assert.ok(Math.abs(two.withAllOptionalBonusCards-0.28470708524981614)<1e-12);
  assert.ok(Math.abs(four.withAllOptionalBonusCards-0.4922956622452833)<1e-12);
  assert.ok(Math.abs(two.chanceAtLeastOneBonus-0.5794279437440825)<1e-12);
  assert.ok(Math.abs(two.chanceAtLeastThreeBonus-0.2088872810284781)<1e-12);
  assert.ok(two.extremeKAtLeast47Tail<1e-9);
});

test('Fixed source and source-mapped variant never become game-winning claims', () => {
  const data=main();
  assert.deepEqual(data.benchmarkOpponentRanks,[6,24,29]);
  assert.equal(data.sourcePrintHash,'4dd537adbf73d89e50215b3d056a9f40d474f05b79e33774c281a30079e1ce95');
  assert.equal(data.candidatePrintHash,'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(data.rows[0].eitherCounter.withAllOptionalBonusCards,0);
  assert.equal(data.rows[1].eitherCounter.withAllOptionalBonusCards>data.rows[1].cologne.withAllOptionalBonusCards,true);
  assert.match(data.limits,/not legal Cologne use/);
});
