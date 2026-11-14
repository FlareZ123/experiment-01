'use strict';

const assert = require('node:assert/strict');
const { once } = require('node:events');
const { parentPort, workerData } = require('node:worker_threads');
const readline = require('node:readline');
const { spawnDockerPolicyWorker } = require('./agent36-docker-policy-worker.cjs');
const protocol = require('./agent49-policy-worker.cjs');

const HEADER_BYTES = 8;
let child = null;
let lineReader = null;
let pendingLine = null;
let queuedLines = [];
let stderr = '';
let childClosed = false;
let childCloseResult = null;
let resolveChildClose = null;
let childClosePromise = new Promise(resolve => { resolveChildClose = resolve; });
let busy = false;

function errorRecord(error) {
  return {
    name: String(error?.name ?? 'Error').slice(0, 128),
    code: String(error?.code ?? 'WORKER_SESSION_FAILURE').slice(0, 128),
    message: String(error?.message ?? error ?? 'Worker session failed').slice(0, 2048),
    stderr: stderr.slice(-4096)
  };
}

function publish(sharedBuffer, status, envelope) {
  if (!(sharedBuffer instanceof SharedArrayBuffer)) return;
  const control = new Int32Array(sharedBuffer, 0, 2);
  const capacity = sharedBuffer.byteLength - HEADER_BYTES;
  let bytes = Buffer.from(JSON.stringify(envelope), 'utf8');
  if (bytes.length > capacity) {
    status = 2;
    bytes = Buffer.from(JSON.stringify({
      ok: false,
      error: {
        name: 'RangeError',
        code: 'IPC_RESULT_TOO_LARGE',
        message: 'Worker-session response exceeded its shared-memory buffer',
        stderr: ''
      }
    }), 'utf8');
  }
  new Uint8Array(sharedBuffer, HEADER_BYTES, bytes.length).set(bytes);
  Atomics.store(control, 1, bytes.length);
  Atomics.store(control, 0, status);
  Atomics.notify(control, 0);
}

function publishSuccess(sharedBuffer, value) {
  publish(sharedBuffer, 1, { ok: true, value });
}

function publishFailure(sharedBuffer, error) {
  publish(sharedBuffer, 2, { ok: false, error: errorRecord(error) });
}

function settlePendingLine(error, value) {
  if (!pendingLine) return;
  const pending = pendingLine;
  pendingLine = null;
  clearTimeout(pending.timer);
  if (error) pending.reject(error);
  else pending.resolve(value);
}

function acceptLine(line) {
  if (Buffer.byteLength(line, 'utf8') > protocol.LIMITS.maxResponseBytes) {
    settlePendingLine(Object.assign(new Error('Worker response line exceeded protocol limit'), {
      code: 'WORKER_RESPONSE_TOO_LARGE'
    }));
    return;
  }
  let value;
  try {
    value = JSON.parse(line);
  } catch {
    settlePendingLine(Object.assign(new Error('Worker emitted invalid JSON on stdout'), {
      code: 'WORKER_INVALID_JSON'
    }));
    return;
  }
  if (pendingLine) settlePendingLine(null, value);
  else queuedLines.push(value);
}

function nextLine(timeoutMs) {
  if (queuedLines.length) return Promise.resolve(queuedLines.shift());
  if (childClosed) {
    return Promise.reject(Object.assign(new Error(
      'Docker policy worker exited before producing its response'
    ), { code: 'WORKER_EXITED', close: childCloseResult }));
  }
  return new Promise((resolve, reject) => {
    const pending = { resolve, reject, timer: null };
    pending.timer = setTimeout(() => {
      if (pendingLine === pending) pendingLine = null;
      reject(Object.assign(new Error('Docker policy worker response timed out'), {
        code: 'WORKER_RESPONSE_TIMEOUT'
      }));
    }, timeoutMs);
    pendingLine = pending;
  });
}

async function writeLine(value) {
  assert.ok(child && !childClosed, 'Docker policy worker is not running');
  const bytes = Buffer.from(JSON.stringify(value) + '\n', 'utf8');
  assert.ok(bytes.length <= protocol.LIMITS.maxLineBytes,
    'Worker request exceeds the protocol line limit');
  if (!child.stdin.write(bytes)) await once(child.stdin, 'drain');
}

