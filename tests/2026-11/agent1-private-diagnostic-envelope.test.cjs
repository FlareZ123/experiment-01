'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const {
  encryptDiagnosticBundle,
  decryptDiagnosticBundle,
  encryptFixtureArtifacts,
  sha256,
} = require('../../simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs');

function keyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}

function temp(fn) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'agent1-private-diagnostic-'));
  try { fn(directory); }
  finally { fs.rmSync(directory, { recursive: true, force: true }); }
}

test('AES-GCM payload wrapped by RSA-OAEP round-trips both machine and human diagnostic files', () => {
  const keys = keyPair();
  const files = [
    { path: 'fixture-game.json', bytes: Buffer.from('{"schema":"fixture","secretHand":["Psychic Energy"]}\n') },
    { path: 'fixture-game.txt', bytes: Buffer.from('PRIVATE STATE\nHAND ["Psychic Energy"]\n') },
  ];
  const encrypted = encryptDiagnosticBundle({ publicKeyPem: keys.publicKey, files });
  assert.equal(encrypted.envelope.files.length, 2);
  assert.ok(!encrypted.bytes.toString('utf8').includes('Psychic Energy'));
  const decrypted = decryptDiagnosticBundle({ privateKeyPem: keys.privateKey, envelopeBytes: encrypted.bytes });
  assert.deepEqual(decrypted.files.map(file => ({ path: file.path, bytes: file.bytes.toString('utf8') })),
    files.map(file => ({ path: file.path, bytes: file.bytes.toString('utf8') })));
});

test('tampering with encrypted diagnostic bytes fails GCM authentication', () => {
  const keys = keyPair();
  const encrypted = encryptDiagnosticBundle({ publicKeyPem: keys.publicKey,
    files: [{ path: 'fixture-game.json', bytes: Buffer.from('{"secret":true}') }] });
  const envelope = JSON.parse(encrypted.bytes.toString('utf8'));
  const ciphertext = Buffer.from(envelope.ciphertextBase64, 'base64');
  ciphertext[0] ^= 1;
  envelope.ciphertextBase64 = ciphertext.toString('base64');
  assert.throws(() => decryptDiagnosticBundle({ privateKeyPem: keys.privateKey,
    envelopeBytes: Buffer.from(JSON.stringify(envelope)) }), /authenticate|Unsupported state|unable to authenticate/i);
});

test('wrong recipient private key is rejected before decryption', () => {
  const first = keyPair(), second = keyPair();
  const encrypted = encryptDiagnosticBundle({ publicKeyPem: first.publicKey,
    files: [{ path: 'fixture-game.json', bytes: Buffer.from('private') }] });
  assert.throws(() => decryptDiagnosticBundle({ privateKeyPem: second.privateKey,
    envelopeBytes: encrypted.bytes }), /does not match/);
});

test('fixture encryption atomically writes a public manifest and deletes plaintext only after encryption', () => {
  const keys = keyPair();
  temp(directory => {
    const json = Buffer.from('{"visibility":"private-offline-diagnostic-only","fullState":{"hand":["A"]}}\n');
    const text = Buffer.from('PRIVATE HAND A\n');
    fs.writeFileSync(path.join(directory, 'fixture-game.json'), json);
    fs.writeFileSync(path.join(directory, 'fixture-game.txt'), text);
    const result = encryptFixtureArtifacts({ directory, publicKeyPem: keys.publicKey, deletePlaintext: true });
    assert.equal(result.skipped, false);
    assert.equal(fs.existsSync(path.join(directory, 'fixture-game.json')), false);
    assert.equal(fs.existsSync(path.join(directory, 'fixture-game.txt')), false);
    assert.equal(fs.existsSync(path.join(directory, 'fixture-game.private.enc.json')), true);
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'fixture-game.public-manifest.json'), 'utf8'));
    assert.equal(manifest.artifactVisibility, 'public-encrypted-envelope');
    assert.equal(manifest.payloadVisibility, 'private-offline-diagnostic-only');
    assert.doesNotMatch(JSON.stringify(manifest), /PRIVATE HAND A/);
    assert.deepEqual(manifest.plaintextFiles.map(file => file.sha256).sort(), [sha256(json), sha256(text)].sort());
    const decrypted = decryptDiagnosticBundle({ privateKeyPem: keys.privateKey,
      envelopeBytes: fs.readFileSync(path.join(directory, 'fixture-game.private.enc.json')) });
    assert.equal(decrypted.files.length, 2);
  });
});

test('no files is a safe no-op and requires no key', () => {
  temp(directory => {
    assert.deepEqual(encryptFixtureArtifacts({ directory, publicKeyPem: undefined }),
      { skipped: true, reason: 'no full-state diagnostic files exist' });
  });
});

