'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { executeDiagnostic, observedFirstTurn } =
  require('../simulation/evaluation/aichi-campaign-execute.cjs');
const { loadDefaultCampaign } = require('../scripts/aichi-comparison-campaign.cjs');

function sampleGame(request, override = {}) {
  return {
    finished: true, winner: 0, firstTurnSlot: 1,
    firstTurnPlayerId: 202, firstTurnPlayerName: 'research-B',
    firstDrawLogName: 'research-B', verifiedByDrawLog: true,
    actions: 30, turns: 3, endReason: 'engine-game-end',
    engine: 'pinned-test', policy: 'synthetic-unqualified',
    seed: request.seed ?? 0,
    deckHashes: [request.deckA || cards, request.deckB || cards].map(deck =>
      createHash('sha256').update(JSON.stringify(deck)).digest('hex')),
    rules: {format: 'EXPANDED'}, attackTrace: [{seat: 0, turn: 2}],
    actionCounts: { AttackAction: 1 }, ...override
  };
}

const cards = Array(60).fill('SYNTHETIC CARD');
function run(options = {}) {
  const campaign = loadDefaultCampaign();
  return executeDiagnostic({
    campaign, ranks: [6], maxActions: 30,
    policyFlags: options.policyFlags || {},
    resolvePair: trial => ({ candidateDigest: trial.candidateDigest,
      opponentDigest: trial.opponentDigest,
      candidateCards: cards, opponentCards: cards }),
    runMatch: options.runMatch || (r => sampleGame(r))
  });
}

test('exact fixed-candidate pilot schedule produces 6 attributed records with no win-rate', () => {
  const result = run();
  assert.equal(result.totalScheduled, 6);
  assert.equal(result.records.length, 6);
  assert.equal(result.counts['completed-engine-game'], 6);
  assert.equal(result.strengthClaimPermitted, false);
  assert.equal(result.engineAndPolicyQualified, false);
  assert.equal(Object.hasOwn(result, 'winRate'), false);
  assert.deepEqual(new Set(result.records.map(r => r.candidateId)),
    new Set(['champion-reference', 'hood-shield-v1', 'temple-v1']));
  assert.deepEqual(new Set(result.records.map(r => r.candidateEngineSlot)),
    new Set(['A', 'B']));
  assert.equal(result.records[0].candidateActualTurn, 'second');
  assert.equal(result.records[1].candidateActualTurn, 'first');
  assert.ok(result.records[0].qualityFlags.includes('zero-candidate-attacks') === false);
  assert.ok(result.records[1].qualityFlags.includes('zero-candidate-attacks'));
});

test('unverified turn never silently becomes a completed match', () => {
  const result = run({ runMatch: r => sampleGame(r, {firstDrawLogName: 'wrong'}) });
  assert.equal(result.counts['unverified-first-turn'], 6);
  assert.equal(result.records[0].candidateActualTurn, 'unverified');
  assert.equal(result.records[0].turnEvidence, null);
  assert.equal(observedFirstTurn(sampleGame({}, {firstTurnPlayerId: 101})), null);
});

test('incomplete and exception games retain failure classifications', () => {
  let i = 0;
  const result = run({ runMatch: r => {
    i += 1;
    if (i === 1) return sampleGame(r, {finished: false, winner: -1});
    throw new Error('upstream policy stalled');
  } });
  assert.equal(result.counts['unfinished-engine-game'], 1);
  assert.equal(result.counts['engine-exception'], 5);
  assert.match(result.records[1].error, /stalled/);
});

test('blocked resolution is explicit and never dispatched', () => {
  const campaign = loadDefaultCampaign();
  const result = executeDiagnostic({
    campaign, ranks: [1],
    resolvePair: t => ({ candidateDigest: t.candidateDigest,
      opponentDigest: t.opponentDigest, candidateCards: null,
      opponentCards: cards, blockers: ['unmapped source printing'] }),
    runMatch: () => { throw new Error('must not run'); }
  });
  assert.equal(result.counts['blocked-deck-resolution'], 6);
  assert.deepEqual(result.records[0].blockers, ['unmapped source printing']);
});

