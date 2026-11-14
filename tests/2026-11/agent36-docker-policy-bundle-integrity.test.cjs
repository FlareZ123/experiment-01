'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const {
  createPolicyBundle,
  verifyPolicyBundle,
  sha256,
  cleanupPolicyBundle
} = require('../../simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs');

function makeBundle() {
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent36-bundle-integrity-source-'));
  const workerPath = path.join(sourceRoot, 'worker.cjs');
  fs.writeFileSync(workerPath, "'use strict'; process.stdout.write('ok');\n");
  const bundle = createPolicyBundle({
    sourceRoot,
    policyFiles: [{
      sourcePath: workerPath,
      relativePath: 'worker.cjs',
      sha256: sha256(fs.readFileSync(workerPath))
    }]
  });
  return { sourceRoot, bundle };
}

function cleanupFixture({ sourceRoot, bundle }) {
  if (bundle) cleanupPolicyBundle(bundle);
  if (sourceRoot) fs.rmSync(sourceRoot, { recursive: true, force: true });
}

test('bundle verification rejects on-disk manifest and in-memory receipt mutations', () => {
  const fixture = makeBundle();
  try {
    const { bundle } = fixture;
    const manifestPath = path.join(bundle.root, 'bundle-manifest.json');
    const originalBytes = fs.readFileSync(manifestPath);
    fs.writeFileSync(manifestPath, Buffer.concat([originalBytes, Buffer.from(' ')]));
    assert.throws(() => verifyPolicyBundle(bundle), /manifest digest/);
    fs.writeFileSync(manifestPath, originalBytes);
    verifyPolicyBundle(bundle);

    const originalManifestSha = bundle.manifestSha256;
    bundle.manifestSha256 = '0'.repeat(64);
    assert.throws(() => verifyPolicyBundle(bundle), /manifest digest/);
    bundle.manifestSha256 = originalManifestSha;

    const originalBundleSha = bundle.bundleSha256;
    bundle.bundleSha256 = '0'.repeat(64);
    assert.throws(() => verifyPolicyBundle(bundle), /bundle digest/);
    bundle.bundleSha256 = originalBundleSha;

    const originalManifestBundleSha = bundle.manifest.bundleSha256;
    bundle.manifest.bundleSha256 = '0'.repeat(64);
    assert.throws(() => verifyPolicyBundle(bundle), /in-memory manifest/);
    bundle.manifest.bundleSha256 = originalManifestBundleSha;

    const originalFileSha = bundle.manifest.files[0].sha256;
    bundle.manifest.files[0].sha256 = '0'.repeat(64);
    assert.throws(() => verifyPolicyBundle(bundle), /in-memory manifest/);
    bundle.manifest.files[0].sha256 = originalFileSha;
    verifyPolicyBundle(bundle);
  } finally {
    cleanupFixture(fixture);
  }
});

test('bundle verification rejects file-byte tampering and unmanifested extra files', () => {
  const fixture = makeBundle();
  try {
    const workerPath = path.join(fixture.bundle.root, 'worker.cjs');
    const original = fs.readFileSync(workerPath);
    fs.writeFileSync(workerPath, Buffer.from('tampered worker bytes'));
    assert.throws(() => verifyPolicyBundle(fixture.bundle), /materialized policy bundle/);
    fs.writeFileSync(workerPath, original);
    verifyPolicyBundle(fixture.bundle);

    const extraPath = path.join(fixture.bundle.root, 'unexpected.cjs');
    fs.writeFileSync(extraPath, 'unexpected');
    assert.throws(() => verifyPolicyBundle(fixture.bundle), /materialized policy bundle/);
    fs.rmSync(extraPath);
    verifyPolicyBundle(fixture.bundle);
  } finally {
    cleanupFixture(fixture);
  }
});

test('bundle verification rejects symlinks, source symlinks and special files', async () => {
  const fixture = makeBundle();
  let socketServer = null;
  try {
    const { sourceRoot, bundle } = fixture;
    const linkPath = path.join(bundle.root, 'worker-link.cjs');
    fs.symlinkSync('worker.cjs', linkPath);
    assert.throws(() => verifyPolicyBundle(bundle), /symlinks/);
    fs.rmSync(linkPath);
    verifyPolicyBundle(bundle);

    const sourceLink = path.join(sourceRoot, 'worker-link.cjs');
    fs.symlinkSync(path.join(sourceRoot, 'worker.cjs'), sourceLink);
    assert.throws(() => createPolicyBundle({
      sourceRoot,
      policyFiles: [{
        sourcePath: sourceLink,
        relativePath: 'worker-link.cjs',
        sha256: sha256(fs.readFileSync(sourceLink))
      }]
    }), /must not be symlinks/);
    fs.rmSync(sourceLink);

    const socketPath = path.join(bundle.root, 'unexpected.sock');
    socketServer = net.createServer();
    await new Promise((resolve, reject) => {
      socketServer.once('error', reject);
      socketServer.listen(socketPath, resolve);
    });
    assert.throws(() => verifyPolicyBundle(bundle), /special files/);
  } finally {
    if (socketServer) {
      await new Promise(resolve => socketServer.close(resolve));
    }
    cleanupFixture(fixture);
  }
});
