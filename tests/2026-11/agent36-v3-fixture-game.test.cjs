'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const runner = require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const fixtureGame = require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');
const roleIdentity = require('../../simulation/evaluation/2026-11/agent42-role-policy-identity.cjs');
const roleComposition = require('../../simulation/twinleaf/agent44-role-scoped-policy-composition.cjs');
const diagnostic = require('../../simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs');

const ROOT = path.resolve(__dirname, '../..');
const CANDIDATE_PATH = 'results/aichi-2026/candidate-hood-shadow-rider.json';
const FIELD_PATH = 'results/aichi-2026/full-decklists.json';
const ADMISSION_PATH = 'results/aichi-2026/original-printed60-admission-v1.json';
const CANDIDATE_SHA = '1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924';
const OPPONENT_SHA = '159019c3e714677433e87bbdaf6789922ba33491549864d3a7ab17b4f7db3090';

test('fixed candidate and authenticated rank-1 source resolve as exact pinned Twinleaf printings', () => {
  const candidateBytes = fs.readFileSync(path.join(ROOT, CANDIDATE_PATH));
  const fieldBytes = fs.readFileSync(path.join(ROOT, FIELD_PATH));
  const admissionBytes = fs.readFileSync(path.join(ROOT, ADMISSION_PATH));
  const candidate = JSON.parse(candidateBytes.toString('utf8'));
  const field = JSON.parse(fieldBytes.toString('utf8'));
  const rank1 = field.decks.find((deck) => deck.rank === 1);
  const admission = JSON.parse(admissionBytes.toString('utf8'));
  const rank1Admission = admission.rows.find((row) => row.rank === 1);

  assert.equal(runner.gitBlobSha(candidateBytes), '24ace2d6feb9ce5d9056bcf271827cfe31b7357b');
  assert.equal(runner.gitBlobSha(fieldBytes), 'ae773f6201d7aa69d31914dbfee66f3fba692200');
  assert.equal(admission.sourceGitBlobSha, 'ae773f6201d7aa69d31914dbfee66f3fba692200');
  assert.equal(rank1Admission.rosterGitBlobSha, 'ae773f6201d7aa69d31914dbfee66f3fba692200');
  assert.equal(rank1Admission.competitivelyQualified, false);
  assert.equal(runner.printed60Fingerprint(candidate), CANDIDATE_SHA);
  assert.equal(runner.printed60Fingerprint(rank1), rank1Admission.printed60Sha256);
  assert.equal(rank1Admission.printed60Sha256, OPPONENT_SHA);
  assert.equal(candidate.cards.length, 34);
  assert.deepEqual(candidate.category_counts, { 'Pokémon': 18, Trainer: 31, Energy: 11 });

  const native = runner.loadNativeRoleDependencies({
    enginePin: process.env.AGENT36_TWINLEAF_COMMIT_SHA,
  });
  const allCards = native.CardManager.getInstance().getAllCards();
  const candidateResolved = runner.resolvePrintedDeck(candidate, allCards, { label: 'candidate' });
  const opponentResolved = runner.resolvePrintedDeck(rank1, allCards, { label: 'rank1 opponent' });

  assert.equal(candidateResolved.total, 60);
  assert.equal(opponentResolved.total, 60);

  // The frozen source 60s retain MEE/13; only the engine-registration proxy
  // changes to the pinned CardManager's canonical SVE/5 Psychic Energy.
  const candidatePsychic = candidateResolved.resolvedRows.find(row => row.name === 'Psychic Energy');
  const opponentPsychic = opponentResolved.resolvedRows.find(row => row.name === 'Psychic Energy');
  assert.deepEqual(candidatePsychic.printing, { set: 'MEE', number: '13', language: 'en' });
  assert.deepEqual(candidatePsychic.enginePrinting, { set: 'SVE', number: '5', language: 'en' });
  assert.deepEqual(opponentPsychic.printing, { set: 'MEE', number: '13', language: 'en' });
  assert.deepEqual(opponentPsychic.enginePrinting, { set: 'SVE', number: '5', language: 'en' });

  // Pinned CardManager defines the exact ASC/196 printing for both frozen 60s.
  const candidateNightStretcher = candidateResolved.resolvedRows.find(row => row.name === 'Night Stretcher');
  const opponentNightStretcher = opponentResolved.resolvedRows.find(row => row.name === 'Night Stretcher');
  assert.deepEqual(candidateNightStretcher.printing, { set: 'ASC', number: '196', language: 'en' });
  assert.deepEqual(candidateNightStretcher.enginePrinting, candidateNightStretcher.printing);
  assert.deepEqual(opponentNightStretcher.printing, { set: 'ASC', number: '196', language: 'en' });
  assert.deepEqual(opponentNightStretcher.enginePrinting, opponentNightStretcher.printing);

  assert.notEqual(native.botOptionsBySeat[0], native.botOptionsBySeat[1]);
  assert.notEqual(native.botOptionsBySeat[0].arbiter, native.botOptionsBySeat[1].arbiter);
  assert.notEqual(native.botOptionsBySeat[0].tactics, native.botOptionsBySeat[1].tactics);
  assert.notEqual(native.botOptionsBySeat[0].scores.hand, native.botOptionsBySeat[1].scores.hand);
  assert.deepEqual(native.botOptionsBySeat[0].scores, native.botOptionsBySeat[1].scores);
});


test('MEE/13 Psychic engine proxy does not rewrite other source printings', () => {
  const deck = {
    cards: [
      { category: 'Energy', name: 'Psychic Energy', count: 1,
        printing: { set: 'MEE', number: '12', language: 'en' } },
      { category: 'Energy', name: 'Darkness Energy', count: 1,
        printing: { set: 'MEE', number: '13', language: 'en' } },
    ],
  };
  const cards = [
    { name: 'Psychic Energy', set: 'MEE', setNumber: '12', fullName: 'Psychic Energy MEE 12' },
    { name: 'Darkness Energy', set: 'MEE', setNumber: '13', fullName: 'Darkness Energy MEE 13' },
  ];
  const resolved = runner.resolvePrintedDeck(deck, cards, { label: 'alias-negative-controls', expectedSize: 2 });
  assert.deepEqual(resolved.resolvedRows.map(row => row.enginePrinting), [
    { set: 'MEE', number: '12', language: 'en' },
    { set: 'MEE', number: '13', language: 'en' },
  ]);
  assert.deepEqual(resolved.fullNames, ['Psychic Energy MEE 12', 'Darkness Energy MEE 13']);
});

