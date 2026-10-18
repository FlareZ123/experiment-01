'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {inspectRank15PrizePrerequisites:inspect} =
  require('../simulation/twinleaf/rank15-prize-prereq.cjs');
const sample = ['Pidgeotto TEU','Guzma BUS','Budew ASC',
  'Grass Energy MEE','Fan Rotom SCR','Pidgey FLF'];

test('six Prize cards are required', () => {
  assert.throws(() => inspect([]), /6/);
});

test('no required printing Prized leaves the pre-Prize route physically eligible', () => {
  assert.equal(inspect(sample).beforeTakingPrizesEligible,true);
});

test('prizing either Oddish, Gloom or BUS is fatal before rescue', () => {
  for(const name of ['Oddish UNB','Gloom UNB','Vileplume BUS']) {
    assert.equal(inspect([name,...sample.slice(1)]).beforeTakingPrizesEligible,false);
  }
});

test('two AOR copies in Prizes is fatal but one is not', () => {
  assert.equal(inspect(['Vileplume AOR','Vileplume AOR',...sample.slice(2)])
    .beforeTakingPrizesEligible,false);
  assert.equal(inspect(['Vileplume AOR',...sample.slice(1)])
    .beforeTakingPrizesEligible,true);
});
