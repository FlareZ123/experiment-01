'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {registered, summarize, analyzePairs, REG_PATH} =
  require('../../simulation/evaluation/2026-11/agent50-rank5-lillie-gengar-fresh-eight.cjs');

const reg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../..', REG_PATH), 'utf8'));

test('frozen eight distinct rank-5 source deals, four candidate starts per seat', () => {
  const rows = registered(reg);
  assert.equal(rows.length, 8);
  assert.equal(new Set(rows.map(x => x.seed)).size, 8);
  assert.equal(rows.filter(x => x.candidateSlot === 'A').length, 4);
  assert.equal(rows.filter(x => x.candidateSlot === 'B').length, 4);
  assert.ok(!rows.some(x => x.seed === 3861605836),
    'Previous revealed source-release deal cannot enter fresh cohort');
});

test('registration refuses a duplicated physical seed', () => {
  const altered = structuredClone(reg);
  altered.registeredTrials[1].seed = altered.registeredTrials[0].seed;
  assert.throws(() => registered(altered), /fresh unique seeds/);
});

test('A-seat source/candidate mapping comes from actual trial', () => {
  const trial = reg.registeredTrials[0];
  const r = {phase: 'Lillie-plus-Gengar', nativeFinished: true,
    nativeWinner: 0, nativeError: null, remainingPrizes: [2, 0],
    physicalIntegrity: true, sourceFingerprint: 'source',
    fullFingerprint: 'full', rootLedgerSha256: 'hash',
    roots: [
      {playerSlot: 0, action: 'PlayCardAction',
        card: "Lillie's Determination", actionOrdinal: 2, turnBefore: 4},
      {playerSlot: 0, action: 'AttackAction',
        attack: 'Poltergeist', actionOrdinal: 5, turnBefore: 8},
      {playerSlot: 1, action: 'AttackAction',
        attack: 'Cross Fusion Strike', actionOrdinal: 6, turnBefore: 9}
    ]};
  const s = summarize(r, trial);
  assert.equal(s.candidateSeat, 0);
  assert.equal(s.sourceSeat, 1);
  assert.equal(s.candidateWon, true);
  assert.equal(s.firstAcceptedLillie.root, 2);
  assert.deepEqual(s.candidateAttacks.map(x => x.attack), ['Poltergeist']);
  assert.deepEqual(s.sourceAttacks.map(x => x.attack), ['Cross Fusion Strike']);
});

test('B-seat native game loss and censored game are separate statuses', () => {
  const trial = reg.registeredTrials[1];
  const terminal = summarize({phase: 'Lillie-only', nativeFinished: true,
    nativeWinner: 0, roots: [], nativeError: null}, trial);
  const censored = summarize({phase: 'Lillie-only', nativeFinished: false,
    nativeWinner: null, roots: [], nativeError: null}, trial);
  assert.equal(terminal.candidateSeat, 1);
  assert.equal(terminal.candidateWon, false);
  assert.equal(terminal.status, 'native-terminal');
  assert.equal(censored.candidateWon, null);
  assert.equal(censored.status, 'root-censored');
});

test('sharp paired win envelope retains the unresolved censor interval', () => {
  const pairs = [
    {sameInitialPhysicalDeal: true,
      control: {candidateWon: false}, treatment: {candidateWon: true}},
    {sameInitialPhysicalDeal: true,
      control: {candidateWon: null}, treatment: {candidateWon: true}},
    {sameInitialPhysicalDeal: true,
      control: {candidateWon: true}, treatment: {candidateWon: null}}
  ];
  const out = analyzePairs(pairs);
  assert.equal(out.preregisteredPairs, 3);
  assert.equal(out.fullyTerminalMatchedPairs, 1);
  assert.deepEqual(out.sharpCandidateWinDifferenceEnvelopeOnMatchedPairs, [0, 2]);
  assert.equal(out.completedWinnerReversalsControlToTreatment, 1);
});

test('unmatched initial physical deals never become causal pairs', () => {
  const out = analyzePairs([
    {sameInitialPhysicalDeal: false,
      control: {candidateWon: false}, treatment: {candidateWon: true}}
  ]);
  assert.deepEqual(out.sharpCandidateWinDifferenceEnvelopeOnMatchedPairs, [0, 0]);
  assert.equal(out.matchedInitialPhysicalPairs, 0);
  assert.equal(out.unmatchedInitialPhysicalPairs, 1);
  assert.equal(out.allPairsPhysicallyMatched, false);
});
