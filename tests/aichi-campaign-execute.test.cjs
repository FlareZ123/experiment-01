'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
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
    deckHashes: ['a', 'b'], attackTrace: [{seat: 0, turn: 2}],
    actionCounts: { AttackAction: 1 }, ...override
  };
}

const cards = Array(60).fill('SYNTHETIC CARD');
function run(options = {}) {
  const campaign = loadDefaultCampaign();
  return executeDiagnostic({
    campaign, ranks: [6], maxActions: 30,
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
