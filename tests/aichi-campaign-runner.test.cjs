'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { buildCampaign } = require('../scripts/aichi-comparison-campaign.cjs');
const {
  verifyCampaign, turnProof, executeCampaign
} = require('../simulation/evaluation/aichi-campaign-runner.cjs');

/** @param {unknown} value @returns {string} */
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @param {string} name */
const card = name => ({
  name, count: 60, printing: { set: 'SYN', number: '1', language: 'en' }
});

/** @returns {object} */
function fixture() {
  const field = Array.from({ length: 32 }, (_, i) => ({
    rank: i + 1, player: 'P' + (i + 1),
    archetype: 'Synthetic', published: i < 2
  }));
  const source = { decks: field.slice(0, 2).map(f => ({
    ...f, cards: [card('Opponent-' + f.rank)]
  })) };
  const candidates = [
    { id: 'reference', referenceOnly: true, cards: [card('Reference')] },
    { id: 'other', cards: [card('Other')] }
  ];
  const campaign = buildCampaign({
    field, source, candidates, pilotRanks: [1, 2], repeats: 1,
    seedBase: 20261016
  });
  return { field, source, candidates, campaign };
}

/** @param {object} candidate */
function prepare(candidate) {
  return {
    candidate: { cards: Array(60).fill('candidate-' + candidate.id),
      unresolved: [], substitutions: [] },
    opponents: [1, 2].map(rank => ({
      rank, status: 'ready', cards: Array(60).fill('opponent-' + rank),
      substitutions: []
    }))
  };
}

/** @param {object} request */
function finished(request) {
  const firstTurnSlot = 0;
  return {
    finished: true, winner: 0, seed: request.seed, endReason: 'engine-game-end',
    verifiedByDrawLog: true, firstTurnSlot,
    firstTurnPlayerId: 101, firstTurnPlayerName: 'research-A',
    firstDrawLogName: 'research-A',
    deckHashes: [digest(request.deckA), digest(request.deckB)],
    actions: 7, turns: 2
  };
}

test('reconstructs full schedule and fails closed on altered source inventory', () => {
  const f = fixture();
  assert.equal(verifyCampaign(f).planDigest, f.campaign.planDigest);
  const tampered = fixture();
  tampered.candidates[0].cards = [card('Forgery')];
  assert.throws(() => verifyCampaign(tampered), /mismatch/);
  const altered = fixture();
  altered.campaign.trials[0].seed += 1;
  // A reconstructed digest check alone does not inspect caller-mutated trials:
  // the campaign runner must consume the immutable reconstructed schedule.
  assert.equal(verifyCampaign(altered).trials[0].seed, f.campaign.trials[0].seed);
});

test('same seed, both engine slots, verified real turn order and deck hashes', () => {
  const f = fixture();
  const calls = [];
  const result = executeCampaign(f, {
    maxTrials: 2, prepareCandidate: prepare,
    runMatch(request) { calls.push(request); return finished(request); }
  });
  assert.equal(result.recordedTrials, 2);
  assert.equal(result.competitiveWinRateCertified, false);
  assert.deepEqual(result.records.map(r => r.candidateEngineSlot), ['A', 'B']);
  assert.equal(calls[0].seed, calls[1].seed);
  assert.deepEqual(result.records.map(r => r.candidateTrueTurn), ['first', 'second']);
  assert.deepEqual(result.records.map(r => r.winner), ['candidate', 'opponent']);
  assert.ok(result.records.every(r => r.status === 'completed'));
  assert.deepEqual(result.selectedTrialIds, result.records.map(r => r.trialId));
  assert.equal(calls[0].strictPromptValidation, true);
  assert.equal(calls[0].isolatePolicyRandomness, true);
});

test('trial identity and explicit budget cannot silently expand or reorder', () => {
  const f = fixture();
  assert.throws(() => executeCampaign(f, {
    maxTrials: 1, trialIds: f.campaign.trials.slice(0, 2).map(x => x.trialId),
    prepareCandidate: prepare, runMatch: finished
  }), /budget/);
  assert.throws(() => executeCampaign(f, {
    trialIds: ['pilot:23:0:reference:A'],
    prepareCandidate: prepare, runMatch: finished
  }), /scheduled/);
  assert.throws(() => executeCampaign(f, {
    phase: 'unknown', prepareCandidate: prepare, runMatch: finished
  }), /phase/);
  const selected = f.campaign.trials.filter(x => x.phase === 'pilot')[3];
  const result = executeCampaign(f, {
    maxTrials: 1, trialIds: [selected.trialId],
    prepareCandidate: prepare, runMatch: finished
  });
  assert.deepEqual(result.selectedTrialIds, [selected.trialId]);
});

