'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { Worker } = require('node:worker_threads');
const protocol = require('./agent49-policy-worker.cjs');
const dockerWorker = require('./agent36-docker-policy-worker.cjs');

const SESSION_THREAD = path.join(__dirname, 'agent36-docker-policy-session-thread.cjs');
const SHARED_HEADER_BYTES = 8;
const SHARED_BUFFER_BYTES = 64 * 1024;

function createSharedBuffer() {
  return new SharedArrayBuffer(SHARED_BUFFER_BYTES);
}

function readSharedResult(sharedBuffer, timeoutMs, label) {
  const control = new Int32Array(sharedBuffer, 0, 2);
  const wait = Atomics.wait(control, 0, 0, timeoutMs);
  if (wait === 'timed-out') {
    throw Object.assign(new Error(label + ' timed out after ' + timeoutMs + 'ms'), {
      code: label + '_TIMEOUT'
    });
  }
  const status = Atomics.load(control, 0);
  const length = Atomics.load(control, 1);
  assert.ok(Number.isSafeInteger(length) && length > 0 &&
    length <= sharedBuffer.byteLength - SHARED_HEADER_BYTES,
  label + ' returned an invalid shared-memory payload length');
  const bytes = Buffer.from(
    new Uint8Array(sharedBuffer, SHARED_HEADER_BYTES, length)
  );
  let envelope;
  try {
    envelope = JSON.parse(bytes.toString('utf8'));
  } catch {
    throw Object.assign(new Error(label + ' returned malformed shared-memory JSON'), {
      code: label + '_BAD_JSON'
    });
  }
  if (status !== 1 || envelope?.ok !== true) {
    const error = new Error(String(envelope?.error?.message ?? label + ' failed'));
    error.name = String(envelope?.error?.name ?? 'PolicyWorkerError');
    error.code = String(envelope?.error?.code ?? label + '_FAILED');
    error.stderr = String(envelope?.error?.stderr ?? '');
    throw error;
  }
  return envelope.value;
}

function validateBundle(bundle) {
  assert.ok(bundle && typeof bundle.root === 'string',
    'A materialized policy bundle is required');
  assert.equal(bundle.manifest?.schema, 'agent36-policy-bundle-v1');
  assert.match(bundle.bundleSha256 ?? '', /^[a-f0-9]{64}$/);
  assert.equal(bundle.bundleSha256, bundle.manifest.bundleSha256,
    'Bundle digest differs from its manifest');
  assert.equal(bundle.manifest.imageDigest, dockerWorker.IMAGE_DIGEST,
    'Policy bundle is pinned to a different Docker image digest');
  const paths = new Set(bundle.manifest.files.map(file => file.path));
  assert.ok(paths.has('worker.cjs'),
    'Policy bundle must contain the Agent49 worker entrypoint as worker.cjs');
  assert.ok(paths.has('policy.cjs'),
    'Policy bundle must contain the role policy module as policy.cjs');
}

function assertResponse(response, expected) {
  assert.ok(response && typeof response === 'object' && !Array.isArray(response));
  assert.deepStrictEqual(Object.keys(response).sort(), [
    'decision', 'policyVersion', 'requestId',
    'role', 'schema', 'seat', 'sequence', 'type'
  ].sort(), 'Worker response contains missing or unknown fields');
  assert.equal(response.schema, protocol.RESPONSE_SCHEMA);
  assert.equal(response.type, 'response');
  assert.equal(response.requestId, expected.requestId);
  assert.equal(response.sequence, expected.sequence);
  assert.equal(response.role, expected.role);
  assert.equal(response.seat, expected.seat);
  assert.equal(response.policyVersion, expected.policyVersion);
}

