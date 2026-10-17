'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { executeDiagnostic, observedFirstTurn } =
  require('../simulation/evaluation/aichi-campaign-execute.cjs');
const { loadDefaultCampaign } = require('../scripts/aichi-comparison-campaign.cjs');

const EXPECTED_ENGINE = 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ECHOED_POLICY_KEYS = [
  'forestSealSearchCorrection', 'grandTreeFirstTurnCorrection', 'electrodeGXEnergyCorrection', 'doubleDragonRecovery',
  'templeUnlockRecovery', 'supporterDecisionCorrection',
  'snorlaxRetreatStartCorrection', 'shadowRiderEnergyPriority',
  'shadowRiderEnergyAcrossField', 'shadowRiderOpeningPivot',
  'attackBeforeRetreat', 'attackBeforeRetreatSeat',
  'bunnelbyK0SafeEvolution', 'prototypeSafeSimulatorIsolation',
  'leleEntryAbilityLockCorrection', 'radiantGateLockCorrection',
  'entryDrawLockCorrection', 'eldegossEntryLockCorrection',
  'attachedToolPowerPolicy'
];

function sampleGame(request, override = {}) {
  return {
    finished: true, winner: 0, firstTurnSlot: 1,
    firstTurnPlayerId: 202, firstTurnPlayerName: 'research-B',
    firstDrawLogName: 'research-B', verifiedByDrawLog: true,
    actions: 30, turns: 3, endReason: 'engine-game-end',
    engine: EXPECTED_ENGINE, label: request.label, policy: 'synthetic-unqualified',
    promptValidationMode: request.strictPromptValidation === true ?
      'predispatch-prompt-validate' : 'upstream-unchecked',
    policyRandomIsolation: request.isolatePolicyRandomness === true,
    randomnessProtocol: request.isolatePolicyRandomness === true ?
      'separate-game-and-per-seat-policy-prng-v1' : 'legacy-shared-prng',
    ...Object.fromEntries(ECHOED_POLICY_KEYS.filter(key =>
      Object.hasOwn(request, key)).map(key => [key, request[key]])),
    seed: request.seed ?? 0,
    deckHashes: [request.deckA || cards, request.deckB || cards].map(deck =>
      createHash('sha256').update(JSON.stringify(deck)).digest('hex')),
    rules: {format: 'EXPANDED', firstTurnDrawCard: true,
      firstTurnUseSupporter: false, attackFirstTurn: false},
    attackTrace: [{seat: 0, turn: 2}],
    actionCounts: { AttackAction: 1 }, ...override
  };
}