test('terminal match with missing true-start proof cannot be a completed record', () => {
  const f = fixture();
  const result = executeCampaign(f, {
    maxTrials: 1, prepareCandidate: prepare,
    runMatch(request) {
      return { ...finished(request), firstDrawLogName: 'wrong' };
    }
  });
  assert.equal(result.records[0].status, 'unverified-first-turn');
  assert.equal(result.records[0].winner, null);
  assert.equal(turnProof(finished({
    deckA: Array(60).fill('A'), deckB: Array(60).fill('B')
  })).verifiedByDrawLog, true);
});

test('engine deck substitution, unsupported resolution and exceptions remain failures', () => {
  const f = fixture();
  const mismatch = executeCampaign(f, {
    maxTrials: 1, prepareCandidate: prepare,
    runMatch(request) {
      return { ...finished(request), deckHashes: [digest('replaced'), digest(request.deckB)] };
    }
  });
  assert.equal(mismatch.records[0].status, 'engine-deck-mismatch');
  assert.equal(mismatch.records[0].winner, null);
  const blocked = executeCampaign(f, {
    maxTrials: 1, prepareCandidate(candidate) {
      const plan = prepare(candidate);
      plan.opponents[0].status = 'unresolved-printings';
      plan.opponents[0].cards = null;
      plan.opponents[0].unresolved = ['unavailable'];
      return plan;
    },
    runMatch() { throw new Error('must not run'); }
  });
  assert.equal(blocked.records[0].status, 'blocked-resolution');
  assert.deepEqual(blocked.records[0].opponentUnresolved, ['unavailable']);
  const thrown = executeCampaign(f, {
    maxTrials: 1, prepareCandidate: prepare,
    runMatch() { throw new Error('synthetic engine failure'); }
  });
  assert.equal(thrown.records[0].status, 'engine-exception');
  assert.match(thrown.records[0].error, /synthetic engine failure/);
});

test('scheduled decks, seeds and fixed validation cannot be overridden', () => {
  const f = fixture();
  for (const illegal of [
    { seed: 17 }, { deckA: Array(60).fill('attacker') },
    { deckB: Array(60).fill('attacker') },
    { strictPromptValidation: false }, { isolatePolicyRandomness: false },
    { doubleDragonRecovery: 'yes' }
  ]) {
    assert.throws(() => executeCampaign(f, {
      maxTrials: 1, prepareCandidate: prepare, runMatch: finished,
      matchOptions: illegal
    }), /matchOptions/);
  }
  const reportedWrongSeed = executeCampaign(f, {
    maxTrials: 1, prepareCandidate: prepare,
    runMatch(request) { return { ...finished(request), seed: request.seed + 1 }; }
  });
  assert.equal(reportedWrongSeed.records[0].status, 'engine-seed-mismatch');
  assert.equal(reportedWrongSeed.records[0].winner, null);
  const withKnownFlag = executeCampaign(f, {
    maxTrials: 1, prepareCandidate: prepare,
    matchOptions: { doubleDragonRecovery: true },
    runMatch(request) {
      assert.equal(request.doubleDragonRecovery, true);
      assert.equal(request.strictPromptValidation, true);
      assert.equal(request.isolatePolicyRandomness, true);
      return finished(request);
    }
  });
  assert.equal(withKnownFlag.records[0].status, 'completed');
  assert.equal(withKnownFlag.records[0].effectiveMatchOptions.doubleDragonRecovery, true);
  assert.equal(withKnownFlag.records[0].observedSeed, withKnownFlag.records[0].seed);
});

test('exact source mirror exposes paired-slot pseudoreplication key', () => {
  const f = fixture();
  f.candidates[0].cards = f.source.decks[0].cards;
  f.campaign = buildCampaign({
    field: f.field, source: f.source, candidates: f.candidates,
    pilotRanks: [1, 2], repeats: 1, seedBase: 20261016
  });
  const paired = executeCampaign(f, {
    maxTrials: 2, prepareCandidate: prepare, runMatch: finished
  });
  assert.equal(paired.exactSourceMirrorTrials, 2);
  assert.equal(paired.records[0].exactSourceMirror, true);
  assert.equal(paired.records[1].exactSourceMirror, true);
  assert.equal(paired.records[0].potentialReplayAliasKey,
    paired.records[1].potentialReplayAliasKey);
  assert.match(paired.mirrorIndependenceWarning, /not count.*independent/);
  const ordinary = executeCampaign(f, {
    maxTrials: 1, prepareCandidate: prepare, runMatch: finished,
    trialIds: ['pilot:2:0:reference:A']
  });
  assert.equal(ordinary.records[0].exactSourceMirror, false);
  assert.equal(ordinary.records[0].potentialReplayAliasKey, null);
});

