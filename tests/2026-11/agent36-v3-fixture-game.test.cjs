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
  assert.notEqual(native.botOptionsBySeat[0], native.botOptionsBySeat[1]);
  assert.notEqual(native.botOptionsBySeat[0].arbiter, native.botOptionsBySeat[1].arbiter);
  assert.notEqual(native.botOptionsBySeat[0].tactics, native.botOptionsBySeat[1].tactics);
});

test('fixture trial binds both role execution audits to a canonical policy digest', () => {
  const audit = (seat) => ({
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
  });
  const args = {
    trialId: 'agent36-v3-fixture-audit-test',
    candidateSeat: 0,
    opponentSeat: 1,
    candidateIdentity: { policySha256: 'a'.repeat(64) },
    opponentIdentity: { policySha256: 'b'.repeat(64) },
    roleResult: { candidateAudit: audit(0), opponentAudit: audit(1) },
  };
  const summary = runner.createFixtureActorOnlyPolicyExecutionAudit(args);
  assert.equal(summary.trialId, args.trialId);
  assert.equal(summary.candidate.policyOwnerSeat, 0);
  assert.equal(summary.opponent.policyOwnerSeat, 1);
  assert.equal(summary.candidate.nativeOwnerTrainerFallbackEnabled, false);
  assert.equal(summary.opponent.unsupportedPromptFallbacks, 0);
  assert.match(summary.sha256, /^[0-9a-f]{64}$/);

  const changed = runner.createFixtureActorOnlyPolicyExecutionAudit({
    ...args,
    roleResult: {
      candidateAudit: { ...audit(0), unsupportedPromptFallbacks: 1 },
      opponentAudit: audit(1),
    },
  });
  assert.notEqual(changed.sha256, summary.sha256,
    'a changed role fallback counter must change the trial-bound audit digest');
  assert.throws(() => runner.createFixtureActorOnlyPolicyExecutionAudit({
    ...args,
    roleResult: { candidateAudit: audit(1), opponentAudit: audit(1) },
  }), /wrong physical seat/);
  assert.equal(runner.createFixtureActorOnlyPolicyExecutionAudit({
    ...args, roleResult: null,
  }), null);

  const runnerSource = fs.readFileSync(
    path.join(ROOT, 'simulation/evaluation/2026-11/agent36-v3-runner.cjs'), 'utf8');
  assert.match(runnerSource,
    /actorOnlyPolicyExecutionAudit:\s*createFixtureActorOnlyPolicyExecutionAudit\(/);
  assert.match(runnerSource,
    /actorOnlyPolicyExecutionAudit,\s*runtimePinEvidence/);
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
  }
  assert.equal(plan.policyPlanCore.constraints.gameRuleset, 'Expanded');
  assert.equal(plan.policyPlanCore.constraints.opponentSourceEventFormat, 'Japanese Extra');
  const runnerSource = fs.readFileSync(
    path.join(ROOT, 'simulation/evaluation/2026-11/agent36-v3-runner.cjs'), 'utf8');
  assert.match(runnerSource, /gameRuleset: trial\.gameRuleset/);
  assert.match(runnerSource, /opponentSourceEventFormat: trial\.opponentSourceEventFormat/);
});

test('string trial seed maps deterministically to a recorded uint32 stream seed', () => {
  const seed = 'agent36-v3-fixture-hood-rank1-20261112-01';
  const first = fixtureGame.normalizeSeed32(seed);
  const second = fixtureGame.normalizeSeed32(seed);
  assert.equal(first, second);
  assert.ok(Number.isInteger(first) && first >= 0 && first <= 0xffffffff);
  assert.notEqual(first, 0);
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
  const sourceLimitations = built.manifest.sourceAuditLimitations || {};
  for (const [name, values] of Object.entries(sourceLimitations)) {
    if (name === 'dynamicRequireSites') {
      // Keep every known path-derived require site explicit. The fixture-scoped
      // Module._load guard rejects any actual module request outside the frozen
      // role map; this static limitation does not certify full-process closure.
      const actualSites = values.map((value) => ({
        file: value.file,
        count: value.count,
      })).sort((a, b) => a.file.localeCompare(b.file));
      const expectedSites = [
        { file: 'simulation/twinleaf/agent12-actor-only-lillie-after-pass.cjs', count: 3 },
        { file: 'simulation/twinleaf/agent37/native-genesect-power-availability.cjs', count: 1 },
        { file: 'simulation/twinleaf/agent4-underworld-visible-thorns-veto.cjs', count: 1 },
        { file: 'simulation/twinleaf/agent41-actor-owner-single-search.cjs', count: 4 },
        { file: 'simulation/twinleaf/agent43-guzma-prompt-continuation.cjs', count: 2 },
        { file: 'simulation/twinleaf/agent47-actor-hand-discard.cjs', count: 3 },
        { file: 'simulation/twinleaf/agent5-owner-root-slice.cjs', count: 1 },
        { file: 'simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs', count: 3 },
        { file: 'simulation/twinleaf/agent8-funded-apex-compressor-owner-bridge.cjs', count: 1 },
        { file: 'simulation/twinleaf/copycat-multiattack-history.cjs', count: 3 },
        { file: 'simulation/twinleaf/cynthia-caitlin-required-recovery.cjs', count: 1 },
        { file: 'simulation/twinleaf/put-damage-zero-cap-paper-hook.cjs', count: 3 },
      ].sort((a, b) => a.file.localeCompare(b.file));
      assert.deepEqual(actualSites, expectedSites,
        'known dynamic require sites changed; review the frozen role closure');
    } else {
      assert.deepEqual(values, [], 'source audit limitation ' + name + ' must be empty');
    }
  }
  assert.ok(built.manifest.vendorDependencies.some((item) => item.path === 'vendor/twinleaf/ptcg-server/start.js'));
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
  assert.match(runnerSource, /diagnosticSnapshot:\s*diagnostic\.snapshotFullGameState/);
  assert.match(runnerSource, /requireFullStateDiagnostics:\s*true/);
  const diagnosticRequire = runnerSource.indexOf("const diagnostic = require('../../twinleaf/2026-11/agent43-full-state-diagnostic.cjs')");
  const pinInstall = runnerSource.indexOf('runPinnedV3RoleRuntime({', diagnosticRequire);
  assert.ok(diagnosticRequire >= 0 && pinInstall > diagnosticRequire, 'diagnostic function reference must be captured before the fixture pin');
  assert.match(runnerSource, /fixtureGamePartial/);
  assert.match(runnerSource, /NonTerminalFixtureGame/);
  assert.match(runnerSource, /attemptedActionCount/);
  assert.match(runnerSource, /acceptedActionCount/);
  const artifactWrite = runnerSource.indexOf('writeJsonAtomic(outputPath, artifact)');
  const traceWrite = runnerSource.indexOf("fs.writeFileSync(traceTextPath, traceText, 'utf8')");
  const failureRethrow = runnerSource.indexOf('throw error;', traceWrite);
  assert.ok(artifactWrite >= 0 && traceWrite > artifactWrite && failureRethrow > traceWrite, 'partial artifacts must be written before the workflow is failed');
});