test('invalid pilot ranks, plan identity mismatches and repeated trials are rejected', () => {
  assert.throws(() => executeDiagnostic({campaign:loadDefaultCampaign(),ranks:[23],
    resolvePair:()=>null,runMatch:()=>null}), /pilot ranks/);
  const campaign = loadDefaultCampaign();
  const t = campaign.trials.find(t=>t.phase==='pilot');
  campaign.trials.push(t);
  assert.throws(() => executeDiagnostic({campaign,ranks:[1],
    resolvePair:()=>null,runMatch:()=>null}), /Incomplete or repeated/);
  const output = executeDiagnostic({campaign:loadDefaultCampaign(),ranks:[6],
    resolvePair: () => ({candidateDigest:'wrong',opponentDigest:'wrong',
      candidateCards:cards,opponentCards:cards}),
    runMatch:()=>{throw new Error('must not run');}});
  assert.equal(output.counts['engine-exception'], 6);
  assert.match(output.records[0].error,/identity differs/);
});

test('reported seed mismatch cannot be counted as a finished fixed-plan game', () => {
  const result = run({runMatch: r => sampleGame(r, {seed: r.seed + 1})});
  assert.equal(result.counts['unverified-game-identity'], 6);
  assert.equal(result.counts['completed-engine-game'] || 0, 0);
  assert.equal(result.records[0].observedSeed, result.records[0].seed + 1);
});

test('ordered deck fingerprints are verified before first-turn classification', () => {
  const badHashes = ['forged-candidate', 'forged-opponent'];
  const result = run({runMatch: r => sampleGame(r, {deckHashes: badHashes})});
  assert.equal(result.counts['unverified-game-identity'], 6);
  assert.deepEqual(result.records[0].observedDeckHashes, badHashes);
  assert.equal(result.records[0].expectedDeckHashes.length, 2);
});

test('the simulator must attest to Expanded rules for a qualifying terminal game', () => {
  const result = run({runMatch: r => sampleGame(r, {rules: {format: 'STANDARD'}})});
  assert.equal(result.counts['unverified-game-environment'], 6);
  assert.equal(result.counts['completed-engine-game'] || 0, 0);
});

test('policy flags cannot override fixed plan decks, seeds or action budgets', () => {
  const campaign = loadDefaultCampaign();
  const base = {
    campaign, ranks: [6],
    resolvePair: () => {throw new Error('must reject before resolution');},
    runMatch: () => {throw new Error('must not dispatch');}
  };
  for (const invalid of [
    {seed: 1}, {deckA: cards}, {maxActions: 1},
    {strictPromptValidation: 'yes'}, null, []
  ]) {
    assert.throws(() => executeDiagnostic({...base, policyFlags: invalid}), /policyFlags/);
  }
});


test('requested chronological action capture is hashed and attributed', () => {
  const trace = [
    {actionOrdinal: 1, turnBefore: 1, turnAfter: 1, playerSlot: 0,
      action: 'PlayCardAction', card: 'Guzma & Hala',
      prizesAfter: [6, 6], decksAfter: [45, 44]},
    {actionOrdinal: 5, turnBefore: 1, turnAfter: 2, playerSlot: 0,
      action: 'AttackAction', attack: 'Volt Cyclone',
      prizesAfter: [6, 6], decksAfter: [43, 43]}
  ];
  const output = run({
    policyFlags: {captureDecisionTrace: true},
    runMatch: request => {
      assert.equal(request.captureDecisionTrace, true);
      return sampleGame(request, {decisionTrace: trace});
    }
  });
  assert.equal(output.counts['completed-engine-game'], 6);
  for (const record of output.records) {
    assert.deepEqual(record.traceSummary.chronologicalActionTrace, trace);
    assert.equal(record.traceSummary.capturedMeaningfulActions, 2);
    assert.equal(record.traceSummary.coversAllActionsAndPromptResolutions, false);
    assert.equal(record.traceSummary.chronologicalActionTraceSha256,
      createHash('sha256').update(JSON.stringify(trace)).digest('hex'));
  }
});


test('missing requested history prevents a completed status', () => {
  const result = run({policyFlags: {captureDecisionTrace: true}});
  assert.equal(result.counts['unverified-decision-trace'], 6);
  assert.equal(result.counts['completed-engine-game'] || 0, 0);
  assert.equal(result.records[0].traceSummary.chronologicalActionTrace, null);
});