test('version 2 uses independent physical-slot seeds shared across candidate inventories', () => {
  const f = fixture();
  const v1Digest = f.campaign.planDigest;
  f.campaign = buildCampaign({
    field: f.field, source: f.source, candidates: f.candidates,
    pilotRanks: [1, 2], repeats: 2, seedBase: 20261016,
    seatSeedMode: 'independent-slots-v2'
  });
  assert.equal(f.campaign.schemaVersion, 2);
  assert.equal(f.campaign.seedProtocol, 'independent-slots-v2');
  assert.notEqual(f.campaign.planDigest, v1Digest);
  const rows = f.campaign.trials.filter(t =>
    t.phase === 'pilot' && t.rank === 1 && t.repeat === 0);
  assert.deepEqual(rows.map(t => [t.candidateId, t.candidateEngineSlot, t.seed]), [
    ['reference', 'A', rows[0].seed],
    ['reference', 'B', rows[0].seed + 1],
    ['other', 'A', rows[0].seed],
    ['other', 'B', rows[0].seed + 1]
  ]);
  assert.equal(new Set(f.campaign.trials.filter(t =>
    t.phase === 'pilot' && t.rank === 1).map(t => t.seed)).size, 4);
  const result = executeCampaign(f, {
    maxTrials: 4, prepareCandidate: prepare, runMatch: finished
  });
  assert.equal(result.seedProtocol, 'independent-slots-v2');
  assert.equal(result.schemaVersion, 2);
  assert.deepEqual(result.records.map(r => r.seed),
    rows.map(r => r.seed));
  assert.throws(() => buildCampaign({
    field: f.field, source: f.source, candidates: f.candidates,
    pilotRanks: [1, 2], seatSeedMode: 'unsafe'
  }), /protocol/);
});

test('previously published version 1 campaign digest remains exactly stable', () => {
  const { loadDefaultCampaign } = require('../scripts/aichi-comparison-campaign.cjs');
  assert.equal(loadDefaultCampaign().planDigest,
    'e6a0695e70325b855600c68bfe1e465a44b3bea3dec0abbe9eda96a7f1e62deb');
  const revised = loadDefaultCampaign('independent-slots-v2');
  assert.equal(revised.schemaVersion, 2);
  assert.notEqual(revised.planDigest, loadDefaultCampaign().planDigest);
  assert.equal(revised.trialCountByPhase.pilot, 54);
  assert.equal(revised.trialCountByPhase.publishedField, 174);
});

test('experimental policy metadata reflects engine-effective flags, not initial request', () => {
  const f = fixture();
  const experimental = executeCampaign(f, {
    maxTrials: 1, prepareCandidate: prepare,
    runMatch(request) {
      return {
        ...finished(request),
        doubleDragonRecovery: true,
        supporterDecisionCorrection: true,
        policyRandomIsolation: true,
        researchPolicyProfile: 'expanded-action-fidelity-probe-v1',
        experimentalTactics: ['DoubleDragonAttachTactic-v1'],
        policy: 'test-composite-policy'
      };
    }
  });
  const record = experimental.records[0];
  assert.equal(record.status, 'completed');
  assert.equal(record.effectiveMatchOptions.doubleDragonRecovery, true);
  assert.equal(record.effectiveMatchOptions.supporterDecisionCorrection, true);
  assert.equal(record.effectiveMatchOptions.isolatePolicyRandomness, true);
  assert.equal(record.observedResearchPolicyProfile,
    'expanded-action-fidelity-probe-v1');
  assert.deepEqual(record.observedExperimentalTactics, ['DoubleDragonAttachTactic-v1']);
  const baseline = executeCampaign(f, {
    maxTrials: 1, prepareCandidate: prepare, runMatch: finished
  }).records[0];
  assert.equal(baseline.effectiveMatchOptions.doubleDragonRecovery, false);
  assert.equal(baseline.effectiveMatchOptions.supporterDecisionCorrection, false);
  assert.equal(baseline.observedResearchPolicyProfile, null);
});