test('ASC/196 Night Stretcher proxy is narrow and exact-print-first', () => {
  const sourcePrinting = { set: 'ASC', number: '196', language: 'en' };
  const deck = {
    cards: [
      { category: 'Trainer', name: 'Night Stretcher', count: 1, printing: sourcePrinting },
    ],
  };
  const proxyCard = {
    name: 'Night Stretcher', set: 'SFA', setNumber: '61',
    fullName: 'Night Stretcher SFA 61',
  };

  const proxied = runner.resolvePrintedDeck(deck, [proxyCard], {
    label: 'night-stretcher-source-proxy', expectedSize: 1,
  });
  assert.deepEqual(proxied.resolvedRows[0].printing, sourcePrinting);
  assert.deepEqual(proxied.resolvedRows[0].enginePrinting, {
    set: 'SFA', number: '61', language: 'en',
  });
  assert.deepEqual(proxied.fullNames, ['Night Stretcher SFA 61']);

  const wrongNumber = {
    cards: [{ ...deck.cards[0], printing: { set: 'ASC', number: '195', language: 'en' } }],
  };
  assert.throws(() => runner.resolvePrintedDeck(wrongNumber, [proxyCard], {
    label: 'night-stretcher-wrong-source-number', expectedSize: 1,
  }), /must resolve once/);

  const wrongName = {
    cards: [{ ...deck.cards[0], name: 'Night Stretcher EX' }],
  };
  assert.throws(() => runner.resolvePrintedDeck(wrongName, [proxyCard], {
    label: 'night-stretcher-wrong-name', expectedSize: 1,
  }), /must resolve once/);

  const exactCard = {
    name: 'Night Stretcher', set: 'ASC', setNumber: '196',
    fullName: 'Night Stretcher ASC 196',
  };
  const exactFirst = runner.resolvePrintedDeck(deck, [proxyCard, exactCard], {
    label: 'night-stretcher-exact-first', expectedSize: 1,
  });
  assert.deepEqual(exactFirst.resolvedRows[0].enginePrinting, sourcePrinting);
  assert.deepEqual(exactFirst.fullNames, ['Night Stretcher ASC 196']);

  const duplicateExactCard = {
    ...exactCard, fullName: 'Night Stretcher ASC 196 duplicate',
  };
  assert.throws(() => runner.resolvePrintedDeck(deck, [
    proxyCard, exactCard, duplicateExactCard,
  ], { label: 'night-stretcher-ambiguous-exact', expectedSize: 1 }),
  /must resolve at most once/);
});

