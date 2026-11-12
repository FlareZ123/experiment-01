'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const ENVELOPE_SCHEMA = 'aichi-private-offline-diagnostic-envelope-v1';
const BUNDLE_SCHEMA = 'aichi-private-offline-diagnostic-bundle-v1';
const PUBLIC_MANIFEST_SCHEMA = 'aichi-private-offline-diagnostic-public-manifest-v1';
const ALGORITHM = 'RSA-OAEP-SHA256+A256GCM+GZIP';
const DEFAULT_FILES = ['fixture-game.json', 'fixture-game.txt'];
const SHA256 = /^[0-9a-f]{64}$/;

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function canonicalRelativePath(value, label = 'file path') {
  assert.equal(typeof value, 'string', label + ' must be a string');
  assert.ok(value.length > 0 && !value.startsWith('/') && !value.includes('\\'),
    label + ' must be a relative POSIX path');
  const parts = value.split('/');
  assert.ok(parts.every(part => part && part !== '.' && part !== '..'),
    label + ' must not contain empty or traversal segments');
  assert.equal(path.posix.normalize(value), value, label + ' must be canonical');
  return value;
}

function keyDetails(pem, kind) {
  const key = kind === 'private' ? crypto.createPrivateKey(pem) : crypto.createPublicKey(pem);
  assert.equal(key.asymmetricKeyType, 'rsa', 'diagnostic recipient keys must be RSA');
  const modulusLength = key.asymmetricKeyDetails?.modulusLength;
  assert.ok(Number.isInteger(modulusLength) && modulusLength >= 2048,
    'diagnostic recipient RSA key must be at least 2048 bits');
  const publicKey = kind === 'private' ? crypto.createPublicKey(key) : key;
  const publicDer = publicKey.export({ type: 'spki', format: 'der' });
  return { key, publicKey, fingerprint: sha256(publicDer) };
}

function normalizeFiles(files) {
  assert.ok(Array.isArray(files) && files.length > 0, 'at least one diagnostic file is required');
  const seen = new Set();
  return files.map(file => {
    assert.ok(file && typeof file === 'object' && !Array.isArray(file), 'diagnostic file must be an object');
    const filePath = canonicalRelativePath(file.path);
    assert.ok(!seen.has(filePath), 'duplicate diagnostic file path: ' + filePath);
    seen.add(filePath);
    const bytes = Buffer.isBuffer(file.bytes) ? file.bytes : Buffer.from(file.bytes ?? '');
    return { path: filePath, bytes };
  }).sort((a, b) => a.path.localeCompare(b.path));
}

function createDiagnosticBundle(files) {
  const normalized = normalizeFiles(files);
  const bundleFiles = normalized.map(file => ({
    path: file.path,
    sizeBytes: file.bytes.length,
    sha256: sha256(file.bytes),
    contentBase64: file.bytes.toString('base64'),
  }));
  const bundle = { schema: BUNDLE_SCHEMA, files: bundleFiles };
  const payload = Buffer.from(JSON.stringify(bundle), 'utf8');
  return {
    bundle,
    payload,
    fileManifest: bundleFiles.map(({ path, sizeBytes, sha256 }) => ({ path, sizeBytes, sha256 })),
  };
}

function encryptDiagnosticBundle({ publicKeyPem, files }) {
  assert.equal(typeof publicKeyPem, 'string', 'publicKeyPem must be a PEM string');
  const recipient = keyDetails(publicKeyPem, 'public');
  const { payload, fileManifest } = createDiagnosticBundle(files);
  const compressed = zlib.gzipSync(payload, { level: 9 });
  const aesKey = crypto.randomBytes(32);
  const nonce = crypto.randomBytes(12);
  const aad = Buffer.from([ENVELOPE_SCHEMA, ALGORITHM, recipient.fingerprint].join('\n'), 'utf8');
  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, nonce);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const wrappedKey = crypto.publicEncrypt({
    key: recipient.publicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256',
  }, aesKey);
  const envelope = {
    schema: ENVELOPE_SCHEMA,
    algorithm: ALGORITHM,
    recipientKeyFingerprintSha256: recipient.fingerprint,
    nonceBase64: nonce.toString('base64'),
    authTagBase64: authTag.toString('base64'),
    wrappedKeyBase64: wrappedKey.toString('base64'),
    ciphertextBase64: ciphertext.toString('base64'),
    compressedPayloadSha256: sha256(compressed),
    plaintextPayloadSha256: sha256(payload),
    files: fileManifest,
  };
  return { envelope, bytes: Buffer.from(JSON.stringify(envelope, null, 2) + '\n', 'utf8') };
}

