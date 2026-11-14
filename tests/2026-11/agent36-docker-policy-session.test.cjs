'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  IMAGE_DIGEST,
  sha256,
  preflightDockerPolicySandbox,
  createPolicyBundle,
  cleanupPolicyBundle
} = require('../../simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs');
const { createDockerPolicySession } = require('../../simulation/evaluation/2026-11/agent36-docker-policy-session.cjs');

const WORKER_SOURCE = path.resolve(__dirname,
  '../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const POLICY_VERSION = 'agent36-docker-session-smoke-v1';

function publicRestrictions() {
  return {
    gxUsed: false,
    vstarUsed: false,
    attackLockTurnsRemaining: 0,
    attackMaxEnergy: null,
    attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [],
    ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false,
    pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false,
    itemPlayLocked: false,
    supporterPlayLocked: false,
    stadiumPlayLocked: false,
    toolPlayLocked: false,
    energyPlayLocked: false,
    specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: 0
  };
}

function publicPlayer() {
  return {
    active: null,
    bench: [null, null, null, null, null],
    stadium: [],
    discard: [],
    lostZone: [],
    resolvingSupporter: [],
    publicHand: null,
    prizeSlots: [],
    publicTurnRestrictions: publicRestrictions(),
    handCount: 0,
    deckCount: 60,
    prizeCount: 0
  };
}

function observation(seat, decisionKind = 'owner-root') {
  const pending = decisionKind === 'owner-prompt';
  return {
    actorSeat: seat,
    globalTurn: 1,
    phase: 2,
    decisionKind,
    pendingPromptType: pending ? 'ChooseCardsPrompt' : null,
    pendingOwnerDeckSearch: false,
    ownHand: ['Psychic Energy SVE', 'Quick Ball FST'],
    ownPublic: publicPlayer(),
    opponentPublic: publicPlayer(),
    ownTurnResources: {
      supporterPlayedTurn: 0,
      retreatedTurn: 0,
      extraTurnActive: false,
      energyPlayedTurn: false,
      stadiumPlayedTurn: false,
      stadiumUsedTurn: false,
      vstarUsed: false,
      pokemonPlayLocked: false,
      abilityPokemonPlayLocked: false,
      evolutionPlayLocked: false,
      itemPlayLocked: false,
      supporterPlayLocked: false,
      stadiumPlayLocked: false,
      toolPlayLocked: false,
      energyPlayLocked: false,
      specialEnergyPlayLocked: false
    },
    ownerK1: null
  };
}

function rootFrontier() {
  return {
    schema: protocol.FRONTIER_SCHEMA,
    items: [
      { token: 'attack-max-geist', kind: 'attack', attackName: 'Max Geist' },
      { token: 'pass-turn', kind: 'pass' }
    ]
  };
}

function promptProjection(seat) {
  return {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: seat,
    promptType: 'ChooseCardsPrompt',
    description: 'Select an owner-visible payment card',
    source: {
      classification: 'actor-choice',
      sourcePrinting: 'Quick Ball FST',
      effectName: 'Quick Ball'
    },
    choices: [{
      token: 'pay-psychic-energy',
      kind: 'payment',
      printing: 'Psychic Energy SVE',
      publicMetadata: { sourceZone: 'hand', isOwnerVisible: true }
    }]
  };
}

function makePolicySource() {
  return [
    "'use strict';",
    "const POLICY_VERSION = '" + POLICY_VERSION + "';",
    "async function createPolicy(context) {",
    "  return { async decide(request) {",
    "    if (request.role !== context.role || request.seat !== context.seat) {",
    "      return { kind: 'abstain', reasonCode: 'ROLE_BINDING_MISMATCH' };",
    "    }",
    "    if (request.prompt) {",
    "      const choice = request.prompt.choices[0];",
    "      return choice ? { kind: 'select-choice', token: choice.token } :",
    "        { kind: 'abstain', reasonCode: 'NO_VISIBLE_CHOICE' };",
    "    }",
    "    const attack = request.actionFrontier.items.find(item => item.kind === 'attack');",
    "    return attack ? { kind: 'select-action', token: attack.token } :",
    "      { kind: 'abstain', reasonCode: 'NO_LEGAL_ACTION' };",
    "  } };",
    "}",
    "module.exports = { POLICY_VERSION, createPolicy };"
  ].join('\n');
}

function buildBundle() {
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent36-session-source-'));
  const workerPath = path.join(sourceRoot, 'worker.cjs');
  const policyPath = path.join(sourceRoot, 'policy.cjs');
  fs.copyFileSync(WORKER_SOURCE, workerPath);
  fs.writeFileSync(policyPath, makePolicySource(), { mode: 0o600 });
  const bundle = createPolicyBundle({
    sourceRoot,
    policyFiles: [
      {
        sourcePath: workerPath,
        relativePath: 'worker.cjs',
        sha256: sha256(fs.readFileSync(workerPath))
      },
      {
        sourcePath: policyPath,
        relativePath: 'policy.cjs',
        sha256: sha256(fs.readFileSync(policyPath))
      }
    ]
  });
  return { sourceRoot, bundle };
}

test('persistent Docker policy session handles root and owner-prompt decisions without exposing host state', {
  timeout: 120000
}, () => {
  const runtime = preflightDockerPolicySandbox({ pull: false });
  assert.equal(runtime.imageDigest, IMAGE_DIGEST);
  assert.equal(runtime.nodeVersion, 'v20.19.0');

  const { sourceRoot, bundle } = buildBundle();
  const sessions = [];
  try {
    const candidate = createDockerPolicySession({
      bundle,
      role: 'candidate',
      seat: 0,
      policyVersion: POLICY_VERSION,
      permissionModel: true
    });
    sessions.push(candidate);

    const root = candidate.decideSync({
      observation: observation(0),
      actionFrontier: rootFrontier()
    });
    assert.deepEqual(root.decision, {
      kind: 'select-action',
      token: 'attack-max-geist'
    });
    assert.equal(root.sequence, 1);

    const prompt = candidate.decideSync({
      observation: observation(0, 'owner-prompt'),
      prompt: promptProjection(0),
      actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] }
    });
    assert.deepEqual(prompt.decision, {
      kind: 'select-choice',
      token: 'pay-psychic-energy'
    });
    assert.equal(prompt.sequence, 2);
    candidate.closeSync();
    assert.equal(candidate.closed, true);

    const opponent = createDockerPolicySession({
      bundle,
      role: 'opponent',
      seat: 1,
      policyVersion: POLICY_VERSION,
      permissionModel: true
    });
    sessions.push(opponent);
    const opponentRoot = opponent.decideSync({
      observation: observation(1),
      actionFrontier: rootFrontier()
    });
    assert.equal(opponentRoot.role, 'opponent');
    assert.equal(opponentRoot.seat, 1);
    assert.deepEqual(opponentRoot.decision, {
      kind: 'select-action',
      token: 'attack-max-geist'
    });
    opponent.closeSync();
    assert.equal(opponent.closed, true);
  } finally {
    for (const session of sessions) {
      if (!session.closed) {
        try { session.abortSync(); } catch {}
      }
    }
    cleanupPolicyBundle(bundle);
    fs.rmSync(sourceRoot, { recursive: true, force: true });
  }
});
