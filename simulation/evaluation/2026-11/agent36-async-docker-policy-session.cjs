'use strict';

const assert = require('node:assert/strict');
const readline = require('node:readline');
const { once } = require('node:events');
const protocol = require('./agent49-policy-worker.cjs');
const dockerWorker = require('./agent36-docker-policy-worker.cjs');

class AsyncJsonLineChannel {
  constructor(child) {
    this.child = child;
    this.queue = [];
    this.waiters = [];
    this.error = null;
    this.closed = false;
    this.stderrText = '';
    this.reader = readline.createInterface({
      input: child.stdout,
      crlfDelay: Infinity
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', chunk => {
      this.stderrText = (this.stderrText + String(chunk)).slice(-32768);
    });
    this.reader.on('line', line => this.acceptLine(line));
    child.once('error', error => this.fail(error));
    child.once('close', (code, signal) => {
      this.closed = true;
      if (code !== 0 && !this.error) {
        this.error = Object.assign(new Error(
          'Docker policy worker exited code=' + code + ' signal=' + signal +
          '; stderr=' + this.stderrText
        ), { code: 'POLICY_WORKER_EXITED' });
      }
      if (this.error) this.rejectWaiters(this.error);
      else if (this.waiters.length) {
        this.rejectWaiters(new Error('Docker policy worker closed before its next response'));
      }
    });
  }

  acceptLine(line) {
    if (Buffer.byteLength(line, 'utf8') > protocol.LIMITS.maxResponseBytes) {
      this.fail(Object.assign(new Error('Worker response line exceeds protocol limit'), {
        code: 'WORKER_RESPONSE_TOO_LARGE'
      }));
      return;
    }
    let value;
    try {
      value = JSON.parse(line);
    } catch {
      this.fail(Object.assign(new Error('Worker emitted invalid JSON on stdout'), {
        code: 'WORKER_INVALID_JSON'
      }));
      return;
    }
    const waiter = this.waiters.shift();
    if (waiter) {
      clearTimeout(waiter.timer);
      waiter.resolve(value);
    } else {
      this.queue.push(value);
    }
  }

  fail(error) {
    if (!this.error) this.error = error;
    this.rejectWaiters(this.error);
  }

  rejectWaiters(error) {
    while (this.waiters.length) {
      const waiter = this.waiters.shift();
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
  }

  next(timeoutMs) {
    if (this.queue.length) return Promise.resolve(this.queue.shift());
    if (this.error) return Promise.reject(this.error);
    if (this.closed) return Promise.reject(new Error('Docker policy worker is closed'));
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject, timer: null };
      waiter.timer = setTimeout(() => {
        const index = this.waiters.indexOf(waiter);
        if (index >= 0) this.waiters.splice(index, 1);
        reject(Object.assign(new Error(
          'Docker policy worker response timed out after ' + timeoutMs + 'ms'
        ), { code: 'POLICY_WORKER_RESPONSE_TIMEOUT' }));
      }, timeoutMs);
      this.waiters.push(waiter);
    });
  }

  close() {
    this.reader.close();
  }

  get stderr() {
    return this.stderrText;
  }
}

function validateResponse(response, expected) {
  assert.ok(response && typeof response === 'object' && !Array.isArray(response));
  assert.deepStrictEqual(Object.keys(response).sort(), [
    'decision', 'policyVersion', 'requestId', 'role',
    'schema', 'seat', 'sequence', 'type'
  ].sort(), 'Worker response contains missing or unknown fields');
  assert.equal(response.schema, protocol.RESPONSE_SCHEMA);
  assert.equal(response.type, 'response');
  assert.equal(response.requestId, expected.requestId);
  assert.equal(response.sequence, expected.sequence);
  assert.equal(response.role, expected.role);
  assert.equal(response.seat, expected.seat);
  assert.equal(response.policyVersion, expected.policyVersion);
}

function validateOptions(options) {
  const {
    bundle, role, seat, policyVersion,
    startupTimeoutMs, requestTimeoutMs, closeTimeoutMs, workerTimeoutMs
  } = options;
  dockerWorker.verifyPolicyBundle(bundle);
  assert.ok(['candidate', 'opponent'].includes(role), 'Invalid policy role');
  assert.ok(seat === 0 || seat === 1, 'Invalid physical seat');
  assert.match(policyVersion ?? '', /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/);
  for (const [name, value] of Object.entries({
    startupTimeoutMs, requestTimeoutMs, closeTimeoutMs
  })) {
    assert.ok(Number.isSafeInteger(value) && value > 0 && value <= 300000,
      name + ' must be a bounded positive integer');
  }
  assert.ok(Number.isSafeInteger(workerTimeoutMs) && workerTimeoutMs > 0 &&
    workerTimeoutMs <= dockerWorker.MAX_WORKER_TIMEOUT_MS,
  'workerTimeoutMs must be a finite bounded positive integer');
}

