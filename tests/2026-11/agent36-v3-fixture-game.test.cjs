'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const runner = require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const fixtureGame = require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');
const roleIdentity = require('../../simulation/evaluation/2026-11/agent42-role-policy-identity.cjs');

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
      // Agent34's existing root policy reaches this known Agent12 helper.
      // Keep the static limitation visible; the fixture-scoped Module._load
      // guard separately rejects any unregistered module actually requested.
      assert.deepEqual(values, [{
        modulePath: 'scripts/agent12-actor-only-lillie-after-pass.cjs',
        count: 3,
      }]);
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
  assert.equal(Object.prototype.hasOwnProperty.call(built.expectedByPath, diagnosticPath), false, 'full-state serializer must not enter the policy module closure');
});
