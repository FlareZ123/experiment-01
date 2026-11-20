'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  openingStats, namedBasicOnlyGivenValid, pairedBonusStats, simulatePairedBonuses, buildReport
} = require('../scripts/agent30-opening-mulligan-opportunity.cjs');
const near = (a, b, e = 1e-12) =>
  assert.ok(Math.abs(a - b) <= e, String(a) + ' not within ' + String(e) + ' of ' + String(b));

test('five-Basic Iron Thorns opening is much less consistent than fourteen-Basic Shadow Rider', () => {
  const a = openingStats(5), b = openingStats(14);
  assert.equal(a.validProbabilityFraction, '370261/780216');
  assert.equal(b.validProbabilityFraction, '252032/292581');
  near(a.validProbability, 0.4745621725265824);
  near(b.validProbability, 0.8614093191287199);
  near(a.probabilityAtLeastTwoBasicsGivenValid, 0.2091389587345143);
  near(b.probabilityAtLeastTwoBasicsGivenValid, 0.6058236652488573);
  near(a.expectedSoloMulligans, 1.10720545777168);
  near(b.expectedSoloMulligans, 0.1608882998984256);
});

test('Mimikyu-only opening and Capture Energy recovery line are counted separately', () => {
  near(namedBasicOnlyGivenValid(5, 4), 0.15817220825309714);
  near(namedBasicOnlyGivenValid(5, 4, 2), 0.032912600909230316);
  const r = buildReport();
  near(r.probabilityMimikyuOnlyWithoutCaptureEnergyGivenValid, 0.12525960734386682);
});

test('paired setup respects simultaneous no-Basic resets and optional bonus draws', () => {
  const r = pairedBonusStats(5, 14);
  near(r.probabilityOpponentHasAnyBonusDrawOpportunity, 0.4881656474858669);
  near(r.probabilityCandidateHasAnyBonusDrawOpportunity, 0.0709354714082445);
  near(r.probabilityNeitherHasBonusDrawOpportunity, 0.4408988811058886);
  near(r.expectedMaximumOptionalBonusDrawsAvailableToOpponent, 1.0286653166788646);
  near(r.expectedMaximumOptionalBonusDrawsAvailableToCandidate, 0.08234815880561033);
  near(r.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent, 0.9463171578732544);
  near(r.probabilityOpponentHasAnyBonusDrawOpportunity +
    r.probabilityCandidateHasAnyBonusDrawOpportunity + r.probabilityNeitherHasBonusDrawOpportunity, 1);
});

test('exact model reproduces Agent 2 published 12-Basic versus four-Basic offer result', () => {
  const r = pairedBonusStats(12, 4);
  near(r.probabilityCandidateHasAnyBonusDrawOpportunity, 0.5488513367202532);
  near(r.expectedMaximumOptionalBonusDrawsAvailableToCandidate, 1.3738469358943621);
});

test('equal Basic counts produce symmetric bonus-draw opportunities', () => {
  const r = pairedBonusStats(14, 14);
  near(r.expectedMaximumOptionalBonusDrawsAvailableToOpponent,
    r.expectedMaximumOptionalBonusDrawsAvailableToCandidate);
  near(r.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent, 0);
});

test('seeded two-player setup simulation agrees with the exact formula', () => {
  const exact = pairedBonusStats(5, 14);
  const sim = simulatePairedBonuses(5, 14, 250000, 0x30a1c0de);
  near(sim.meanMaximumOptionalBonusDrawsAvailableToOpponent,
    exact.expectedMaximumOptionalBonusDrawsAvailableToOpponent, 0.012);
  near(sim.meanMaximumOptionalBonusDrawsAvailableToCandidate,
    exact.expectedMaximumOptionalBonusDrawsAvailableToCandidate, 0.006);
  near(sim.probabilityOpponentHasAnyBonusDrawOpportunity,
    exact.probabilityOpponentHasAnyBonusDrawOpportunity, 0.004);
  near(sim.probabilityCandidateHasAnyBonusDrawOpportunity,
    exact.probabilityCandidateHasAnyBonusDrawOpportunity, 0.002);
});


