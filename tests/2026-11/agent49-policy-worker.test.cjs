'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');
const { spawn } = require('node:child_process');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');

const WORKER_SOURCE = path.resolve(__dirname,
  '../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const POLICY_SOURCE = String.raw`'use strict';
const POLICY_VERSION = 'agent49-test-policy-v1';
async function createPolicy({ config }) {
  return {
    async decide(request) {
      if (config.mode === 'math') Math.random();
      if (config.mode === 'crypto') require('node:crypto').randomBytes(1);
      if (config.mode === 'pseudo') require('node:crypto').pseudoRandomBytes(1);
      if (config.mode === 'webcrypto') require('node:crypto').webcrypto.getRandomValues(new Uint8Array(1));
      if (config.forceUnknownAction === true) {
        return { kind: 'select-action', token: 'not-in-frontier' };
      }
      if (request.prompt) {
        const choice = request.prompt.choices[0];
        return choice ? { kind: 'select-choice', token: choice.token } :
          { kind: 'abstain', reasonCode: 'NO_VISIBLE_CHOICE' };
      }
      const action = request.actionFrontier.items[0];
      return action ? { kind: 'select-action', token: action.token } :
        { kind: 'abstain', reasonCode: 'NO_LEGAL_ACTION' };
    }
  };
}
module.exports = { POLICY_VERSION, createPolicy };
`;

const INIT = {
  schema: protocol.INIT_SCHEMA,
  type: 'init',
  role: 'candidate',
  seat: 0,
  policyVersion: 'agent49-test-policy-v1',
  bundleSha256: 'a'.repeat(64),
  config: { mode: 'test' }
};

function request(sequence, overrides = {}) {
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: 'req-' + sequence,
    sequence,
    role: 'candidate',
    seat: 0,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: {
      actorSeat: 0,
      decisionKind: 'owner-root',
      pendingPromptType: null,
      ownHand: ['Shadow Rider Calyrex V CRE'],
      ownPublic: { active: null, bench: [], deckCount: 8 },
      opponentPublic: { active: null, bench: [], deckCount: 12 }
    },
    prompt: null,
    publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: [{ token: 'action-' + sequence, kind: 'attack', attackName: 'Max Geist' }]
    },
    ...overrides
  };
}

function writeLine(stream, value) {
  stream.write(JSON.stringify(value) + '\n');
}

function startWorker(config = INIT.config) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent49-worker-test-'));
  fs.copyFileSync(WORKER_SOURCE, path.join(dir, 'worker.cjs'));
  fs.writeFileSync(path.join(dir, 'policy.cjs'), POLICY_SOURCE);
  const child = spawn(process.execPath, [path.join(dir, 'worker.cjs')], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { PATH: process.env.PATH || '/usr/bin:/bin' }
  });
  const lines = [];
  let stderr = '';
  const rl = readline.createInterface({ input: child.stdout });
  rl.on('line', line => {
    try { lines.push(JSON.parse(line)); }
    catch { lines.push({ invalidJson: line }); }
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', chunk => { stderr += chunk; });
  return { child, dir, lines, get stderr() { return stderr; }, rl, init: { ...INIT, config } };
}

async function waitForCount(worker, count, timeoutMs = 3000) {
  const started = Date.now();
  while (worker.lines.length < count) {
    if (worker.child.exitCode !== null) {
      throw new Error('worker exited early (' + worker.child.exitCode + '): ' + worker.stderr);
    }
    if (Date.now() - started > timeoutMs) throw new Error('worker response timeout');
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}

async function waitForClose(worker) {
  if (worker.child.exitCode !== null) return;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('worker close timeout')), 3000);
    worker.child.once('close', (...args) => { clearTimeout(timer); resolve(args); });
    worker.child.once('error', error => { clearTimeout(timer); reject(error); });
  });
}

async function dispose(worker) {
  if (worker.child.exitCode === null) {
    worker.child.stdin.end();
    await waitForClose(worker);
  }
  worker.rl.close();
  fs.rmSync(worker.dir, { recursive: true, force: true });
}

async function expectWorkerFailure(message, expectedCode, config = INIT.config) {
  const worker = startWorker(config);
  try {
    writeLine(worker.child.stdin, worker.init);
    await waitForCount(worker, 1);
    writeLine(worker.child.stdin, message);
    worker.child.stdin.end();
    await waitForClose(worker);
    assert.notEqual(worker.child.exitCode, 0);
    assert.match(worker.stderr, new RegExp(expectedCode));
  } finally {
    worker.rl.close();
    fs.rmSync(worker.dir, { recursive: true, force: true });
  }
}

test('persistent seed-free worker accepts init and two ordered decisions in one process', async () => {
  const worker = startWorker();
  try {
    writeLine(worker.child.stdin, worker.init);
    await waitForCount(worker, 1);
    assert.deepEqual(worker.lines[0], {
      schema: protocol.READY_SCHEMA,
      type: 'ready',
      role: 'candidate',
      seat: 0,
      policyVersion: INIT.policyVersion,
      bundleSha256: INIT.bundleSha256
    });
    writeLine(worker.child.stdin, request(1));
    await waitForCount(worker, 2);
    writeLine(worker.child.stdin, request(2));
    await waitForCount(worker, 3);
    assert.deepEqual(worker.lines[1].decision,
      { kind: 'select-action', token: 'action-1' });
    assert.deepEqual(worker.lines[2].decision,
      { kind: 'select-action', token: 'action-2' });
    assert.equal(worker.lines[1].requestId, 'req-1');
    assert.equal(worker.lines[2].sequence, 2);
    assert.equal(worker.lines[1].role, 'candidate');
    assert.equal(worker.lines[2].seat, 0);
    assert.doesNotMatch(JSON.stringify(worker.lines), /policySeed|physicalSeed|rngState/i);
  } finally {
    await dispose(worker);
  }
});

test('worker accepts actor-seat prompt projections and rejects seed or hidden/native fields', async () => {
  const worker = startWorker();
  try {
    writeLine(worker.child.stdin, worker.init);
    await waitForCount(worker, 1);
    const promptRequest = request(1, {
      observation: {
        actorSeat: 0,
        decisionKind: 'owner-prompt',
        pendingPromptType: 'ChooseCardsPrompt',
        ownHand: ['Quick Ball FST']
      },
      prompt: {
        schema: protocol.PROMPT_SCHEMA,
        actingSeat: 0,
        promptType: 'ChooseCardsPrompt',
        description: 'Choose one visible owner-hand payment',
        choices: [{ token: 'choice-1', kind: 'payment', printing: 'Psychic Energy SVE' }]
      },
      actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] }
    });
    writeLine(worker.child.stdin, promptRequest);
    await waitForCount(worker, 2);
    assert.deepEqual(worker.lines[1].decision,
      { kind: 'select-choice', token: 'choice-1' });
  } finally {
    await dispose(worker);
  }

  assert.throws(() => protocol.validateInit({
    ...INIT, config: { policySeed: 123 }
  }), /FORBIDDEN_RANDOM_FIELD/);
  assert.throws(() => protocol.validateRequest(
    request(1, { observation: {
      actorSeat: 0, decisionKind: 'owner-root', opponentHand: ['hidden']
    }}), INIT, 1, new Set()
  ), /FORBIDDEN_NATIVE_OR_HIDDEN_FIELD/);
  assert.throws(() => protocol.validateDecision(
    { kind: 'select-action', token: 'unknown' }, null, new Set(['known'])
  ), /POLICY_SELECTED_UNKNOWN_ACTION/);
});

test('worker fails closed on role/seat drift, sequence errors, duplicate IDs and invalid policy output', async () => {
  await expectWorkerFailure(request(1, { role: 'opponent' }), 'ROLE_SEAT_CHANGED');
  await expectWorkerFailure(request(2), 'BAD_SEQUENCE');
  await expectWorkerFailure(request(1, {
    observation: { actorSeat: 0, decisionKind: 'owner-root', opponentHand: ['hidden'] }
  }), 'FORBIDDEN_NATIVE_OR_HIDDEN_FIELD');
  await expectWorkerFailure(request(1), 'POLICY_SELECTED_UNKNOWN_ACTION',
    { forceUnknownAction: true });
  await expectWorkerFailure(request(1), 'RANDOMNESS_NOT_AUTHORIZED', { mode: 'math' });
  await expectWorkerFailure(request(1), 'RANDOMNESS_NOT_AUTHORIZED', { mode: 'crypto' });
  await expectWorkerFailure(request(1), 'RANDOMNESS_NOT_AUTHORIZED', { mode: 'pseudo' });
  await expectWorkerFailure(request(1), 'RANDOMNESS_NOT_AUTHORIZED', { mode: 'webcrypto' });

  const worker = startWorker();
  try {
    writeLine(worker.child.stdin, worker.init);
    await waitForCount(worker, 1);
    writeLine(worker.child.stdin, request(1));
    await waitForCount(worker, 2);
    writeLine(worker.child.stdin, request(2, { requestId: 'req-1' }));
    worker.child.stdin.end();
    await waitForClose(worker);
    assert.notEqual(worker.child.exitCode, 0);
    assert.match(worker.stderr, /DUPLICATE_REQUEST_ID/);
  } finally {
    worker.rl.close();
    fs.rmSync(worker.dir, { recursive: true, force: true });
  }

  const oversized = startWorker();
  try {
    oversized.child.stdin.write('x'.repeat(protocol.LIMITS.maxLineBytes + 1));
    oversized.child.stdin.end();
    await waitForClose(oversized);
    assert.notEqual(oversized.child.exitCode, 0);
    assert.match(oversized.stderr, /LINE_TOO_LARGE/);
  } finally {
    oversized.rl.close();
    fs.rmSync(oversized.dir, { recursive: true, force: true });
  }
});
