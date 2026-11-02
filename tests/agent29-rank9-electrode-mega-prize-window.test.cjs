'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { ROLES, prizeWindow, exhaustiveFiveEnergyProfiles, rank9FromSource } =
  require('../scripts/agent29-rank9-electrode-mega-prize-window.cjs');

test('original rank9 printed role counts and Basic count source-bound', () => {
  const r = rank9FromSource();
  assert.equal(r.sourceRank, 9);
  assert.equal(r.sourceArchetype, 'Absol Electrode');
  assert.equal(r.printedBasicCount, 11);
  assert.deepEqual(r.printedRoleCounts, ROLES);
  assert.equal(r.countsAnyNativeOrCompetitiveGame, false);
});

test('exact conditional 6-Prize resource window matches independent rational enumeration', () => {
  const r = prizeWindow();
  assert.equal(r.legalFirstSeven.numerator, '1137524');
  assert.equal(r.legalFirstSeven.denominator, '1462905');
  assert.equal(r.prerequisiteAvailabilityGivenLegalFirstSeven.numerator,
    '55714362486839');
  assert.equal(r.prerequisiteAvailabilityGivenLegalFirstSeven.denominator,
    '70349762271360');
  assert.ok(r.prerequisiteAvailabilityGivenLegalFirstSeven.probability > 0.79);
  assert.ok(r.prerequisiteAvailabilityGivenLegalFirstSeven.probability < 0.80);
  assert.equal(r.countsPrizeRecovery, false);
  assert.equal(r.countsEvolutionOrTiming, false);
});

test('disjoint conditional/unconditional exact weighted probabilities conserve', () => {
  const r = prizeWindow();
  const multiply = p => BigInt(p.numerator);
  const denom = p => BigInt(p.denominator);
  const a = r.prerequisiteAvailabilityGivenLegalFirstSeven;
  const b = r.prerequisiteAvailabilityUnconditionalFirstSeven;
  const c = r.legalFirstSeven;
  assert.equal(multiply(a) * multiply(c) * denom(b),
    multiply(b) * denom(a) * denom(c));
});

test('source physical five-Energy subsets exhaust 21 cards and each can pay 2 Darkness',()=>{
  const packet=exhaustiveFiveEnergyProfiles();
  assert.equal(packet.profiles.length,5);
  assert.equal(packet.physicalSubsets,21);
  assert.deepEqual(packet.profiles.map(p=>[p.prism,p.darkness,p.telepathic,p.physicalSubsets]),[
    [2,2,1,6],[3,1,1,8],[3,2,0,4],[4,0,1,1],[4,1,0,2]
  ]);
  assert.ok(packet.profiles.every(p=>p.blackRequiredPayable===true &&
    p.prism>=2));
  assert.equal(packet.allPayable,true);
  assert.deepEqual(rank9FromSource().completeFiveEnergyPayment,packet);
});