async function waitForChildClose(child, timeoutMs) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return { code: child.exitCode, signal: child.signalCode };
  }
  let timer;
  try {
    return await Promise.race([
      once(child, 'close').then(([code, signal]) => ({ code, signal })),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(Object.assign(new Error(
          'Docker policy worker did not close within ' + timeoutMs + 'ms'
        ), { code: 'POLICY_WORKER_CLOSE_TIMEOUT' })), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function writeLine(stream, value) {
  const line = JSON.stringify(value) + '\n';
  assert.ok(Buffer.byteLength(line, 'utf8') <= protocol.LIMITS.maxLineBytes,
    'Policy worker request exceeds protocol line limit');
  if (stream.destroyed || stream.writableEnded) {
    throw Object.assign(new Error('Policy worker stdin is not writable'), {
      code: 'POLICY_WORKER_STDIN_CLOSED'
    });
  }
  if (!stream.write(line)) await once(stream, 'drain');
}

class AsyncDockerPolicySession {
  constructor(options) {
    const defaults = {
      entrypoint: '/policy/worker.cjs',
      permissionModel: true,
      startupTimeoutMs: 30000,
      requestTimeoutMs: 15000,
      closeTimeoutMs: 5000,
      workerTimeoutMs: dockerWorker.DEFAULT_WORKER_TIMEOUT_MS,
      signal: undefined
    };
    this.options = { ...defaults, ...options };
    validateOptions(this.options);
    this.bundle = this.options.bundle;
    this.role = this.options.role;
    this.seat = this.options.seat;
    this.policyVersion = this.options.policyVersion;
    this.sequence = 0;
    this.seenRequestIds = new Set();
    this.child = null;
    this.channel = null;
    this.ready = null;
    this.closed = false;
    this.failed = false;
    this.init = {
      schema: protocol.INIT_SCHEMA,
      type: 'init',
      role: this.role,
      seat: this.seat,
      policyVersion: this.policyVersion,
      bundleSha256: this.bundle.bundleSha256,
      config: {}
    };
    protocol.validateInit(this.init);
  }

  async start() {
    assert.equal(this.child, null, 'Policy worker session already started');
    this.child = dockerWorker.spawnDockerPolicyWorker({
      bundle: this.bundle,
      entrypoint: this.options.entrypoint,
      permissionModel: this.options.permissionModel,
      timeoutMs: this.options.workerTimeoutMs,
      signal: this.options.signal
    });
    this.channel = new AsyncJsonLineChannel(this.child);
    try {
      await writeLine(this.child.stdin, this.init);
      const ready = await this.channel.next(this.options.startupTimeoutMs);
      assert.deepStrictEqual(ready, {
        schema: protocol.READY_SCHEMA,
        type: 'ready',
        role: this.role,
        seat: this.seat,
        policyVersion: this.policyVersion,
        bundleSha256: this.bundle.bundleSha256
      }, 'Policy worker startup handshake differs from the frozen role bundle');
      this.ready = ready;
      return this;
    } catch (error) {
      this.failed = true;
      await this.abort().catch(() => {});
      throw error;
    }
  }

  async decide({
    observation,
    prompt = null,
    publicEventReceipt = null,
    actionFrontier
  } = {}) {
    assert.ok(this.child && this.channel && !this.closed && !this.failed,
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
    try {
      await writeLine(this.child.stdin, request);
      const response = await this.channel.next(this.options.requestTimeoutMs);
      validateResponse(response, {
        requestId,
        sequence,
        role: this.role,
        seat: this.seat,
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
      await this.abort().catch(() => {});
      throw error;
    }
  }

  async close() {
    if (this.closed) return { closed: true };
    if (!this.child) {
      this.closed = true;
      return { closed: true };
    }
    if (this.failed) return this.abort();
    try {
      this.child.stdin.end();
      const result = await waitForChildClose(this.child, this.options.closeTimeoutMs);
      assert.equal(result.code, 0,
        'Policy worker exited nonzero during orderly close: ' + JSON.stringify(result));
      this.closed = true;
      this.channel.close();
      return { closed: true };
    } catch (error) {
      this.failed = true;
      await this.abort().catch(() => {});
      throw error;
    }
  }

  async abort() {
    if (this.closed) return { aborted: true };
    this.closed = true;
    if (this.channel) this.channel.close();
    if (this.child) {
      await dockerWorker.stopDockerPolicyWorker(this.child, {
        signal: 'SIGTERM',
        timeoutMs: 1500
      });
    }
    return { aborted: true };
  }

  get stderr() {
    return this.channel ? this.channel.stderr : '';
  }
}

async function createDockerPolicySession(options) {
  const session = new AsyncDockerPolicySession(options);
  return session.start();
}

module.exports = {
  AsyncJsonLineChannel,
  AsyncDockerPolicySession,
  createDockerPolicySession,
  validateResponse,
  validateOptions
};