test('fixture trial binds and preserves the canonical composer actor-only execution boundary', () => {
  const audit = (seat, overrides = {}) => ({
    policyOwnerSeat: seat,
    version: 'agent34-actor-only-root-slice-test',
    origin: 'detached-actor-observation',
    observationSchema: 'agent2-public-native-dispatch-diff-v1',
    nativeOwnerTrainerFallback: null,
    unsupportedPromptFallbacks: 0,
    nonOwnerNativeDelegations: 0,
    nonLiveSpeculativeFallbacks: 0,
    nonTurnPhaseFallbacks: 0,
    nonOwnerSeatBypassCalls: 0,
    peerRoleDispatchEnabled: seat === 0,
    ownerDecisionCalls: 1,
    peerRoleDelegations: seat === 0 ? 1 : 0,
    ...overrides,
  });
  const boundary = roleComposition.inspectActorOnlyExecutionBoundary({
    candidateAudit: audit(0),
    opponentAudit: audit(1),
    candidateSeat: 0,
    opponentSeat: 1,
  });
  assert.equal(boundary.schema, 'aichi-actor-only-execution-boundary-v2');
  assert.equal(boundary.valid, true);
  assert.deepEqual(boundary.failures, []);
  assert.equal(boundary.candidate.ownerFallbackDiagnosticViewEnabled, false);
  assert.equal(boundary.candidate.nativePolicyMayUseHiddenInformation, false);
  assert.equal(boundary.opponent.policyOwnerSeat, 1);
  const boundarySha256 = roleIdentity.hashActorOnlyExecutionBoundary(boundary);
  assert.match(boundarySha256, /^[0-9a-f]{64}$/);
  assert.equal(roleIdentity.hashActorOnlyExecutionBoundary(null), null);

  // An audit failure is still factual evidence. The receipt helper hashes it;
  // the V3 evaluator, not receipt creation, withholds policy competence.
  const invalid = roleComposition.inspectActorOnlyExecutionBoundary({
    candidateAudit: audit(0, { unsupportedPromptFallbacks: 1 }),
    opponentAudit: audit(1),
    candidateSeat: 0,
    opponentSeat: 1,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.failures.includes('candidate-unsupportedPromptFallbacks-nonzero'));
  const invalidSha256 = roleIdentity.hashActorOnlyExecutionBoundary(invalid);
  assert.match(invalidSha256, /^[0-9a-f]{64}$/);
  assert.notEqual(invalidSha256, boundarySha256);

  const wrongSeat = roleComposition.inspectActorOnlyExecutionBoundary({
    candidateAudit: audit(1),
    opponentAudit: audit(1),
    candidateSeat: 0,
    opponentSeat: 1,
  });
  assert.equal(wrongSeat.valid, false);
  assert.ok(wrongSeat.failures.includes('candidate-policy-owner-seat-mismatch'));
  assert.match(roleIdentity.hashActorOnlyExecutionBoundary(wrongSeat), /^[0-9a-f]{64}$/);

  const runnerSource = fs.readFileSync(
    path.join(ROOT, 'simulation/evaluation/2026-11/agent36-v3-runner.cjs'), 'utf8');
  assert.match(runnerSource,
    /function projectActorOnlyBoundaryToTrial\(roleResult\)/);
  assert.match(runnerSource,
    /actorOnlyExecutionBoundary:\s*projectActorOnlyBoundaryToTrial\(roleResult\)/);
  assert.match(runnerSource,
    /const applicationBase = gameCompleted && workerExecutionAudit\?\.totalWorkerDecisions>0 \? roleIdentity\.createPolicyApplicationReceipt/);
});

test('fixture policy registration distinguishes Expanded game rules from Japanese Extra source event', () => {
  const constraints = runner.buildFixturePolicyConstraints({
    patchDescriptor: {
      patchId: 'fixture-test-hook',
      modulePath: 'simulation/twinleaf/test-hook.cjs',
      moduleSha256: 'c'.repeat(64),
      target: 'fixture-test-target',
    },
    botOptionsProfile: {},
    seed: 'fixture-test-seed',
    seedDisclosureDecision: 'public-reproducible',
  });
  assert.equal(constraints.candidateFormat, 'Expanded');
  assert.equal(constraints.gameRuleset, 'Expanded');
  assert.equal(constraints.opponentSourceEventFormat, 'Japanese Extra');

  const candidateIdentity = {
    deckSha256: 'a'.repeat(64),
    policySha256: 'b'.repeat(64),
    entryManifestSha256: 'c'.repeat(64),
    challengeSuiteSha256: 'd'.repeat(64),
    policyProducerId: 'fixture-candidate',
  };
  const opponentIdentity = {
    deckSha256: 'e'.repeat(64),
    policySha256: 'f'.repeat(64),
    entryManifestSha256: '1'.repeat(64),
    challengeSuiteSha256: '2'.repeat(64),
    policyProducerId: 'fixture-opponent',
  };
  const plan = runner.buildFixturePolicyPlan({
    candidateIdentity, opponentIdentity, constraints, runtimePinEvidence: {},
  });
  for (const object of [plan.policyPlanCore, plan.policyRegistration, plan.preDeal]) {
    assert.equal(object.candidateFormat, 'Expanded');
    assert.equal(object.gameRuleset, 'Expanded');
    assert.equal(object.opponentSourceEventFormat, 'Japanese Extra');
    assert.equal(object.expandedLegalityAsOf, null);
    assert.equal(object.eventDate, null);
    assert.equal(object.formatReviewStatus, 'unverified-fixture-only');
  }
  assert.equal(plan.policyPlanCore.constraints.gameRuleset, 'Expanded');
  assert.equal(plan.policyPlanCore.constraints.opponentSourceEventFormat, 'Japanese Extra');
  assert.equal(plan.policyPlanCore.constraints.expandedLegalityAsOf, null);
  assert.equal(plan.policyPlanCore.constraints.eventDate, null);
  assert.equal(plan.policyPlanCore.candidate.formatStatus, 'unverified');
  assert.equal(plan.policyPlanCore.opponentPolicyBundle.ranks[0].formatStatus, 'unverified');
  const runnerSource = fs.readFileSync(
    path.join(ROOT, 'simulation/evaluation/2026-11/agent36-v3-runner.cjs'), 'utf8');
  assert.match(runnerSource, /candidateFormat: trial\.candidateFormat/);
  assert.match(runnerSource, /gameRuleset: trial\.gameRuleset/);
  assert.match(runnerSource, /opponentSourceEventFormat: trial\.opponentSourceEventFormat/);
  assert.match(runnerSource,
    /for \(const key of \['candidateFormat', 'gameRuleset', 'opponentSourceEventFormat',\s*'expandedLegalityAsOf', 'eventDate', 'formatReviewStatus'\]\)/);
  assert.match(runnerSource, /candidateFormat=\$\{trial\.candidateFormat\}/);
  assert.match(runnerSource, /workerExecutionAuditSha256=\$\{trial\.workerExecutionAuditSha256/);
  assert.match(runnerSource, /actorOnlyExecutionBoundaryValid=\$\{trial\.actorOnlyExecutionBoundary\?\.valid === true\}/);
});

test('string trial seed maps deterministically to a recorded uint32 stream seed', () => {
  const seed = 'agent36-v3-fixture-hood-rank1-20261112-01';
  const first = fixtureGame.normalizeSeed32(seed);
  const second = fixtureGame.normalizeSeed32(seed);
  assert.equal(first, second);
  assert.ok(Number.isInteger(first) && first >= 0 && first <= 0xffffffff);
  assert.notEqual(first, 0);
});

test('no-game seed probe mirrors frozen setup choices and rejects incompatible opponent starting states', () => {
  class ConfirmPrompt {}
  class SelectPrompt {}
  class ChooseCardsPrompt {}
  const native = {
    ResolvePromptAction: class ResolvePromptAction {
      constructor(promptId, result) { this.promptId = promptId; this.result = result; }
    }
  };

  const goFirst = new ConfirmPrompt();
  Object.assign(goFirst, { id: 1, message: 'GO_FIRST' });
  const yes = runner.resolveNoGameWitnessSeedPrompt({
    prompt: goFirst, native, actorSeat: 0, state: { phase: 1 }
  }, { candidateSeat: 0, opponentSeat: 1 });
  assert.equal(yes.result, true);

  const draw = new SelectPrompt();
  Object.assign(draw, {
    id: 2, message: 'WANT_TO_DRAW_CARDS',
    // The native setup SelectPrompt exposes all seven descending draw choices.
    values: [
      'Draw 6 card(s)', 'Draw 5 card(s)', 'Draw 4 card(s)',
      'Draw 3 card(s)', 'Draw 2 card(s)', 'Draw 1 card(s)', 'Draw 0 card(s)'
    ],
    options: { allowCancel: false }
  });
  const drawResult = runner.resolveNoGameWitnessSeedPrompt({
    prompt: draw, native, actorSeat: 0, state: { phase: 1 }
  }, { candidateSeat: 0, opponentSeat: 1 });
  assert.equal(drawResult.result, 0);

  const starting = new ChooseCardsPrompt();
  Object.assign(starting, {
    id: 3, message: 'CHOOSE_STARTING_POKEMONS',
    cards: { cards: [{ fullName: 'Basic A' }, { fullName: 'Basic B' }, { fullName: 'Blocked' }] },
    options: { min: 1, max: 2, blocked: [2], allowCancel: false, isSecret: false }
  });
  const state = {
    phase: 1,
    players: [
      { active: { cards: [] } },
      { active: { cards: [] } }
    ]
  };
  const selected = runner.resolveNoGameWitnessSeedPrompt({
    prompt: starting, native, actorSeat: 0, state
  }, { candidateSeat: 0, opponentSeat: 1 });
  assert.deepEqual(selected.result, [0, 1]);

  state.players[1].active = { cards: [{ fullName: 'Already Active' }] };
  assert.throws(() => runner.resolveNoGameWitnessSeedPrompt({
    prompt: starting, native, actorSeat: 1, state
  }, { candidateSeat: 0, opponentSeat: 1 }), error => error.code === 'NO_GAME_WITNESS_SETUP_INCOMPATIBLE');

  const unknown = new ChooseCardsPrompt();
  Object.assign(unknown, {
    id: 4, message: 'UNSUPPORTED_SETUP_PROMPT',
    cards: { cards: [{ fullName: 'Basic A' }] },
    options: { min: 1, max: 1, blocked: [], allowCancel: false, isSecret: false }
  });
  assert.throws(() => runner.resolveNoGameWitnessSeedPrompt({
    prompt: unknown, native, actorSeat: 0, state
  }, { candidateSeat: 0, opponentSeat: 1 }), error => error.code === 'NO_GAME_WITNESS_SETUP_INCOMPATIBLE');
});

test('fixture role manifest is complete, fail-closed, and pins the selected patch and native startup', () => {
  const built = runner.buildFixtureRoleEntryManifest({
    repositoryRoot: ROOT,
    enginePin: process.env.AGENT36_TWINLEAF_COMMIT_SHA,
    runnerRevision: process.env.GITHUB_SHA,
  });
  assert.equal(built.manifest.complete, true);
  const combined = roleIdentity.combineRolePolicyEntryManifests(built, built);
  assert.deepEqual(combined.expectedByPath, built.expectedByPath);
  assert.equal(combined.unionSha256.length, 64);
  assert.deepEqual(built.manifest.sourceAuditLimitations, {
    dynamicRequireSites: [],
    computedEnvSites: [],
    unclassifiedEnvSites: [],
    missingRelativeImports: [],
    externalRequires: [],
  });
  assert.ok(built.manifest.vendorDependencies.some((item) => item.path === 'vendor/twinleaf/ptcg-server/start.js'));
  assert.ok(built.manifest.dataAssets.some((item) => item.path === 'resources/sets/en.json'));
  assert.ok(built.manifest.dataAssets.some((item) => item.path === 'resources/cards/en/xy4.json'));
  assert.ok(built.manifest.sharedEnginePatches.some((item) => item.path === 'simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs'));
  assert.ok(built.manifest.commonRuntimeBindings.some((item) => item.name === 'roleComposer'));
  assert.ok(built.manifest.commonRuntimeBindings.some((item) => item.name === 'observe'));
  const diagnosticPath = 'simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs';
  const diagnosticAsset = built.manifest.dataAssets.find((item) => item.path === diagnosticPath);
  assert.ok(diagnosticAsset && /^[0-9a-f]{64}$/i.test(diagnosticAsset.sha256), 'full-state serializer must be hash-bound as a data asset');
  assert.equal(Object.prototype.hasOwnProperty.call(combined.expectedByPath, diagnosticPath), false, 'full-state serializer must not enter the policy module closure');
});

test('fixture runner unwraps direct and role-composed failure envelopes without losing partial traces',()=>{
  const fullState=(stage)=>({
    schema:'twinleaf-full-state-diagnostic-v1',
    visibility:'private-offline-diagnostic-only',
    context:{stage},
    turn:1,
    phase:'player-turn',
    activePlayerSeat:0,
    activePlayerId:101,
    activePlayerName:'candidate',
    firstPlayerSeat:0,
    winnerPlayerId:null,
    winnerSeat:null,
    gameSettings:null,
    rules:null,
    engineExtraFields:{},
    players:[0,1].map(seat=>({
      seat,
      playerId:seat===0?101:202,
      name:'seat-'+seat,
      board:{active:null,bench:[]},
      counts:{hand:0,deck:0,prizes:0,discard:0,lostZone:0},
      zones:{
        hand:[],
        deckArrayOrder:[],
        deckArrayOrderSemantics:'test',
        prizes:[],
        discard:[],
        lostZone:[],
        stadium:null,
        resolvingSupporter:null
      },
      turnResources:{},
      publicTurnRestrictions:{},
      extraStateFields:{}
    })),
    prompts:[]
  });
  const decisionTrace=[{
    actionOrdinal:2,
    turnBefore:1,
    actingSeat:0,
    actingPlayerId:101,
    phaseBefore:'player-turn',
    policyInputKind:'actor-observation',
    actorObservationBefore:{actorSeat:0,ownHand:[]},
    actorObservationSha256:'a'.repeat(64),
    actionName:null,
    dispatchStatus:'not-dispatched',
    fullStateBefore:fullState('before'),
    fullStateAfter:fullState('failure-final')
  }];
  const partial={
    fixtureOnly:true,
    admissionEligible:false,
    attemptedActions:3,
    acceptedActions:2,
    decisionTrace,
    rootActionLedger:[{actionOrdinal:2,dispatchStatus:'not-dispatched'}],
    finalFullState:fullState('failure-final')
  };
  const failureEnvelope={
    fixtureFailure:{name:'PolicyDecodeFailure',stage:'policy-decode'},
    fixtureGamePartial:partial
  };

  const direct=runner.normalizeV3FixtureRoleResult(failureEnvelope);
  assert.equal(direct.roleResult,null);
  assert.equal(direct.failureEnvelope,failureEnvelope);
  assert.equal(direct.gameResult,partial);
  assert.equal(direct.gameResult.decisionTrace[0].dispatchStatus,'not-dispatched');

  const roleComposed={
    result:failureEnvelope,
    candidateAudit:{policyOwnerSeat:0},
    opponentAudit:{policyOwnerSeat:1},
    roleSeatMap:{candidate:0,opponent:1}
  };
  const nested=runner.normalizeV3FixtureRoleResult(roleComposed);
  assert.equal(nested.roleResult,roleComposed);
  assert.equal(nested.failureEnvelope,failureEnvelope);
  assert.equal(nested.gameResult,partial);
  assert.equal(nested.gameResult.decisionTrace,decisionTrace);
  assert.equal(nested.gameResult.finalFullState.visibility,
    'private-offline-diagnostic-only');
  const traceText=diagnostic.formatFixtureGameTraceText({
    fixtureOnly:true,
    admissionEligible:false,
    competitiveGameQualified:false,
    trialId:'fixture-normalization-test',
    vendorCommitSha:'0'.repeat(40),
    researchRevisionSha:'1'.repeat(40),
    seed:'fixture-seed',
    candidateSeat:0,
    opponentSeat:1,
    finished:false,
    endReason:'fixture-execution-failed',
    actions:2,
    attemptedActions:3,
    acceptedActions:2,
    turns:1,
    winnerSeat:null,
    decisionTrace:nested.gameResult.decisionTrace,
    rootActionLedger:nested.gameResult.rootActionLedger,
    finalFullState:nested.gameResult.finalFullState,
    failure:nested.failureEnvelope.fixtureFailure
  });
  assert.match(traceText,/ACTION #2/);
  assert.match(traceText,/dispatch=not-dispatched/);
  assert.match(traceText,/FINAL FULL STATE/);
  assert.match(traceText,/FAILURE/);

  const successGame={finished:true,endReason:'engine-game-end',decisionTrace:[]};
  const successWrapper={result:successGame,candidateAudit:{},opponentAudit:{}};
  const success=runner.normalizeV3FixtureRoleResult(successWrapper);
  assert.equal(success.roleResult,successWrapper);
  assert.equal(success.failureEnvelope,null);
  assert.equal(success.gameResult,successGame);
});

test('fixture runner injects offline full-state diagnostics and persists partial failures before rethrow', () => {
  const runnerSource = fs.readFileSync(path.join(ROOT, 'simulation/evaluation/2026-11/agent36-v3-runner.cjs'), 'utf8');
  assert.match(runnerSource,
    /diagnosticSnapshot:\s*diagnosticMode\s*===\s*'encrypted-full'\s*\?\s*diagnostic\.snapshotFullGameState\s*:\s*undefined/);
  assert.match(runnerSource,
    /requireFullStateDiagnostics:\s*diagnosticMode\s*===\s*'encrypted-full'/);
  const diagnosticRequire = runnerSource.indexOf("const diagnostic = require('../../twinleaf/2026-11/agent43-full-state-diagnostic.cjs')");
  const pinInstall = runnerSource.indexOf('runPinnedV3RoleRuntime({', diagnosticRequire);
  assert.ok(diagnosticRequire >= 0 && pinInstall > diagnosticRequire, 'diagnostic function reference must be captured before the fixture pin');
  assert.match(runnerSource, /fixtureGamePartial/);
  assert.match(runnerSource, /NonTerminalFixtureGame/);
  assert.match(runnerSource, /attemptedActionCount/);
  assert.match(runnerSource, /acceptedActionCount/);
  const artifactWrite = runnerSource.indexOf('writeJsonAtomic(outputPath,persistedArtifact)');
  const traceWrite = runnerSource.indexOf("fs.writeFileSync(traceTextPath,persistedTraceText,'utf8')");
  const failureRethrow = runnerSource.indexOf('throw error;', traceWrite);
  assert.ok(artifactWrite >= 0 && traceWrite > artifactWrite && failureRethrow > traceWrite, 'partial artifacts must be written before the workflow is failed');
});


test('V3 fixture pins candidate Quick Ball policy and routes owner prompts to role workers', () => {
  assert.equal(Object.hasOwn(runner.V3_FIXTURE, 'seed'), false,
    'the physical fixture seed must come only from a fresh public registration, never a hard-coded fallback');
  assert.equal(runner.V3_FIXTURE.trialId, 'agent36-v3-fixture-hood-rank1-worker-v1',
    'the fixed trial identifier is not a physical seed and remains part of the frozen fixture identity');
  assert.equal(runner.V3_FIXTURE.policyVersion,
    'agent34-actor-only-root-slice-v17-agent49-quick-ball-source-bound-v1');
  assert.deepEqual(runner.V3_FIXTURE_CANDIDATE_POLICY_OPTIONS, { quickBallRoot: true });
  assert.deepEqual(runner.V3_FIXTURE_OPPONENT_POLICY_OPTIONS, {},
    'rank-1 opponent policy remains unchanged');

  assert.deepEqual(runner.V3_FIXTURE_PROMPT_CHAIN.map(entry => entry.name), [
    'candidate-opponent-role-composition',
    'actor-only-root-policy',
    'native-prompt-resolution',
  ]);
  assert.ok(!runner.V3_FIXTURE_COMMON_BINDINGS.some(binding =>
    binding.name === 'quickBallPromptContinuation' ||
    binding.path === 'simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs'),
  'the unused synchronous Quick Ball continuation must not enter the V3 host closure');
  assert.ok(!runner.V3_FIXTURE_TEST_PATHS.includes(
    'tests/2026-11/agent49-owner-quick-ball-prompt-continuation.test.cjs'));
  assert.ok(runner.V3_FIXTURE_TEST_PATHS.includes(
    'tests/2026-11/agent46-candidate-policy.test.cjs'));
  assert.ok(!runner.V3_FIXTURE_TEST_PATHS.includes('tests/agent9-fog-actor-prompt.test.cjs'));

  const runnerSource = fs.readFileSync(
    path.join(ROOT, 'simulation/evaluation/2026-11/agent36-v3-runner.cjs'), 'utf8');
  const workerResolverAt = runnerSource.indexOf('function createV3WorkerDecisionResolver(');
  const typedPromptAt = runnerSource.indexOf('promptProjection.projectPrompt({', workerResolverAt);
  const workerPromptAt = runnerSource.indexOf('const response=await session.decide({', typedPromptAt);
  assert.ok(workerResolverAt >= 0 && typedPromptAt > workerResolverAt &&
    workerPromptAt > typedPromptAt,
  'V3 owner prompts must be typed and dispatched to the acting role worker');
  assert.match(runnerSource, /if\(projected\.hostOnly\)\{/);
  assert.match(runnerSource, /prompt:projected\.promptProjection/);
  assert.ok(!runnerSource.includes('withOwnerQuickBallPromptContinuation'),
  'V3 worker path must not import or claim the legacy synchronous Quick Ball wrapper');
  const candidateWorkerSource = fs.readFileSync(
    path.join(ROOT, runner.V3_FIXTURE.candidateWorkerPolicyPath), 'utf8');
  assert.match(candidateWorkerSource, /hasName\(name, 'Quick Ball'\) && hasDiscardableHand\(view, 1\)/);
  assert.match(candidateWorkerSource, /request\.prompt && view\.decisionKind === 'owner-prompt'/);
  assert.match(runnerSource, /workerExecutionAuditSha256:trial\.workerExecutionAuditSha256/);
  assert.match(runnerSource, /workerHostOnlyPromptCount:/);
});

test('V3 fixture diagnostics select encrypted-full only with a valid owner key and otherwise remain sanitized-only', () => {
  const workflowPath = path.join(ROOT, '.github/workflows/agent36-bilateral-competence-v9.yml');
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  const modeAt = workflow.indexOf('Select encrypted or sanitized-only V3 diagnostic mode');
  const compileAt = workflow.indexOf('Install and compile the pinned native server');
  const gameAt = workflow.indexOf('Execute paired V3 physical-seat fixture games');
  const encryptAt = workflow.indexOf('Encrypt private V3 fixture diagnostics before artifact upload');
  const uploadAt = workflow.indexOf('Preserve the complete v9 root ledger and owner-only aftergame evidence');
  assert.ok(modeAt >= 0 && compileAt > modeAt && gameAt > compileAt &&
    encryptAt > gameAt && uploadAt > encryptAt,
  'diagnostic selection, compile, game, encryption, and upload must occur in that order');

  const modeStep = workflow.slice(modeAt, compileAt);
  assert.ok(modeStep.includes('if: ${{ inputs.agent36_v3_fixture_game }}'));
  assert.ok(modeStep.includes('AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM: ${{ vars.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM }}'));
  assert.ok(modeStep.includes('crypto.createPublicKey(pem)'));
  assert.ok(modeStep.includes("key.asymmetricKeyType !== 'rsa'"));
  assert.ok(modeStep.includes('bits < 2048'));
  assert.ok(modeStep.includes("mode=sanitized-only\\n"));
  assert.ok(modeStep.includes("mode=encrypted-full\\n"));
  assert.ok(modeStep.includes('captures no full state.'),
    'missing key must explicitly select sanitized-only diagnostics without capturing full state');

  const heredocAt = modeStep.indexOf("node - <<'NODE'\n");
  const heredocEnd = modeStep.indexOf("\n          NODE", heredocAt);
  assert.ok(heredocAt >= 0 && heredocEnd > heredocAt,
    'diagnostic mode selection must contain an executable Node heredoc');
  const scriptStart = heredocAt + "node - <<'NODE'\n".length;
  const script = modeStep.slice(scriptStart, heredocEnd).split('\n')
    .map(line => line.startsWith('          ') ? line.slice(10) : line).join('\n');
  const tempDir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'agent36-v3-key-preflight-'));
  const outputPath = path.join(tempDir, 'github-output.txt');
  try {
    const rsa = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const publicPem = rsa.publicKey.export({ type: 'spki', format: 'pem' });
    const validRun = spawnSync(process.execPath, ['-e', script], {
      encoding: 'utf8',
      env: { ...process.env, GITHUB_OUTPUT: outputPath, AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM: publicPem }
    });
    assert.equal(validRun.status, 0, validRun.stderr || 'valid RSA-2048 recipient key should pass preflight');
    assert.match(fs.readFileSync(outputPath, 'utf8'), /mode=encrypted-full/);

    fs.writeFileSync(outputPath, '');
    const missingEnv = { ...process.env, GITHUB_OUTPUT: outputPath };
    delete missingEnv.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM;
    const missingRun = spawnSync(process.execPath, ['-e', script], {
      encoding: 'utf8',
      env: missingEnv
    });
    assert.equal(missingRun.status, 0, missingRun.stderr || 'missing key must select sanitized-only mode');
    assert.match(fs.readFileSync(outputPath, 'utf8'), /mode=sanitized-only/);
    assert.match(missingRun.stdout, /captures no full state/);

    fs.writeFileSync(outputPath, '');
    const ec = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const invalidRun = spawnSync(process.execPath, ['-e', script], {
      encoding: 'utf8',
      env: { ...process.env, GITHUB_OUTPUT: outputPath,
        AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM: ec.publicKey.export({ type: 'spki', format: 'pem' }) }
    });
    assert.notEqual(invalidRun.status, 0, 'non-RSA recipient key must fail preflight');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const encryptionStep = workflow.slice(encryptAt, uploadAt);
  assert.ok(encryptionStep.includes("if: ${{ always() && inputs.agent36_v3_fixture_game && steps.diagnostic_recipient.outputs.mode == 'encrypted-full' }}"),
    'private diagnostics must be encrypted when and only when encrypted-full mode was selected');
  assert.ok(encryptionStep.includes('AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM: ${{ vars.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM }}'));

  const uploadStep = workflow.slice(uploadAt, uploadAt + 4200);
  assert.ok(uploadStep.includes('fixture-game.private.enc.json'));
  assert.ok(uploadStep.includes('fixture-game.public-manifest.json'));
  assert.ok(uploadStep.includes('fixture-game.sanitized.json'));
  assert.ok(uploadStep.includes('!artifacts/agent36-v3-fixture/candidate-seat-0/fixture-game.json'));
  assert.ok(uploadStep.includes('!artifacts/agent36-v3-fixture/candidate-seat-1/fixture-game.txt'));
});


test('fixture CLI logs only a safe summary while full-state traces stay in artifacts', () => {
  const runnerSource = fs.readFileSync(path.join(ROOT, 'simulation/evaluation/2026-11/agent36-v3-runner.cjs'), 'utf8');
  const summaryStart = runnerSource.indexOf("  return {\n    artifactPath:");
  const summaryEnd = runnerSource.indexOf("\n  };", summaryStart);
  assert.ok(summaryStart >= 0 && summaryEnd > summaryStart, 'fixture success return must be an explicit summary');
  const summary = runnerSource.slice(summaryStart, summaryEnd);
  assert.doesNotMatch(summary, /\bdecisionTrace\s*:|\brootActionLedger\s*:|\bfinalFullState\s*:|\bfixtureGamePartial\s*:|private-offline-diagnostic-only/);

  const commandStart = runnerSource.indexOf("if(command==='fixture-game')");
  const commandEnd = runnerSource.indexOf('\n  const repositoryRoot', commandStart);
  assert.ok(commandStart >= 0 && commandEnd > commandStart, 'fixture CLI command branch must be identifiable');
  const command = runnerSource.slice(commandStart, commandEnd);
  assert.match(command, /JSON\.stringify\(result,null,2\)/);
  assert.doesNotMatch(command, /decisionTrace|rootActionLedger|fullState|fixtureGamePartial/,
    'public Actions logs must not serialize the private fixture artifact');

  assert.ok(command.includes("process.stdout.write(JSON.stringify(result,null,2)+'\\n')"),
    'the CLI may emit only the explicit safe result summary');

  const catchAt = runnerSource.indexOf('main().catch(error=>');
  assert.ok(catchAt >= 0, 'CLI error boundary must be explicit');
  const catchBlock = runnerSource.slice(catchAt);
  assert.ok(catchBlock.includes('String(error?.stack||error)'));
  assert.doesNotMatch(catchBlock, /fixtureFailure|decisionTrace|rootActionLedger|finalFullState|fixtureGamePartial/,
    'CLI error logs must not serialize private diagnostic fields');
});

test('no-game seed probe resolves only exact GO_FIRST with the frozen workers affirmative choice', () => {
  class ResolvePromptAction {
    constructor(id,result){this.id=id;this.result=result;}
  }
  class ConfirmPrompt {
    constructor(id,message){this.id=id;this.message=message;}
  }
  let legacyCalls=0;
  const legacyRandomSource=()=>0.25;
  const legacyBot={
    decodeNextAction(state){
      legacyCalls++;
      return new ResolvePromptAction(state.promptId,false);
    }
  };
  const requestFor=prompt=>({
    prompt,
    native:{ResolvePromptAction},
    legacyBot,
    legacyRandomSource,
    state:{promptId:prompt.id}
  });
  const originalRandom=Math.random;
  const goFirst=runner.resolveNoGameWitnessSeedPrompt(
    requestFor(new ConfirmPrompt(17,'GO_FIRST'))
  );
  assert.ok(goFirst instanceof ResolvePromptAction);
  assert.equal(goFirst.id,17);
  assert.equal(goFirst.result,true);
  assert.equal(legacyCalls,0,'GO_FIRST must match the actual frozen V3 worker policies');
  assert.equal(Math.random,originalRandom,'the probe must not leave the legacy RNG installed');

  assert.throws(() => runner.resolveNoGameWitnessSeedPrompt(
    requestFor(new ConfirmPrompt(18,'OTHER_SETUP_PROMPT'))
  ), error => error.code === 'NO_GAME_WITNESS_SETUP_INCOMPATIBLE');
  assert.equal(legacyCalls,0,'unsupported owner prompts must not fall through to the legacy resolver');

  const candidatePolicySource=fs.readFileSync(
    path.join(ROOT,runner.V3_FIXTURE.candidateWorkerPolicyPath),'utf8');
  const opponentPolicySource=fs.readFileSync(
    path.join(ROOT,runner.V3_FIXTURE.opponentWorkerPolicyPath),'utf8');
  assert.match(candidatePolicySource,
    /function chooseGoFirstSetup\(prompt\)[\s\S]*?return \{ kind: 'select-choice', token: yes\[0\]\.token \};/);
  assert.match(opponentPolicySource,
    /prompt\.description === 'GO_FIRST'[\s\S]*?return \{ kind: 'select-choice', token: yes\.token \};/);
});

test('no-game seed-probe classification exposes only safe retry categories', () => {
  const setupError=new Error('private setup prompt canary');
  setupError.code='NO_GAME_WITNESS_SETUP_INCOMPATIBLE';
  setupError.seedProbeReason='unsupportedOwnerPrompt';
  assert.deepEqual(runner.classifyNoGameWitnessSeedProbeFailure({
    error:setupError,observedActorSeat:null,targetActorSeat:0,seed:'private-seed-canary'
  }),{kind:'retry',reason:'setup-incompatible',setupReason:'unsupportedOwnerPrompt'});

  const wrongSeatError=new Error('private wrong-seat prompt canary');
  wrongSeatError.code='NO_GAME_WITNESS_SEED_PROBE_STOP';
  assert.deepEqual(runner.classifyNoGameWitnessSeedProbeFailure({
    error:wrongSeatError,observedActorSeat:1,targetActorSeat:0,seed:'private-seed-canary'
  }),{kind:'retry',reason:'wrong-seat-root',observedActorSeat:1});

  const foundError=new Error('private found prompt canary');
  foundError.code='NO_GAME_WITNESS_SEED_PROBE_STOP';
  assert.deepEqual(runner.classifyNoGameWitnessSeedProbeFailure({
    error:foundError,observedActorSeat:0,targetActorSeat:0,seed:'registered-seed'
  }),{kind:'found',seed:'registered-seed'});
});

test('no-game seed-probe retains bounded attempt-4 prompt class identity without payload',()=>{
  class CoinFlipPrompt {
    constructor(){
      this.id='private-prompt-id';
      this.message='PRIVATE_PROMPT_CANARY';
      this.playerId=101;
      this.options={min:0,max:1,allowCancel:false};
      this.hands=['private hand canary'];
    }
  }
  class ResolvePromptAction {}
  const NativeCoinFlipPrompt=class CoinFlipPrompt {};
  const NativeShuffleDeckPrompt=class ShuffleDeckPrompt {};
  const NativeWaitPrompt=class WaitPrompt {};
  const request={
    prompt:new CoinFlipPrompt(),
    native:{
      ResolvePromptAction,CoinFlipPrompt:NativeCoinFlipPrompt,
      ShuffleDeckPrompt:NativeShuffleDeckPrompt,WaitPrompt:NativeWaitPrompt
    },
    state:{phase:1,activePlayer:0},
    actorSeat:0
  };
  const expected={
    schema:'agent49-v3-safe-prompt-identity-v1',
    attemptIndex:4,promptClass:'CoinFlipPrompt',message:'OTHER',
    phase:1,actorSeat:0,activePlayerSeat:0,
    min:0,max:1,allowCancel:false,
    instanceof:{coinFlipPrompt:false,shuffleDeckPrompt:false,waitPrompt:false}
  };
  let failure;
  assert.throws(()=>runner.resolveNoGameWitnessSeedPrompt(request,{
    candidateSeat:0,opponentSeat:1,attemptIndex:4
  }),error=>{
    failure=error;
    assert.equal(error.code,'NO_GAME_WITNESS_SETUP_INCOMPATIBLE');
    assert.deepEqual(error.safePromptIdentity,expected);
    return true;
  });
  const disposition=runner.classifyNoGameWitnessSeedProbeFailure({
    error:failure,observedActorSeat:null,targetActorSeat:0,seed:'private-seed-canary'
  });
  assert.deepEqual(disposition,{
    kind:'retry',reason:'setup-incompatible',setupReason:'unsupportedOwnerPrompt',
    safePromptIdentity:expected
  });
  const serialized=JSON.stringify(disposition);
  for(const forbidden of ['private-prompt-id','PRIVATE_PROMPT_CANARY','private hand canary','private-seed-canary'])
    assert.equal(serialized.includes(forbidden),false,forbidden+' must not enter safe prompt identity');
});

test('no-game failure receipt projects only allowlisted worker and native failure fields', () => {
  const workerAudit={
    schema:'agent49-v3-worker-execution-audit-v1',
    roles:{
      candidate:{
        role:'candidate',seat:0,policyVersion:'candidate-policy-v1',
        bundleSha256:'a'.repeat(64),policySha256:'b'.repeat(64),
        decisionCount:2,rootDecisionCount:1,promptDecisionCount:1,
        rootActionFrontierAdmissionCount:1,rootActionFrontierAdmissionReceipts:[{
          privatePrompt:'private prompt canary'
        }],actionFrontierAdmissionFailureCount:0,hostOnlyPromptCount:0,
        abstentionCount:0,failureCount:1,timeoutCount:0,
        lastFailureCode:'NATIVE_FIXTURE_CLEANUP_FAILURE',
        workerProcessClosed:false,containerRemoved:false,policyBundleRemoved:false,
        containerIdSha256:'c'.repeat(64),policyStreamProtocol:'json-lines-v1',
        policyDrawCount:0,policyDrawCounts:[0],policyDrawViolationCount:0,
        policyRngReplayable:true,rawStderr:'private stderr canary'
      },
      opponent:{
        role:'opponent',seat:1,policyVersion:'opponent-policy-v1',
        bundleSha256:'d'.repeat(64),policySha256:'e'.repeat(64),
        decisionCount:0,rootDecisionCount:0,promptDecisionCount:0,
        rootActionFrontierAdmissionCount:0,actionFrontierAdmissionFailureCount:0,
        hostOnlyPromptCount:0,abstentionCount:0,failureCount:0,timeoutCount:0,
        lastFailureCode:null,workerProcessClosed:false,containerRemoved:false,
        policyBundleRemoved:false,containerIdSha256:null,policyStreamProtocol:null,
        policyDrawCount:null,policyDrawCounts:[],policyDrawViolationCount:0,
        policyRngReplayable:true
      }
    },
    totalWorkerDecisions:2,totalHostOnlyPrompts:0,totalAbstentions:0,
    totalFailures:1,policyRngViolations:0,replayableEvidence:true,
    cleanupVerified:false,cleanupFailureCount:1,
    cleanupReceipts:[{
      role:'candidate',processClosed:false,containerRemoved:false,
      stderr:'private cleanup stderr canary'
    }],
    physicalSeedDisclosedToWorker:false,policySeedDisclosedToWorker:false,
    nativeStateDisclosedToWorker:false,opponentPrivateZonesDisclosedToWorker:false,
    hiddenZone:'private audit canary'
  };
  const error=new Error('private hidden-zone message canary');
  error.code='NATIVE_FIXTURE_CLEANUP_FAILURE';
  error.fixtureFailure={
    name:'NativeFixtureFailure',
    code:'NATIVE_FIXTURE_CLEANUP_FAILURE',
    stage:'cleanup',
    messageSha256:'f'.repeat(64),
    messageLength:28,
    nativeFixtureFailure:{
      stage:'cleanup',code:'NATIVE_FIXTURE_CLEANUP_FAILURE',
      actionOrdinal:4,actingSeat:0,actingPlayerId:101,
      phaseBefore:'player-turn',turnBefore:3,
      pendingPromptType:'ConfirmPrompt',pendingPromptId:19,
      actionName:'PlayCardAction',actionPayloadSha256:'1'.repeat(64),
      name:'Error',messageSha256:'2'.repeat(64),messageLength:18,
      primaryFailure:{
        stage:'dispatch',code:'NATIVE_FIXTURE_FAILURE',name:'Error',
        messageSha256:'3'.repeat(64),messageLength:20
      }
    }
  };
  error.workerAudit=workerAudit;
  error.fixtureGamePartial={
    seed:'private physical seed canary',
    finalFullState:{hand:['private card-zone canary']},
    decisionTrace:[{prompt:'private prompt canary'}]
  };
  error.seedProbeSummary={
    candidateSeat:0,targetActorSeat:0,attempts:64,
    setupIncompatibleByReason:{mulliganPromptShape:1,unsupportedOwnerPrompt:2,untrustedReason:999},
    wrongSeatRootCounts:{seat0:3,seat1:4,unknown:5,privateSeat:999},
    firstUnsupportedPrompt:{
      attemptIndex:0,promptClass:'CoinFlipPrompt',message:'GO_FIRST',
      phase:1,actorSeat:0,activePlayerSeat:0,min:0,max:1,allowCancel:false,
      instanceof:{coinFlipPrompt:false,shuffleDeckPrompt:false,waitPrompt:false},
      promptId:'private-prompt-id',rawMessage:'private prompt text'
    },
    attempt4UnsupportedPrompt:{
      attemptIndex:4,promptClass:'CoinFlipPrompt',message:'PRIVATE_PROMPT_CANARY',
      phase:1,actorSeat:0,activePlayerSeat:0,min:0,max:1,allowCancel:false,
      instanceof:{coinFlipPrompt:false,shuffleDeckPrompt:false,waitPrompt:false},
      promptId:'private-prompt-id',hands:['private hand canary']
    },
    seed:'private seed probe canary',lastPrompt:'private seed prompt canary'
  };

  const receipt=runner.buildNoGameWitnessFailureReceipt({
    error,candidateSeat:0,opponentSeat:1,actorSeat:1,
    stage:'native-no-game-witness',
    runnerRevision:'4'.repeat(40),enginePin:'5'.repeat(40),
    candidatePolicy:{policySha256:'6'.repeat(64),POLICY_VERSION:'candidate-policy-v1'},
    opponentPolicy:{policySha256:'7'.repeat(64),POLICY_VERSION:'opponent-policy-v1'},
    completedWitnesses:[{candidateSeat:0,opponentSeat:1,actorSeat:0}]
  });
  assert.equal(receipt.schema,'agent36-v3-native-no-game-witness-failure-v1');
  assert.equal(receipt.coverageComplete,false);
  assert.equal(receipt.expectedWitnessCount,4);
  assert.equal(receipt.completedWitnessCount,1);
  assert.deepEqual(receipt.coverage,[
    {candidateSeat:0,opponentSeat:1,actorSeat:0,status:'passed'},
    // These allowlisted fields preserve the attempted seat and explicitly show
    // that no actual actor seat was observed before the cleanup failure.
    {candidateSeat:0,opponentSeat:1,actorSeat:1,expectedActorSeat:1,actualActorSeat:null,status:'failed'}
  ]);
  assert.equal(receipt.expectedActorSeat,1);
  assert.equal(receipt.actualActorSeat,null);
  assert.equal(receipt.fixtureFailure.nativeFixtureFailure.stage,'cleanup');
  assert.equal(receipt.fixtureFailure.nativeFixtureFailure.primaryFailure.stage,'dispatch');
  assert.deepEqual(receipt.seedProbeSummary,{
    schema:'agent49-v3-no-game-seed-probe-summary-v2',
    candidateSeat:0,targetActorSeat:0,attempts:64,
    setupIncompatibleByReason:{
      mulliganPromptShape:1,mulliganPromptOwnerMismatch:0,
      startingPokemonPromptShape:0,startingPokemonBounds:0,
      startingPokemonInsufficientChoices:0,opponentActiveStateMismatch:0,
      startingPokemonMinimumUnmet:0,unsupportedOwnerPrompt:2,otherSetupIncompatible:0
    },
    setupIncompatibleCount:3,
    wrongSeatRootCounts:{seat0:3,seat1:4,unknown:5},
    wrongSeatRootCount:12,
    firstUnsupportedPrompt:{
      schema:'agent49-v3-safe-prompt-identity-v1',
      attemptIndex:0,promptClass:'CoinFlipPrompt',message:'GO_FIRST',
      phase:1,actorSeat:0,activePlayerSeat:0,min:0,max:1,allowCancel:false,
      instanceof:{coinFlipPrompt:false,shuffleDeckPrompt:false,waitPrompt:false}
    },
    attempt4UnsupportedPrompt:{
      schema:'agent49-v3-safe-prompt-identity-v1',
      attemptIndex:4,promptClass:'CoinFlipPrompt',message:'OTHER',
      phase:1,actorSeat:0,activePlayerSeat:0,min:0,max:1,allowCancel:false,
      instanceof:{coinFlipPrompt:false,shuffleDeckPrompt:false,waitPrompt:false}
    }
  });
  assert.equal(receipt.workerAudit.roles.candidate.policySha256,'b'.repeat(64));
  assert.deepEqual(receipt.workerAudit.cleanupReceipts,[{
    role:'candidate',processClosed:false,containerRemoved:false
  }]);
  const serialized=JSON.stringify(receipt);
  for(const forbidden of [
    'private prompt canary','private stderr canary','private cleanup stderr canary',
    'private audit canary','private hidden-zone message canary',
    'private physical seed canary','private card-zone canary',
    'private seed probe canary','private seed prompt canary',
    'private-prompt-id','private prompt text','private hand canary',
    'actingPlayerId','pendingPromptId','rootActionFrontierAdmissionReceipts',
    'rawStderr','fixtureGamePartial','finalFullState'
  ])assert.equal(serialized.includes(forbidden),false,forbidden+' must not enter the failure receipt');
});
