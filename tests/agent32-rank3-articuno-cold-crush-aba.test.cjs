'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {
  schedule,
  sourceCountsFromManifest,
  summarize,
  panelAcceptance
} = require('../simulation/evaluation/agent32-rank3-articuno-cold-crush-aba.cjs');

test('source printing counts come from the authenticated rank-3 manifest', () => {
  assert.deepEqual(sourceCountsFromManifest(), {
    articunoCES31: 1,
    basicWater: 2,
    captureEnergy: 3
  });
});

test('the preregistered panel contains 48 attempts and 16 complete A/B/A groups', () => {
  const rows = schedule();
  assert.equal(rows.length, 48);
  assert.equal(new Set(rows.map(row => row.id)).size, 48);
  const groups = new Map();
  for (const row of rows) {
    const key = row.candidateSeat + ':' + row.seed;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row.variant);
  }
  assert.equal(groups.size, 16);
  for (const variants of groups.values()) {
    assert.deepEqual(variants, [
      'A-observe', 'B-intervene', 'A-repeat-observe'
    ]);
  }
});

function row(variant, overrides = {}) {
  return {
    trial: {candidateSeat: 0, seed: 290146, variant},
    status: 'native-terminal',
    nativeWinner: 0,
    nativeActions: 100,
    nativeTurn: 4,
    actualStarterSeat: 1,
    sourceActuallyFirst: true,
    firstStartVerified: true,
    rootActionLedgerSha256: variant === 'B-intervene' ? 'ledger-b' : 'ledger-a',
    attackDeclarationSha256: variant === 'B-intervene' ? 'attacks-b' : 'attacks-a',
    publicAttackTransitionsSha256: variant === 'B-intervene' ? 'transitions-b' : 'transitions-a',
    fullInitialDealSha256: 'full-deal',
    sourceInitialDealSha256: 'source-deal',
    articunoAudit: {confirmEvents: [], coldCrushAttackEvents: []},
    ...overrides
  };
}

test('a complete matched A/B/A group passes both deal fingerprints and repeat-control checks', () => {
  const rows = [
    row('A-observe'),
    row('B-intervene'),
    row('A-repeat-observe')
  ];
  const summary = summarize(rows);
  assert.equal(summary.matchedDealGroups, 1);
  assert.equal(summary.matchedInitialDeals, 1);
  assert.equal(summary.matchedSourceDeals, 1);
  assert.equal(summary.completeAbaGroups, 1);
  assert.equal(summary.reproducibleObserveGroups, 1);
  assert.equal(panelAcceptance(summary, 1, 3).passed, true);
});

test('a source-deal fingerprint mismatch fails even when full-deal fingerprints match', () => {
  const rows = [
    row('A-observe'),
    row('B-intervene', {sourceInitialDealSha256: 'wrong-source-deal'}),
    row('A-repeat-observe')
  ];
  const summary = summarize(rows);
  assert.equal(summary.matchedInitialDeals, 1);
  assert.equal(summary.matchedSourceDeals, 0);
  assert.equal(panelAcceptance(summary, 1, 3).passed, false);
});

test('an A/A repeat trace mismatch fails the matched panel', () => {
  const rows = [
    row('A-observe'),
    row('B-intervene'),
    row('A-repeat-observe', {rootActionLedgerSha256: 'different-ledger'})
  ];
  const summary = summarize(rows);
  assert.equal(summary.reproducibleObserveGroups, 0);
  assert.equal(panelAcceptance(summary, 1, 3).passed, false);
});

test('an unverified first player fails the matched panel', () => {
  const rows = [
    row('A-observe'),
    row('B-intervene', {firstStartVerified: false}),
    row('A-repeat-observe')
  ];
  const summary = summarize(rows);
  assert.equal(summary.firstStartUnverifiedRows, 1);
  assert.equal(panelAcceptance(summary, 1, 3).passed, false);
});

test('missing A/B/A arm fails the matched panel', () => {
  const rows = [row('A-observe'), row('B-intervene')];
  const summary = summarize(rows);
  assert.equal(summary.completeAbaGroups, 0);
  assert.equal(panelAcceptance(summary, 1, 2).passed, false);
});
