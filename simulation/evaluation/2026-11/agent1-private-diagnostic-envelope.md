# Owner-encrypted V3 fixture diagnostics

The V3 fixture trace contains hidden game state (hands, deck order, Prizes and pending prompt contents). The repository is public, and GitHub Actions artifacts are downloadable by anyone with repository read access. The `private-offline-diagnostic-only` marker is a data-handling label, not an access-control mechanism.

Use the helper `agent1-private-diagnostic-envelope.cjs` to retain the complete JSON and text trace without uploading plaintext.

## Provision the recipient key

Generate a dedicated RSA keypair on the owner's trusted machine:

```sh
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out diagnostic-private.pem
openssl pkey -in diagnostic-private.pem -pubout -out diagnostic-public.pem
chmod 600 diagnostic-private.pem
```

Keep `diagnostic-private.pem` offline and out of the repository, CI variables, logs and artifacts. Configure a GitHub Actions repository variable named `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` with the contents of `diagnostic-public.pem`. The public key is not secret; the private key is.

The repository's `private/` directory currently contains only `.gitkeep`; no recipient key is provisioned. Do not generate a substitute recipient identity in an agent run.

## Workflow integration

Run this after the fixture runner and before artifact upload. The step safely skips when the artifact directory or both raw files do not exist. If raw files exist but the public key variable is missing or invalid, encryption fails and leaves the raw workspace files intact; the upload step must still exclude them.

```yaml
- name: Encrypt private V3 fixture diagnostics before artifact upload
  if: ${{ always() && !inputs.contract_only }}
  env:
    AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM: ${{ vars.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM }}
  run: node simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs encrypt-fixture-artifacts artifacts/agent36-v3-fixture
```

The public artifact may include:

- `artifacts/agent36-v3-fixture/fixture-game.private.enc.json`
- `artifacts/agent36-v3-fixture/fixture-game.public-manifest.json`

It must explicitly exclude the plaintext paths:

- `artifacts/agent36-v3-fixture/fixture-game.json`
- `artifacts/agent36-v3-fixture/fixture-game.txt`

Keep the workflow's unrelated artifact paths unchanged. The encryption step should use `always()` so partial diagnostics from failed games are also encrypted before upload.

## Offline decryption

Download the encrypted artifact and decrypt it on the owner's trusted machine:

```sh
node simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs decrypt-envelope fixture-game.private.enc.json diagnostic-private.pem ./fixture-game-decrypted
```

The helper verifies the recipient key fingerprint, authenticated-encryption tag, compressed and uncompressed payload hashes, per-file hashes and file sizes before writing any plaintext. It refuses path traversal and refuses to overwrite existing output files.

## Cryptographic envelope

- A fresh 256-bit AES key and 96-bit nonce are generated for every artifact.
- The bundle is gzip-compressed, then encrypted with AES-256-GCM.
- The AES key is wrapped with the owner's RSA public key using RSA-OAEP with SHA-256.
- The authenticated data binds the envelope schema, algorithm and recipient public-key fingerprint.
- The public manifest contains only file paths, sizes and SHA-256 digests, not plaintext contents.

Tests: `node --test tests/2026-11/agent1-private-diagnostic-envelope.test.cjs`.

This is post-game artifact transport only. It must not be added to candidate/opponent policy closures or expose full state to any decision-time surface. Encrypted fixture artifacts remain non-admitting research evidence.