function decryptDiagnosticBundle({ privateKeyPem, envelopeBytes }) {
  assert.equal(typeof privateKeyPem, 'string', 'privateKeyPem must be a PEM string');
  const recipient = keyDetails(privateKeyPem, 'private');
  const envelope = JSON.parse(Buffer.isBuffer(envelopeBytes) ? envelopeBytes.toString('utf8') : String(envelopeBytes));
  assert.equal(envelope?.schema, ENVELOPE_SCHEMA, 'unsupported private diagnostic envelope schema');
  assert.equal(envelope?.algorithm, ALGORITHM, 'unsupported private diagnostic encryption algorithm');
  assert.match(envelope?.recipientKeyFingerprintSha256 ?? '', SHA256, 'recipient key fingerprint is invalid');
  assert.equal(envelope.recipientKeyFingerprintSha256, recipient.fingerprint,
    'private key does not match the envelope recipient');
  for (const field of ['compressedPayloadSha256', 'plaintextPayloadSha256'])
    assert.match(envelope[field] ?? '', SHA256, field + ' is invalid');
  const nonce = Buffer.from(envelope.nonceBase64 ?? '', 'base64');
  const authTag = Buffer.from(envelope.authTagBase64 ?? '', 'base64');
  const wrappedKey = Buffer.from(envelope.wrappedKeyBase64 ?? '', 'base64');
  const ciphertext = Buffer.from(envelope.ciphertextBase64 ?? '', 'base64');
  assert.equal(nonce.length, 12, 'AES-GCM nonce must be 96 bits');
  assert.equal(authTag.length, 16, 'AES-GCM authentication tag must be 128 bits');
  assert.ok(wrappedKey.length > 0 && ciphertext.length > 0, 'encrypted payload is empty');
  const aesKey = crypto.privateDecrypt({
    key: recipient.key,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256',
  }, wrappedKey);
  assert.equal(aesKey.length, 32, 'unwrapped AES key must be 256 bits');
  const aad = Buffer.from([ENVELOPE_SCHEMA, ALGORITHM, recipient.fingerprint].join('\n'), 'utf8');
  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, nonce);
  decipher.setAAD(aad);
  decipher.setAuthTag(authTag);
  const compressed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  assert.equal(sha256(compressed), envelope.compressedPayloadSha256,
    'compressed payload digest mismatch');
  const payload = zlib.gunzipSync(compressed);
  assert.equal(sha256(payload), envelope.plaintextPayloadSha256,
    'plaintext payload digest mismatch');
  const bundle = JSON.parse(payload.toString('utf8'));
  assert.equal(bundle?.schema, BUNDLE_SCHEMA, 'unsupported diagnostic bundle schema');
  assert.ok(Array.isArray(bundle.files), 'diagnostic bundle files must be an array');
  const actualManifest = [];
  const files = [];
  for (const item of bundle.files) {
    const filePath = canonicalRelativePath(item.path);
    const bytes = Buffer.from(item.contentBase64 ?? '', 'base64');
    assert.equal(bytes.length, item.sizeBytes, 'diagnostic file size mismatch: ' + filePath);
    assert.match(item.sha256 ?? '', SHA256, 'diagnostic file digest is invalid: ' + filePath);
    assert.equal(sha256(bytes), item.sha256, 'diagnostic file digest mismatch: ' + filePath);
    actualManifest.push({ path: filePath, sizeBytes: bytes.length, sha256: item.sha256 });
    files.push({ path: filePath, bytes });
  }
  assert.deepEqual(actualManifest, envelope.files, 'diagnostic file manifest does not match encrypted contents');
  return { bundle, files, recipientKeyFingerprintSha256: recipient.fingerprint };
}