test('the 29 published Aichi lists have a complete Basic-count vector', () => {
  const r = buildReport();
  assert.equal(r.fieldVector.length, 29);
  assert.deepEqual(r.fieldSummary.missingRanks, [23, 25, 28]);
  assert.equal(r.fieldSummary.totalBasicCards, 355);
  assert.equal(r.fieldSummary.minOpponentBasicCount, 4);
  assert.equal(r.fieldSummary.maxOpponentBasicCount, 16);
  assert.equal(r.fieldSummary.opponentsWithPositiveDifference, 26);
  assert.equal(r.fieldSummary.opponentsWithNegativeDifference, 3);
  near(r.fieldSummary.meanOpponentBasicCount, 12.241379310344827);
  near(r.fieldSummary.meanMaximumOptionalBonusDrawsAvailableToOpponent, 0.9745041046859345);
  near(r.fieldSummary.meanMaximumOptionalBonusDrawsAvailableToCandidate, 0.20154347027323222);
  near(r.fieldSummary.meanMaximumOptionalBonusDrawOpportunityDifferenceForOpponent, 0.7729606344127024);
  for (const rank of [6, 24, 29]) {
    const row = r.fieldVector.find(x => x.rank === rank);
    assert.equal(row.basicCount, 4);
    assert.ok(row.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent < 0);
  }
});

test('fourteen-Basic Hood comparator is near field-neutral on mulligan opportunity', () => {
  const r = buildReport();
  assert.equal(r.fieldVectorHood.length, 29);
  near(r.fieldSummaryHood.meanMaximumOptionalBonusDrawsAvailableToOpponent, 0.1306613789434515);
  near(r.fieldSummaryHood.meanMaximumOptionalBonusDrawsAvailableToCandidate, 0.30401790240400356);
  near(r.fieldSummaryHood.meanMaximumOptionalBonusDrawOpportunityDifferenceForOpponent, -0.17335652346055203);
  assert.equal(r.fieldSummaryHood.opponentsWithPositiveDifference, 7);
  assert.equal(r.fieldSummaryHood.opponentsWithNegativeDifference, 16);
  assert.equal(r.fieldSummaryHood.opponentsWithEqualDifference, 6);
});

test('candidate Basic-count sensitivity crosses field-neutral between ten and eleven Basics', () => {
  const r = buildReport();
  const ten = r.candidateBasicSensitivity.find(x => x.candidateBasics === 10);
  const eleven = r.candidateBasicSensitivity.find(x => x.candidateBasics === 11);
  near(ten.meanMaximumOptionalBonusDrawOpportunityDifferenceForOpponent, 0.014607931918532506);
  near(eleven.meanMaximumOptionalBonusDrawOpportunityDifferenceForOpponent, -0.048201627786840257);
  assert.ok(ten.meanMaximumOptionalBonusDrawOpportunityDifferenceForOpponent > 0);
  assert.ok(eleven.meanMaximumOptionalBonusDrawOpportunityDifferenceForOpponent < 0);
});

test('report pins the two candidate inventories and evidence boundary', () => {
  const r = buildReport();
  assert.equal(r.candidate.basicCount, 5);
  assert.equal(r.candidate.basicComposition.reduce((n, x) => n + x.count, 0), 5);
  assert.equal(r.candidate.internationalExpandedEligibility, 'blocked-as-submitted');
  assert.equal(r.candidate.formatScopeConflict, true);
  assert.match(r.candidate.declaredPaperFormat, /Japanese Aichi/);
  assert.deepEqual(r.candidate.knownInternationalLegalityBlockers.map(x => x.printing), ['SMP NAN25', 'BWP 153']);
  assert.equal(r.opponent.basicCount, 14);
  assert.equal(r.opponent.basicComposition.reduce((n, x) => n + x.count, 0), 14);
  assert.equal(r.sameBasicCountAlternative.basicCount, 14);
  assert.equal(r.assumptions.mutualNoBasicResetDoesNotExecuteRulebookStep5d, true);
  assert.equal(r.assumptions.laterDrawsAndSearchNotModeled, true);
});