test('path traversal and non-RSA recipient keys are rejected', () => {
  const keys = keyPair();
  assert.throws(() => encryptDiagnosticBundle({ publicKeyPem: keys.publicKey,
    files: [{ path: '../secret', bytes: Buffer.from('x') }] }), /traversal/);
  const ec = crypto.generateKeyPairSync('ed25519');
  assert.throws(() => encryptDiagnosticBundle({ publicKeyPem: ec.publicKey.export({ type: 'spki', format: 'pem' }),
    files: [{ path: 'fixture-game.json', bytes: Buffer.from('x') }] }), /must be RSA/);
});
test('missing recipient key fails closed without deleting raw diagnostic files', () => {
  temp(directory => {
    const json = Buffer.from('{"privateState":true}\n');
    fs.writeFileSync(path.join(directory, 'fixture-game.json'), json);
    assert.throws(() => encryptFixtureArtifacts({
      directory,
      publicKeyPem: undefined,
      deletePlaintext: true,
    }), /publicKeyPem must be a PEM string/);
    assert.deepEqual(fs.readFileSync(path.join(directory, 'fixture-game.json')), json);
    assert.equal(fs.existsSync(path.join(directory, 'fixture-game.private.enc.json')), false);
  });
});

test('missing artifact directory is a safe no-op', () => {
  temp(directory => {
    const missing = path.join(directory, 'does-not-exist');
    assert.deepEqual(encryptFixtureArtifacts({ directory: missing }), {
      skipped: true,
      reason: 'artifact directory does not exist',
    });
  });
});
test('public Actions artifact path exposes only encrypted or sanitized fixture diagnostics', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/agent36-bilateral-competence-v9.yml');
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  const encryptionIndex = workflow.indexOf('Encrypt private V3 fixture diagnostics before artifact upload');
  const uploadIndex = workflow.indexOf('Preserve the complete v9 root ledger and owner-only aftergame evidence');
  assert.ok(encryptionIndex >= 0 && uploadIndex > encryptionIndex,
    'private diagnostic encryption must run before artifact upload');
  const encryptionBlock = workflow.slice(encryptionIndex, uploadIndex);
  assert.match(encryptionBlock, /if:\s*\$\{\{\s*always\(\)\s*&&\s*inputs\.agent36_v3_fixture_game(?:\s*&&\s*steps\.diagnostic_recipient\.outputs\.mode\s*==\s*'encrypted-full')?\s*\}\}/);
  assert.doesNotMatch(encryptionBlock, /if:\s*\$\{\{\s*always\(\)\s*&&\s*!inputs\.contract_only\s*\}\}/);
  assert.match(workflow, /AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM:\s*\$\{\{\s*vars\.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM\s*\}\}/);
  assert.match(workflow, /run: node simulation\/evaluation\/2026-11\/agent1-private-diagnostic-envelope\.cjs encrypt-fixture-artifacts artifacts\/agent36-v3-fixture/);
  const uploadBlock = workflow.slice(uploadIndex, workflow.indexOf('\n      - name:', uploadIndex + 1) < 0
    ? workflow.length
    : workflow.indexOf('\n      - name:', uploadIndex + 1));
  assert.match(uploadBlock, /if:\s*\$\{\{\s*always\(\)\s*&&\s*!inputs\.contract_only\s*\}\}/);
  const fixturePaths = uploadBlock.split('\n').map(line => line.trim())
    .filter(line => line.includes('artifacts/agent36-v3-fixture/'));
  assert.ok(fixturePaths.includes('artifacts/agent36-v3-fixture/fixture-game.private.enc.json'));
  assert.ok(fixturePaths.includes('artifacts/agent36-v3-fixture/fixture-game.public-manifest.json'));
  assert.ok(fixturePaths.includes('!artifacts/agent36-v3-fixture/fixture-game.json'));
  assert.ok(fixturePaths.includes('!artifacts/agent36-v3-fixture/fixture-game.txt'));
  assert.ok(!fixturePaths.includes('artifacts/agent36-v3-fixture/'));
  assert.ok(!fixturePaths.includes('artifacts/agent36-v3-fixture/fixture-game.json'));
  assert.ok(!fixturePaths.includes('artifacts/agent36-v3-fixture/fixture-game.txt'));
});
test('workflow CLI encrypt mode writes ciphertext and deletes plaintext for upload', () => {
  const keys = keyPair();
  temp(directory => {
    const raw = Buffer.from('private diagnostic CLI fixture\\n');
    fs.writeFileSync(path.join(directory, 'fixture-game.json'), raw);
    const scriptPath = path.join(__dirname, '../../simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs');
    const result = spawnSync(process.execPath, [scriptPath, 'encrypt-fixture-artifacts', directory], {
      encoding: 'utf8',
      env: { ...process.env, AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM: keys.publicKey },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.existsSync(path.join(directory, 'fixture-game.json')), false);
    const envelopePath = path.join(directory, 'fixture-game.private.enc.json');
    assert.equal(fs.existsSync(envelopePath), true);
    const decrypted = decryptDiagnosticBundle({
      privateKeyPem: keys.privateKey,
      envelopeBytes: fs.readFileSync(envelopePath),
    });
    assert.equal(decrypted.files.length, 1);
    assert.deepEqual(decrypted.files[0].bytes, raw);
    const publicManifest = JSON.parse(fs.readFileSync(path.join(directory, 'fixture-game.public-manifest.json'), 'utf8'));
    assert.equal(publicManifest.artifactVisibility, 'public-encrypted-envelope');
    assert.equal(publicManifest.payloadVisibility, 'private-offline-diagnostic-only');
  });
});