test('V3 fixture requires a valid owner diagnostic recipient and always encrypts before upload', () => {
  const workflowPath = path.join(ROOT, '.github/workflows/agent36-bilateral-competence-v9.yml');
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  const keyGuardAt = workflow.indexOf('Validate owner-controlled V3 diagnostic recipient key before native fixture');
  const compileAt = workflow.indexOf('Install and compile the pinned native server');
  const gameAt = workflow.indexOf('Execute one native V3 fixture game');
  const encryptAt = workflow.indexOf('Encrypt private V3 fixture diagnostics before artifact upload');
  const uploadAt = workflow.indexOf('Preserve the complete v9 root ledger and owner-only aftergame evidence');
  assert.ok(keyGuardAt >= 0 && compileAt > keyGuardAt && gameAt > compileAt && encryptAt > gameAt && uploadAt > encryptAt,
    'key validation, compile, game, encryption, and upload must occur in that order');

  const keyGuard = workflow.slice(keyGuardAt, compileAt);
  assert.ok(keyGuard.includes('if: ${{ inputs.agent36_v3_fixture_game }}'));
  assert.ok(keyGuard.includes('AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM: ${{ vars.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM }}'));
  assert.ok(keyGuard.includes('crypto.createPublicKey(pem)'));
  assert.ok(keyGuard.includes("key.asymmetricKeyType !== 'rsa'"));
  assert.ok(keyGuard.includes('bits < 2048'));

  const heredocAt = keyGuard.indexOf("node - <<'NODE'\n");
  const heredocEnd = keyGuard.indexOf("\n          NODE", heredocAt);
  assert.ok(heredocAt >= 0 && heredocEnd > heredocAt, 'the key preflight must contain an executable Node heredoc');
  const scriptStart = heredocAt + "node - <<'NODE'\n".length;
  const script = keyGuard.slice(scriptStart, heredocEnd).split('\n')
    .map(line => line.startsWith('          ') ? line.slice(10) : line).join('\n');

  const rsa = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicPem = rsa.publicKey.export({ type: 'spki', format: 'pem' });
  const validRun = spawnSync(process.execPath, ['-e', script], {
    encoding: 'utf8',
    env: { ...process.env, AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM: publicPem }
  });
  assert.equal(validRun.status, 0, validRun.stderr || 'valid RSA-2048 recipient key should pass preflight');

  const missingEnv = { ...process.env };
  delete missingEnv.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM;
  const missingRun = spawnSync(process.execPath, ['-e', script], {
    encoding: 'utf8',
    env: missingEnv
  });
  assert.notEqual(missingRun.status, 0, 'missing recipient key must fail before native compilation');

  const ec = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const invalidRun = spawnSync(process.execPath, ['-e', script], {
    encoding: 'utf8',
    env: { ...process.env, AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM:
      ec.publicKey.export({ type: 'spki', format: 'pem' }) }
  });
  assert.notEqual(invalidRun.status, 0, 'non-RSA recipient key must fail preflight');

  const encryptionStep = workflow.slice(encryptAt, uploadAt);
  assert.ok(encryptionStep.includes('if: ${{ always() && !inputs.contract_only }}'),
    'private diagnostics must still be encrypted when the game step fails');
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

  assert.ok(runnerSource.includes("partial artifacts preserved: ' : 'Native V3 fixture game completed: ') + outputPath"),
    'failure logs may identify the artifact path but not print its contents');

  const catchAt = runnerSource.indexOf('main().catch(error=>');
  assert.ok(catchAt >= 0, 'CLI error boundary must be explicit');
  const catchBlock = runnerSource.slice(catchAt);
  assert.ok(catchBlock.includes('String(error?.stack||error)'));
  assert.doesNotMatch(catchBlock, /fixtureFailure|decisionTrace|rootActionLedger|finalFullState|fixtureGamePartial/,
    'CLI error logs must not serialize private diagnostic fields');
});