class DockerPolicySession {
  constructor({
    bundle,
    role,
    seat,
    policyVersion,
    entrypoint = '/policy/worker.cjs',
    permissionModel = true,
    startupTimeoutMs = 30000,
    requestTimeoutMs = 15000,
    closeTimeoutMs = 5000
  } = {}) {
    validateBundle(bundle);
    assert.ok(['candidate', 'opponent'].includes(role), 'Invalid policy role');
    assert.ok(seat === 0 || seat === 1, 'Invalid physical seat');
    assert.match(policyVersion ?? '', /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/);
    for (const [name, value] of Object.entries({
      startupTimeoutMs, requestTimeoutMs, closeTimeoutMs
    })) {
      assert.ok(Number.isSafeInteger(value) && value > 0 && value <= 300000,
        name + ' must be a bounded positive integer');
    }

    this.bundle = bundle;
    this.role = role;
    this.seat = seat;
    this.policyVersion = policyVersion;
    this.startupTimeoutMs = startupTimeoutMs;
    this.requestTimeoutMs = requestTimeoutMs;
    this.closeTimeoutMs = closeTimeoutMs;
    this.sequence = 0;
    this.seenRequestIds = new Set();
    this.closed = false;
    this.failed = false;
    this.init = {
      schema: protocol.INIT_SCHEMA,
      type: 'init',
      role,
      seat,
      policyVersion,
      bundleSha256: bundle.bundleSha256,
      config: {}
    };
    protocol.validateInit(this.init);

    const startupBuffer = createSharedBuffer();
    this.worker = new Worker(SESSION_THREAD, {
      workerData: {
        bundle,
        entrypoint,
        permissionModel,
        init: this.init,
        startupBuffer,
        startupTimeoutMs,
        requestTimeoutMs,
        closeTimeoutMs
      }
    });
    try {
      const ready = readSharedResult(
        startupBuffer, startupTimeoutMs + 5000, 'POLICY_WORKER_STARTUP'
      );
      assert.deepStrictEqual(ready, {
        schema: protocol.READY_SCHEMA,
        type: 'ready',
        role,
        seat,
        policyVersion,
        bundleSha256: bundle.bundleSha256
      }, 'Policy worker ready receipt differs from the frozen role identity');
      this.ready = ready;
    } catch (error) {
      this.failed = true;
      void this.worker.terminate();
      throw error;
    }
  }

  decideSync({
    observation,
    prompt = null,
    publicEventReceipt = null,
    actionFrontier
  } = {}) {
    assert.ok(!this.closed && !this.failed,
      'Policy worker session is not available for decisions');
    const sequence = this.sequence + 1;
    const requestId = this.role + '-seat' + this.seat + '-' + sequence;
    const request = {
      schema: protocol.REQUEST_SCHEMA,
      type: 'decision',
      requestId,
      sequence,
      role: this.role,
      seat: this.seat,
      observationSchema: protocol.OBSERVATION_SCHEMA,
      observation,
      prompt,
      publicEventReceipt,
      actionFrontier
    };
    const validated = protocol.validateRequest(
      request, this.init, sequence, this.seenRequestIds
    );
    const sharedBuffer = createSharedBuffer();
    this.worker.postMessage({ type: 'decision', request, sharedBuffer });

    let response;
    try {
      response = readSharedResult(
        sharedBuffer, this.requestTimeoutMs + 3000, 'POLICY_WORKER_DECISION'
      );
      assertResponse(response, {
        requestId, sequence, role: this.role, seat: this.seat,
        policyVersion: this.policyVersion
      });
      const decision = protocol.validateDecision(
        response.decision, validated.prompt, validated.actionTokens
      );
      this.sequence = sequence;
      return {
        decision,
        requestId,
        sequence,
        role: this.role,
        seat: this.seat,
        policyVersion: this.policyVersion,
        bundleSha256: this.bundle.bundleSha256
      };
    } catch (error) {
      this.failed = true;
      try { this.abortSync(); } catch {}
      throw error;
    }
  }

  closeSync() {
    if (this.closed) return;
    if (this.failed) {
      this.abortSync();
      return;
    }
    const sharedBuffer = createSharedBuffer();
    this.worker.postMessage({ type: 'close', sharedBuffer });
    try {
      const result = readSharedResult(
        sharedBuffer, this.closeTimeoutMs + 3000, 'POLICY_WORKER_CLOSE'
      );
      assert.deepStrictEqual(result, { closed: true });
      this.closed = true;
    } catch (error) {
      this.failed = true;
      try { this.abortSync(); } catch {}
      throw error;
    }
  }

  abortSync() {
    if (this.closed) return;
    const sharedBuffer = createSharedBuffer();
    try {
      this.worker.postMessage({ type: 'abort', sharedBuffer });
      const result = readSharedResult(
        sharedBuffer, this.closeTimeoutMs + 5000, 'POLICY_WORKER_ABORT'
      );
      assert.deepStrictEqual(result, { aborted: true });
    } finally {
      this.closed = true;
    }
  }
}

function createDockerPolicySession(options) {
  return new DockerPolicySession(options);
}

module.exports = {
  DockerPolicySession,
  createDockerPolicySession,
  readSharedResult,
  validateBundle
};