function waitForChildClose(timeoutMs) {
  if (childClosed) return Promise.resolve(childCloseResult);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(Object.assign(new Error('Docker policy worker did not close in time'), {
        code: 'WORKER_CLOSE_TIMEOUT'
      }));
    }, timeoutMs);
    childClosePromise.then(value => {
      clearTimeout(timer);
      resolve(value);
    });
  });
}

async function stopChild(signal = 'SIGTERM') {
  if (!child || childClosed) return childCloseResult;
  try { child.kill(signal); } catch {}
  try {
    return await waitForChildClose(1500);
  } catch {
    try { child.kill('SIGKILL'); } catch {}
    return await waitForChildClose(2500);
  }
}

function validateReady(ready) {
  assert.deepStrictEqual(ready, {
    schema: protocol.READY_SCHEMA,
    type: 'ready',
    role: workerData.init.role,
    seat: workerData.init.seat,
    policyVersion: workerData.init.policyVersion,
    bundleSha256: workerData.init.bundleSha256
  }, 'Policy worker startup handshake differs from the frozen role bundle');
}

function attachChildListeners() {
  lineReader = readline.createInterface({
    input: child.stdout,
    crlfDelay: Infinity
  });
  lineReader.on('line', acceptLine);
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', chunk => {
    stderr = (stderr + String(chunk)).slice(-8192);
  });
  child.once('error', error => {
    settlePendingLine(error);
  });
  child.once('close', (code, signal) => {
    childClosed = true;
    childCloseResult = { code, signal };
    resolveChildClose(childCloseResult);
    settlePendingLine(Object.assign(new Error(
      'Docker policy worker exited before a response; code=' + code +
      ' signal=' + signal
    ), { code: 'WORKER_EXITED' }));
  });
}

async function handleDecision(message) {
  if (busy) {
    publishFailure(message.sharedBuffer, Object.assign(new Error(
      'Only one synchronous decision may be outstanding per role worker'
    ), { code: 'WORKER_SESSION_BUSY' }));
    return;
  }
  busy = true;
  try {
    await writeLine(message.request);
    const response = await nextLine(workerData.requestTimeoutMs);
    publishSuccess(message.sharedBuffer, response);
  } catch (error) {
    publishFailure(message.sharedBuffer, error);
    await stopChild('SIGTERM').catch(() => {});
  } finally {
    busy = false;
  }
}

async function handleClose(message) {
  try {
    if (child && !childClosed) {
      child.stdin.end();
      const result = await waitForChildClose(workerData.closeTimeoutMs);
      assert.equal(result.code, 0,
        'Policy worker exited nonzero during orderly close: ' + JSON.stringify(result));
    }
    publishSuccess(message.sharedBuffer, { closed: true });
  } catch (error) {
    await stopChild('SIGKILL').catch(() => {});
    publishFailure(message.sharedBuffer, error);
  } finally {
    if (lineReader) lineReader.close();
    parentPort.close();
  }
}

async function handleAbort(message) {
  try {
    await stopChild('SIGTERM');
    publishSuccess(message.sharedBuffer, { aborted: true });
  } catch (error) {
    publishFailure(message.sharedBuffer, error);
  } finally {
    if (lineReader) lineReader.close();
    parentPort.close();
  }
}

function handleMessage(message) {
  if (!message || typeof message !== 'object') return;
  if (message.type === 'decision') {
    void handleDecision(message);
  } else if (message.type === 'close') {
    void handleClose(message);
  } else if (message.type === 'abort') {
    void handleAbort(message);
  } else if (message.sharedBuffer instanceof SharedArrayBuffer) {
    publishFailure(message.sharedBuffer, Object.assign(new Error(
      'Unknown Docker policy session message type'
    ), { code: 'UNKNOWN_SESSION_MESSAGE' }));
  }
}

async function start() {
  child = spawnDockerPolicyWorker({
    bundle: workerData.bundle,
    entrypoint: workerData.entrypoint,
    permissionModel: workerData.permissionModel,
    timeoutMs: 0
  });
  attachChildListeners();
  await writeLine(workerData.init);
  const ready = await nextLine(workerData.startupTimeoutMs);
  validateReady(ready);
  publishSuccess(workerData.startupBuffer, ready);
  parentPort.on('message', handleMessage);
}

start().catch(async error => {
  await stopChild('SIGTERM').catch(() => {});
  publishFailure(workerData.startupBuffer, error);
  if (lineReader) lineReader.close();
  parentPort.close();
});
