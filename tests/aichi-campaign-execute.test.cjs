'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { executeDiagnostic, observedFirstTurn } =
  require('../simulation/evaluation/aichi-campaign-execute.cjs');
const { loadDefaultCampaign } = require('../scripts/aichi-comparison-campaign.cjs');

const EXPECTED_ENGINE = 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const TEST_CAMPAIGN = loadDefaultCampaign();
const EXPECTED_PILOT_TRIALS = TEST_CAMPAIGN.candidateRows.length * TEST_CAMPAIGN.repeats * 2;
const ECHOED_POLICY_KEYS = [
  'forestSealSearchCorrection', 'grandTreeFirstTurnCorrection', 'electrodeGXEnergyCorrection',
  'electrodeGXPrizeTradePolicy', 'electroRainDamageCorrection', 'doubleDragonRecovery',
  'templeUnlockRecovery', 'supporterDecisionCorrection',
  'snorlaxRetreatStartCorrection', 'shadowRiderEnergyPriority',
  'shadowRiderEnergyAcrossField', 'shadowRiderOpeningPivot',
  'attackBeforeRetreat', 'attackBeforeRetreatSeat',
  'bunnelbyK0SafeEvolution', 'prototypeSafeSimulatorIsolation',
  'postSuperAliasRepairIsolation',
  'toolAttackAwareness', 'toolAttackAwarenessSeat',
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
    engine: EXPECTED_ENGINE, label: request.label,
    policy: 'synthetic-unqualified' + (request.toolAttackAwareness === true ?
      '+ToolAttackEnumerate-v1@' +
      (request.toolAttackAwarenessSeat === undefined ?
        'both' : 'seat' + request.toolAttackAwarenessSeat) : ''),
    promptValidationMode: request.strictPromptValidation === true ?
      'predispatch-prompt-validate' : 'upstream-unchecked',
    policyRandomIsolation: request.isolatePolicyRandomness === true,
    randomnessProtocol: request.isolatePolicyRandomness === true ?
      'separate-game-and-per-seat-policy-prng-v1' : 'legacy-shared-prng',
    toolAttackAwarenessSeat: request.toolAttackAwarenessSeat ?? null,
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

test('exact fixed-candidate pilot schedule includes every frozen candidate and both seats', () => {
  const result = run();
  assert.equal(result.totalScheduled, EXPECTED_PILOT_TRIALS);
  assert.equal(result.records.length, EXPECTED_PILOT_TRIALS);
  assert.equal(result.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
  assert.equal(result.strengthClaimPermitted, false);
  assert.equal(result.engineAndPolicyQualified, false);
  assert.equal(Object.hasOwn(result, 'winRate'), false);
  assert.deepEqual(new Set(result.records.map(r => r.candidateId)),
    new Set(TEST_CAMPAIGN.candidateRows.map(row => row.id)));
  assert.deepEqual(new Set(result.records.map(r => r.candidateEngineSlot)),
    new Set(['A', 'B']));
  assert.equal(result.records[0].candidateActualTurn, 'second');
  assert.equal(result.records[1].candidateActualTurn, 'first');
  assert.ok(result.records[0].qualityFlags.includes('zero-candidate-attacks') === false);
  assert.ok(result.records[1].qualityFlags.includes('zero-candidate-attacks'));
});

test('unverified turn never silently becomes a completed match', () => {
  const result = run({ runMatch: r => sampleGame(r, {firstDrawLogName: 'wrong'}) });
  assert.equal(result.counts['unverified-first-turn'], EXPECTED_PILOT_TRIALS);
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
  assert.equal(result.counts['engine-exception'], EXPECTED_PILOT_TRIALS - 1);
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
  assert.equal(result.counts['blocked-deck-resolution'], EXPECTED_PILOT_TRIALS);
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
  assert.equal(output.counts['engine-exception'], EXPECTED_PILOT_TRIALS);
  assert.match(output.records[0].error,/identity differs/);
});

test('reported seed mismatch cannot be counted as a finished fixed-plan game', () => {
  const result = run({runMatch: r => sampleGame(r, {seed: r.seed + 1})});
  assert.equal(result.counts['unverified-game-identity'], EXPECTED_PILOT_TRIALS);
  assert.equal(result.counts['completed-engine-game'] || 0, 0);
  assert.equal(result.records[0].observedSeed, result.records[0].seed + 1);
});

test('ordered deck fingerprints are verified before first-turn classification', () => {
  const badHashes = ['forged-candidate', 'forged-opponent'];
  const result = run({runMatch: r => sampleGame(r, {deckHashes: badHashes})});
  assert.equal(result.counts['unverified-game-identity'], EXPECTED_PILOT_TRIALS);
  assert.deepEqual(result.records[0].observedDeckHashes, badHashes);
  assert.equal(result.records[0].expectedDeckHashes.length, 2);
});

test('the simulator must attest to Expanded rules for a qualifying terminal game', () => {
  const result = run({runMatch: r => sampleGame(r, {rules: {format: 'STANDARD'}})});
  assert.equal(result.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
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
  assert.equal(output.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
  for (const record of output.records) {
    assert.deepEqual(record.traceSummary.chronologicalActionTrace, trace);
    assert.equal(record.traceSummary.capturedMeaningfulActions, 2);
    assert.equal(record.traceSummary.coversAllActionsAndPromptResolutions, false);
    assert.equal(record.traceSummary.chronologicalActionTraceSha256,
      createHash('sha256').update(JSON.stringify(trace)).digest('hex'));
  }
});


test('source Electrode observer is preserved only with valid per-seat game evidence', () => {
  const observer = {
    evidenceType: 'live-aichi-electrode-public-necessary-conditions-v1',
    countsBySeat: [
      {decisions: 12, both: 0}, {decisions: 11, both: 2}
    ],
    distinctInterestingStates: [{seat: 1, turn: 3, activeRaichu: true}]
  };
  const present = run({
    policyFlags: {captureElectrodeOpportunity: true},
    runMatch: request => {
      assert.equal(request.captureElectrodeOpportunity, true);
      return sampleGame(request, {electrodeOpportunitySummary: observer});
    }
  });
  assert.equal(present.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
  assert.ok(present.records.every(record =>
    record.traceSummary.electrodeOpportunitySummary === observer));

  const missing = run({policyFlags: {captureElectrodeOpportunity: true}});
  assert.equal(missing.counts['unverified-observer-evidence'],
    EXPECTED_PILOT_TRIALS);
  assert.equal(missing.counts['completed-engine-game'] || 0, 0);
  assert.equal(missing.records[0].traceSummary.electrodeOpportunitySummary, null);
});

test('missing requested history prevents a completed status', () => {
  const result = run({policyFlags: {captureDecisionTrace: true}});
  assert.equal(result.counts['unverified-decision-trace'], EXPECTED_PILOT_TRIALS);
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
  assert.equal(result.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
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
  assert.deepEqual(seats, Array(EXPECTED_PILOT_TRIALS).fill(true));
  assert.equal(accepted.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
  assert.equal(accepted.policyFlags.bunnelbyK0SafeEvolution, true);
  assert.equal(accepted.strengthClaimPermitted, false);
  const rejected = executeDiagnostic({...args,
    runMatch: request => sampleGame(request, {bunnelbyK0SafeEvolution: false})});
  assert.equal(rejected.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
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
  assert.equal(calls, EXPECTED_PILOT_TRIALS);
  assert.equal(result.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
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
  assert.equal(result.totalScheduled, EXPECTED_PILOT_TRIALS);
  assert.equal(result.policyFlags.shadowRiderEnergyPriority,true);
  assert.equal(result.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
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
  assert.equal(calls, EXPECTED_PILOT_TRIALS);
  assert.equal(output.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
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
  assert.equal(result.totalScheduled, EXPECTED_PILOT_TRIALS);
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
  assert.deepEqual(seen, Array.from({length: EXPECTED_PILOT_TRIALS}, (_, i) => i % 2));
  assert.equal(out.totalScheduled, EXPECTED_PILOT_TRIALS);
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
    assert.equal(report.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
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
    assert.equal(report.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
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
    assert.equal(report.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
    assert.equal(report.counts['completed-engine-game'] || 0, 0);
  }
  assert.equal(run({policyFlags}).counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
});

test('entry-Ability correction hooks need an exact per-game echo', () => {
  for (const flag of ['entryDrawLockCorrection', 'eldegossEntryLockCorrection']) {
    const policyFlags = {[flag]: true};
    const accepted = run({policyFlags});
    assert.equal(accepted.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
    for (const record of accepted.records) {
      assert.equal(record.observedPolicyFlags[flag], true);
    }
    const reversed = run({policyFlags, runMatch: request =>
      sampleGame(request, {[flag]: false})});
    assert.equal(reversed.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
    assert.equal(reversed.counts['completed-engine-game'] || 0, 0);
    const omitted = run({policyFlags, runMatch: request => {
      const game = sampleGame(request);
      delete game[flag];
      return game;
    }});
    assert.equal(omitted.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
    assert.equal(omitted.counts['completed-engine-game'] || 0, 0);
  }
});

test('Tool-granted Ability candidate policy requires a matching game echo', () => {
  const policyFlags={attachedToolPowerPolicy:true};
  const valid=run({policyFlags});
  assert.equal(valid.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
  assert.ok(valid.records.every(record=>record.observedPolicyFlags.attachedToolPowerPolicy===true));
  const incorrect=run({policyFlags,runMatch:request=>
    sampleGame(request,{attachedToolPowerPolicy:false})});
  assert.equal(incorrect.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
  const absent=run({policyFlags,runMatch:request=>{
    const game=sampleGame(request);
    delete game.attachedToolPowerPolicy;
    return game;
  }});
  assert.equal(absent.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
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
  assert.equal(calls, EXPECTED_PILOT_TRIALS);
  assert.equal(accepted.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
  assert.equal(accepted.engineAndPolicyQualified,false);
  const falseEcho=run({policyFlags,runMatch:request=>
    sampleGame(request,{prototypeSafeSimulatorIsolation:false})});
  assert.equal(falseEcho.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
  assert.equal(falseEcho.counts['completed-engine-game']||0,0);
});

test('v2 campaign clone profile verifies actual echo and rejects conflicting modes', () => {
  const policyFlags = {postSuperAliasRepairIsolation: true};
  let calls = 0;
  const accepted = run({policyFlags, runMatch: request => {
    calls++;
    assert.equal(request.postSuperAliasRepairIsolation, true);
    return sampleGame(request);
  }});
  assert.equal(calls, EXPECTED_PILOT_TRIALS);
  assert.equal(accepted.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
  assert.equal(accepted.engineAndPolicyQualified, false);
  assert.ok(accepted.records.every(record =>
    record.observedPolicyFlags.postSuperAliasRepairIsolation === true));

  const falseEcho = run({policyFlags, runMatch: request =>
    sampleGame(request, {postSuperAliasRepairIsolation: false})});
  assert.equal(falseEcho.counts['unverified-game-environment'],
    EXPECTED_PILOT_TRIALS);
  assert.equal(falseEcho.counts['completed-engine-game'] || 0, 0);

  const missingEcho = run({policyFlags, runMatch: request => {
    const game = sampleGame(request);
    delete game.postSuperAliasRepairIsolation;
    return game;
  }});
  assert.equal(missingEcho.counts['unverified-game-environment'],
    EXPECTED_PILOT_TRIALS);

  assert.throws(() => run({policyFlags: {
    prototypeSafeSimulatorIsolation: true,
    postSuperAliasRepairIsolation: true
  }}), /only one experimental speculative Simulator profile/);
});

test('Grand Tree first-turn correction is forwarded and its engine echo must match', () => {
  const enabled=run({
    policyFlags:{grandTreeFirstTurnCorrection:true},
    runMatch:request=>{
      assert.equal(request.grandTreeFirstTurnCorrection,true);
      return sampleGame(request);
    }
  });
  assert.equal(enabled.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
  assert.equal(enabled.policyFlags.grandTreeFirstTurnCorrection,true);
  const forged=run({
    policyFlags:{grandTreeFirstTurnCorrection:true},
    runMatch:request=>sampleGame(request,{grandTreeFirstTurnCorrection:false})
  });
  assert.equal(forged.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
  assert.equal(forged.counts['completed-engine-game']||0,0);
});

test('Electrode corrected Energy count must match the reported trial flag',()=>{
 const correct=run({policyFlags:{electrodeGXEnergyCorrection:true}});
 assert.equal(correct.counts['completed-engine-game'], EXPECTED_PILOT_TRIALS);
 const mismatch=run({policyFlags:{electrodeGXEnergyCorrection:true},runMatch:request=>
   sampleGame(request,{electrodeGXEnergyCorrection:false})});
 assert.equal(mismatch.counts['unverified-game-environment'], EXPECTED_PILOT_TRIALS);
});

test('opponent-only Tool attack enumeration tracks the actual opponent physical seat',()=>{
  const seen=[];
  const out=run({
    policyFlags:{toolAttackAwareness:true,toolAttackOpponentOnly:true},
    runMatch:request=>{
      seen.push(request.toolAttackAwarenessSeat);
      assert.equal(request.toolAttackAwareness,true);
      assert.equal(request.toolAttackOpponentOnly,undefined);
      return sampleGame(request);
    }
  });
  assert.deepEqual(seen,Array.from({length:EXPECTED_PILOT_TRIALS},
    (_,i)=>i%2===0?1:0));
  assert.equal(out.counts['completed-engine-game'],EXPECTED_PILOT_TRIALS);
  assert.equal(out.strengthClaimPermitted,false);
  const forged=run({
    policyFlags:{toolAttackAwareness:true,toolAttackOpponentOnly:true},
    runMatch:request=>sampleGame(request,{toolAttackAwarenessSeat:9})
  });
  assert.equal(forged.counts['unverified-game-environment'],EXPECTED_PILOT_TRIALS);
  const bogusLabel=run({
    policyFlags:{toolAttackAwareness:true,toolAttackOpponentOnly:true},
    runMatch:request=>sampleGame(request,{policy:'synthetic-unqualified'})
  });
  assert.equal(bogusLabel.counts['unverified-game-environment'],EXPECTED_PILOT_TRIALS);
  const allSeats=run({policyFlags:{toolAttackAwareness:true}});
  assert.equal(allSeats.counts['completed-engine-game'],EXPECTED_PILOT_TRIALS);
  const bogusGlobal=run({
    policyFlags:{toolAttackAwareness:true},
    runMatch:request=>sampleGame(request,{toolAttackAwarenessSeat:0})
  });
  assert.equal(bogusGlobal.counts['unverified-game-environment'],EXPECTED_PILOT_TRIALS);
});

test('Tool attack policy profile guards prevent duplicate or implicit tactics',()=>{
  assert.throws(()=>run({policyFlags:{toolAttackOpponentOnly:true}}),
    /Opponent-only Tool attacks require/);
  assert.throws(()=>executeDiagnostic({
    expectedEngineRevision:EXPECTED_ENGINE,campaign:loadDefaultCampaign(),
    ranks:[6],researchPolicyProfile:'expanded-action-fidelity-probe-v1',
    policyFlags:{toolAttackAwareness:true},
    resolvePair:()=>{throw Error('must not resolve');},
    runMatch:()=>{throw Error('must not run');}
  }),/overlaps the existing Expanded tactic profile/);
});


test('rank4 source-only Compressor treatment follows physical source seat and requires printed corrections',()=>{
  const campaign=loadDefaultCampaign();
  const flags={
    rank4RaichuCompressorSource:true,
    battleCompressorPositiveSelectionCorrection:true,
    electrodeGXEnergyCorrection:true,
    electroRainDamageCorrection:true
  };
  const expected=TEST_CAMPAIGN.candidateRows.length*TEST_CAMPAIGN.repeats*2;
  const seen=[];
  const args={
    expectedEngineRevision:EXPECTED_ENGINE,campaign,ranks:[4],
    policyFlags:flags,
    resolvePair:trial=>({
      candidateDigest:trial.candidateDigest,
      opponentDigest:trial.opponentDigest,
      candidateCards:cards,opponentCards:cards
    }),
    runMatch:request=>{
      const expectedSource=request.label.endsWith(':A')?1:0;
      seen.push(request.rank4RaichuCompressorSeat);
      assert.equal(request.rank4RaichuCompressorSeat,expectedSource);
      assert.equal(request.rank4RaichuCompressorSource,undefined);
      assert.equal(request.battleCompressorPositiveSelectionCorrection,true);
      return sampleGame(request,{
        rank4RaichuCompressorSeat:expectedSource,
        battleCompressorPositiveSelectionCorrection:true,
        policy:'synthetic+Rank4SourceCompressorSpecialEnergy-v1@seat'+expectedSource
      });
    }
  };
  const result=executeDiagnostic(args);
  assert.equal(result.counts['completed-engine-game'],expected);
  assert.deepEqual(seen,Array.from({length:expected},(_,i)=>i%2===0?1:0));
  assert.ok(result.records.every(rec=>
    rec.sourceCompressorSeat===(rec.candidateEngineSlot==='A'?1:0)));
  assert.throws(()=>executeDiagnostic({...args,ranks:[6]}),/requires rank 4/);
  assert.throws(()=>executeDiagnostic({...args,policyFlags:{
    ...flags,battleCompressorPositiveSelectionCorrection:false}}),/requires rank 4/);
  const unverified=executeDiagnostic({...args,runMatch:request=>
    sampleGame(request,{rank4RaichuCompressorSeat:0,
      battleCompressorPositiveSelectionCorrection:false})});
  assert.equal(unverified.counts['unverified-game-environment'],expected);
});