const cards = Array(60).fill('SYNTHETIC CARD');
function run(options = {}) {
  const campaign = loadDefaultCampaign();
  return executeDiagnostic({expectedEngineRevision: EXPECTED_ENGINE,
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
  const result = executeDiagnostic({expectedEngineRevision: EXPECTED_ENGINE,
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
  assert.throws(() => executeDiagnostic({expectedEngineRevision: EXPECTED_ENGINE,campaign:loadDefaultCampaign(),ranks:[23],
    resolvePair:()=>null,runMatch:()=>null}), /pilot ranks/);
  const campaign = loadDefaultCampaign();
  const t = campaign.trials.find(t=>t.phase==='pilot');
  campaign.trials.push(t);
  assert.throws(() => executeDiagnostic({expectedEngineRevision: EXPECTED_ENGINE,campaign,ranks:[1],
    resolvePair:()=>null,runMatch:()=>null}), /planDigest integrity mismatch/);
  const output = executeDiagnostic({expectedEngineRevision: EXPECTED_ENGINE,campaign:loadDefaultCampaign(),ranks:[6],
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
    assert.throws(() => executeDiagnostic({expectedEngineRevision: EXPECTED_ENGINE,...base, policyFlags: invalid}), /policyFlags/);
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

test('preserves terminal transition in campaign diagnostic', () => {
  const transition = {evidenceType:'observed-engine-terminal-transition-v1',
    actionName:'ResolvePromptAction', before:{phase:2}, after:{phase:99},
    actionLineage:{initiatingAction:{actionName:'PassTurnAction',actionOrdinal:27,playerSlot:0},
      promptChain:[{actionName:'ResolvePromptAction',actionOrdinal:28,playerSlot:1,
        pendingPrompt:'WaitPrompt'}]}};
  const result = run({runMatch: request => sampleGame(request,
    {terminalTransition: transition})});
  assert.equal(result.counts['completed-engine-game'], 6);
  assert.deepEqual(result.records[0].traceSummary.terminalTransition, transition);
  assert.equal(run().records[0].traceSummary.terminalTransition, null);
});


test('source-60 K0-safe Bunnelby policy is seat-invariant and echoed by every fixed rank-2 trial', () => {
  const campaign = loadDefaultCampaign();
  const seats = [];
  const args = {
    expectedEngineRevision: EXPECTED_ENGINE, campaign, ranks: [2],
    policyFlags: {bunnelbyK0SafeEvolution: true},
    resolvePair: trial => ({
      candidateDigest: trial.candidateDigest,
      opponentDigest: trial.opponentDigest,
      candidateCards: cards, opponentCards: cards
    }),
    runMatch(request) {
      seats.push(request.bunnelbyK0SafeEvolution === true &&
        request.deckA.length === 60 && request.deckB.length === 60);
      return sampleGame(request);
    }
  };
  const accepted = executeDiagnostic(args);
  assert.deepEqual(seats, Array(6).fill(true));
  assert.equal(accepted.counts['completed-engine-game'], 6);
  assert.equal(accepted.policyFlags.bunnelbyK0SafeEvolution, true);
  assert.equal(accepted.strengthClaimPermitted, false);
  const rejected = executeDiagnostic({...args,
    runMatch: request => sampleGame(request, {bunnelbyK0SafeEvolution: false})});
  assert.equal(rejected.counts['unverified-game-environment'], 6);
  assert.equal(rejected.counts['completed-engine-game'] || 0, 0);
});

require('./twinleaf-selected-cards-evidence.test.cjs');

test('the opt-in Snorlax interactive-retreat gate is forwarded without altering the frozen trial',()=>{
  const campaign=loadDefaultCampaign();
  let calls=0;
  const result=executeDiagnostic({expectedEngineRevision: EXPECTED_ENGINE,
    campaign,ranks:[6],policyFlags:{snorlaxRetreatStartCorrection:true},
    resolvePair:t=>({candidateDigest:t.candidateDigest,opponentDigest:t.opponentDigest,
      candidateCards:cards,opponentCards:cards}),
    runMatch:r=>{
      calls++;
      assert.equal(r.snorlaxRetreatStartCorrection,true);
      assert.equal(r.deckA.length,60);
      assert.equal(r.deckB.length,60);
      return sampleGame(r);
    }
  });
  assert.equal(calls,6);
  assert.equal(result.counts['completed-engine-game'],6);
  assert.equal(result.policyFlags.snorlaxRetreatStartCorrection,true);
  assert.equal(result.strengthClaimPermitted,false);
});


test('opt-in Shadow Rider attachment policy is carried into every fixed-plan trial',()=>{
  const result=run({
    policyFlags:{shadowRiderEnergyPriority:true},
    runMatch:request=>{
      assert.equal(request.shadowRiderEnergyPriority,true);
      return sampleGame(request);
    }
  });
  assert.equal(result.totalScheduled,6);
  assert.equal(result.policyFlags.shadowRiderEnergyPriority,true);
  assert.equal(result.counts['completed-engine-game'],6);
});

test('opt-in Lele entry timing correction is propagated and kept out of game-win claims', () => {
  let calls = 0;
  const output = run({
    policyFlags: {leleEntryAbilityLockCorrection: true, radiantGateLockCorrection: true},
    runMatch(request) {
      calls += 1;
      assert.equal(request.leleEntryAbilityLockCorrection, true);
      assert.equal(request.radiantGateLockCorrection, true);
      return sampleGame(request, {
        policy: 'synthetic+LeleEntryAbilityLockGuard-v1',
        leleEntryAbilityLockCorrection: true
      });
    }
  });
  assert.equal(calls, 6);
  assert.equal(output.counts['completed-engine-game'], 6);
  assert.equal(output.policyFlags.leleEntryAbilityLockCorrection, true);
  assert.equal(output.policyFlags.radiantGateLockCorrection, true);
  assert.equal(output.engineAndPolicyQualified, false);
  assert.equal(output.strengthClaimPermitted, false);
});

test('fixed-campaign profile identity is source-attributed and rejects unknown profiles', () => {
  const campaign = loadDefaultCampaign();
  const request = {
    campaign, ranks: [6],
    expectedEngineRevision: EXPECTED_ENGINE,
    researchPolicyProfile: 'expanded-action-fidelity-probe-v1',
    resolvePair: t => ({
      candidateDigest: t.candidateDigest, opponentDigest: t.opponentDigest,
      candidateCards: cards, opponentCards: cards
    }),
    runMatch: r => sampleGame(r)
  };
  const result = executeDiagnostic(request);
  assert.equal(result.researchPolicyProfile, 'expanded-action-fidelity-probe-v1');
  assert.equal(result.totalScheduled, 6);
  assert.ok(result.records.every(r =>
    r.researchPolicyProfile === 'expanded-action-fidelity-probe-v1'));
  assert.equal(result.strengthClaimPermitted, false);
  assert.throws(() => executeDiagnostic({expectedEngineRevision: EXPECTED_ENGINE,
    ...request, researchPolicyProfile: 'uncontrolled-profile'
  }), /research policy profile/);
});

test('candidate-only attack priority follows actual physical candidate slot', () => {
  const seen = [];
  const out = run({
    policyFlags: {attackBeforeRetreat: true, attackBeforeRetreatCandidateOnly: true},
    runMatch: request => {
      seen.push(request.attackBeforeRetreatSeat);
      assert.equal(request.attackBeforeRetreat, true);
      assert.equal(request.attackBeforeRetreatCandidateOnly, undefined);
      return sampleGame(request);
    }
  });
  assert.deepEqual(seen, [0, 1, 0, 1, 0, 1]);
  assert.equal(out.totalScheduled, 6);
  assert.equal(out.engineAndPolicyQualified, false);
  assert.equal(out.strengthClaimPermitted, false);
});

test('candidate-specific attack ordering is rejected without the base policy', () => {
  assert.throws(() => run({policyFlags:
    {attackBeforeRetreatCandidateOnly: true}}), /requires Attack-before-Retreat/);
});


test('a different engine or scheduled trial label cannot claim completion', () => {
  for (const override of [
    {engine: 'twinleafgg/0000000000000000000000000000000000000000'},
    {label: 'wrong scheduled trial'}
  ]) {
    const report = run({runMatch: request => sampleGame(request, override)});
    assert.equal(report.counts['unverified-game-environment'], 6);
    assert.equal(report.counts['completed-engine-game'] || 0, 0);
    assert.equal(report.expectedEngineRevision, EXPECTED_ENGINE);
  }
});

test('Expanded first-turn rule drift is rejected independently of format', () => {
  for (const rules of [
    {format: 'EXPANDED', firstTurnDrawCard: false, firstTurnUseSupporter: false, attackFirstTurn: false},
    {format: 'EXPANDED', firstTurnDrawCard: true, firstTurnUseSupporter: true, attackFirstTurn: false},
    {format: 'EXPANDED', firstTurnDrawCard: true, firstTurnUseSupporter: false, attackFirstTurn: true}
  ]) {
    const report = run({runMatch: request => sampleGame(request, {rules})});
    assert.equal(report.counts['unverified-game-environment'], 6);
  }
});

test('requested prompt checks, RNG isolation and policy hooks need echoed evidence', () => {
  const policyFlags = {
    strictPromptValidation: true, isolatePolicyRandomness: true,
    supporterDecisionCorrection: true
  };
  for (const override of [
    {promptValidationMode: 'upstream-unchecked'},
    {policyRandomIsolation: false},
    {randomnessProtocol: 'legacy-shared-prng'},
    {supporterDecisionCorrection: false}
  ]) {
    const report = run({policyFlags, runMatch: request => sampleGame(request, override)});
    assert.equal(report.counts['unverified-game-environment'], 6);
    assert.equal(report.counts['completed-engine-game'] || 0, 0);
  }
  assert.equal(run({policyFlags}).counts['completed-engine-game'], 6);
});

test('entry-Ability correction hooks need an exact per-game echo', () => {
  for (const flag of ['entryDrawLockCorrection', 'eldegossEntryLockCorrection']) {
    const policyFlags = {[flag]: true};
    const accepted = run({policyFlags});
    assert.equal(accepted.counts['completed-engine-game'], 6);
    for (const record of accepted.records) {
      assert.equal(record.observedPolicyFlags[flag], true);
    }
    const reversed = run({policyFlags, runMatch: request =>
      sampleGame(request, {[flag]: false})});
    assert.equal(reversed.counts['unverified-game-environment'], 6);
    assert.equal(reversed.counts['completed-engine-game'] || 0, 0);
    const omitted = run({policyFlags, runMatch: request => {
      const game = sampleGame(request);
      delete game[flag];
      return game;
    }});
    assert.equal(omitted.counts['unverified-game-environment'], 6);
    assert.equal(omitted.counts['completed-engine-game'] || 0, 0);
  }
});

test('Tool-granted Ability candidate policy requires a matching game echo', () => {
  const policyFlags={attachedToolPowerPolicy:true};
  const valid=run({policyFlags});
  assert.equal(valid.counts['completed-engine-game'],6);
  assert.ok(valid.records.every(record=>record.observedPolicyFlags.attachedToolPowerPolicy===true));
  const incorrect=run({policyFlags,runMatch:request=>
    sampleGame(request,{attachedToolPowerPolicy:false})});
  assert.equal(incorrect.counts['unverified-game-environment'],6);
  const absent=run({policyFlags,runMatch:request=>{
    const game=sampleGame(request);
    delete game.attachedToolPowerPolicy;
    return game;
  }});
  assert.equal(absent.counts['unverified-game-environment'],6);
});

test('expected pinned engine revision is mandatory', () => {
  assert.throws(() => executeDiagnostic({
    expectedEngineRevision: null, campaign: loadDefaultCampaign(), ranks: [6],
    resolvePair: () => { throw new Error('should not resolve'); },
    runMatch: () => { throw new Error('should not run'); }
  }), /pinned Twinleaf engine revision/);
});

test('frozen campaign forwards the experimental clone mode and verifies its echo',()=>{
  const policyFlags={prototypeSafeSimulatorIsolation:true};
  let calls=0;
  const accepted=run({policyFlags,runMatch:request=>{
    calls++;
    assert.equal(request.prototypeSafeSimulatorIsolation,true);
    return sampleGame(request);
  }});
  assert.equal(calls,6);
  assert.equal(accepted.counts['completed-engine-game'],6);
  assert.equal(accepted.engineAndPolicyQualified,false);
  const falseEcho=run({policyFlags,runMatch:request=>
    sampleGame(request,{prototypeSafeSimulatorIsolation:false})});
  assert.equal(falseEcho.counts['unverified-game-environment'],6);
  assert.equal(falseEcho.counts['completed-engine-game']||0,0);
});

test('Grand Tree first-turn correction is forwarded and its engine echo must match', () => {
  const enabled=run({
    policyFlags:{grandTreeFirstTurnCorrection:true},
    runMatch:request=>{
      assert.equal(request.grandTreeFirstTurnCorrection,true);
      return sampleGame(request);
    }
  });
  assert.equal(enabled.counts['completed-engine-game'],6);
  assert.equal(enabled.policyFlags.grandTreeFirstTurnCorrection,true);
  const forged=run({
    policyFlags:{grandTreeFirstTurnCorrection:true},
    runMatch:request=>sampleGame(request,{grandTreeFirstTurnCorrection:false})
  });
  assert.equal(forged.counts['unverified-game-environment'],6);
  assert.equal(forged.counts['completed-engine-game']||0,0);
});

test('Electrode corrected Energy count must match the reported trial flag',()=>{
 const correct=run({policyFlags:{electrodeGXEnergyCorrection:true}});
 assert.equal(correct.counts['completed-engine-game'],6);
 const mismatch=run({policyFlags:{electrodeGXEnergyCorrection:true},runMatch:request=>
   sampleGame(request,{electrodeGXEnergyCorrection:false})});
 assert.equal(mismatch.counts['unverified-game-environment'],6);
});