function encryptFixtureArtifacts({
  directory,
  publicKeyPem,
  filenames = DEFAULT_FILES,
  outputName = 'fixture-game.private.enc.json',
  deletePlaintext = false,
} = {}) {
  assert.equal(typeof directory, 'string', 'directory is required');
  assert.ok(Array.isArray(filenames) && filenames.length > 0, 'filenames must be a non-empty array');
  if (!fs.existsSync(directory)) return { skipped: true, reason: 'artifact directory does not exist' };
  const root = fs.realpathSync(directory);
  const files = [];
  for (const filename of filenames) {
    const relative = canonicalRelativePath(filename, 'fixture filename');
    assert.ok(!relative.includes('/'), 'fixture filenames must be direct children of the artifact directory');
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) continue;
    const real = fs.realpathSync(absolute);
    assert.equal(path.dirname(real), root, 'fixture file must remain inside the artifact directory');
    files.push({ path: relative, bytes: fs.readFileSync(real) });
  }
  if (files.length === 0) return { skipped: true, reason: 'no full-state diagnostic files exist' };
  const { envelope, bytes } = encryptDiagnosticBundle({ publicKeyPem, files });
  const outputRelative = canonicalRelativePath(outputName, 'output filename');
  assert.ok(!outputRelative.includes('/'), 'output filename must be a direct child of the artifact directory');
  const outputPath = path.join(root, outputRelative);
  const tempPath = outputPath + '.' + process.pid + '.tmp';
  fs.writeFileSync(tempPath, bytes, { flag: 'wx', mode: 0o600 });
  fs.renameSync(tempPath, outputPath);
  const publicManifest = {
    schema: PUBLIC_MANIFEST_SCHEMA,
    artifactVisibility: 'public-encrypted-envelope',
    payloadVisibility: 'private-offline-diagnostic-only',
    encryption: {
      algorithm: ALGORITHM,
      recipientKeyFingerprintSha256: envelope.recipientKeyFingerprintSha256,
      envelopeFile: outputRelative,
      envelopeSha256: sha256(bytes),
    },
    plaintextFiles: envelope.files,
  };
  const manifestPath = path.join(root, 'fixture-game.public-manifest.json');
  const manifestTemp = manifestPath + '.' + process.pid + '.tmp';
  fs.writeFileSync(manifestTemp, JSON.stringify(publicManifest, null, 2) + '\n',
    { flag: 'wx', mode: 0o644 });
  fs.renameSync(manifestTemp, manifestPath);
  if (deletePlaintext) {
    for (const file of files) fs.unlinkSync(path.join(root, file.path));
  }
  return {
    skipped: false,
    outputPath,
    manifestPath,
    envelopeSha256: sha256(bytes),
    recipientKeyFingerprintSha256: envelope.recipientKeyFingerprintSha256,
    plaintextFiles: envelope.files,
    deletedPlaintext: deletePlaintext,
  };
}

function decryptEnvelopeFile({ envelopePath, privateKeyPath, outputDirectory } = {}) {
  const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf8');
  const result = decryptDiagnosticBundle({
    privateKeyPem,
    envelopeBytes: fs.readFileSync(envelopePath),
  });
  fs.mkdirSync(outputDirectory, { recursive: true });
  for (const file of result.files) {
    const destination = path.join(outputDirectory, ...file.path.split('/'));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, file.bytes, { flag: 'wx', mode: 0o600 });
  }
  return { outputDirectory, files: result.files.map(file => file.path) };
}

function main(argv = process.argv.slice(2), env = process.env) {
  const [command, first, second, third] = argv;
  if (command === 'encrypt-fixture-artifacts') {
    const publicKeyPem = env.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM;
    const result = encryptFixtureArtifacts({ directory: first, publicKeyPem, deletePlaintext: true });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return result;
  }
  if (command === 'decrypt-envelope') {
    const result = decryptEnvelopeFile({ envelopePath: first, privateKeyPath: second, outputDirectory: third });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return result;
  }
  throw new Error('usage: node agent1-private-diagnostic-envelope.cjs encrypt-fixture-artifacts <artifact-dir> | decrypt-envelope <envelope.json> <private-key.pem> <output-dir>');
}

if (require.main === module) {
  try { main(); }
  catch (error) {
    process.stderr.write(String(error?.stack ?? error) + '\n');
    process.exitCode = 1;
  }
}

module.exports = {
  ENVELOPE_SCHEMA,
  BUNDLE_SCHEMA,
  PUBLIC_MANIFEST_SCHEMA,
  ALGORITHM,
  sha256,
  encryptDiagnosticBundle,
  decryptDiagnosticBundle,
  encryptFixtureArtifacts,
  decryptEnvelopeFile,
  main,
};
