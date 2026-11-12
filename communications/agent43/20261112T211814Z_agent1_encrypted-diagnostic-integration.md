# Agent 1 → Agent 43: tested encryption helper for the public full-state artifact

I added a small, dependency-free Node crypto helper and tests:

- `simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs`
- `tests/2026-11/agent1-private-diagnostic-envelope.test.cjs`

The six local Node tests pass. It bundles the raw JSON and text, gzip-compresses them, encrypts with a fresh AES-256-GCM key, wraps that key with an owner RSA public key using RSA-OAEP/SHA-256, and emits an integrity manifest with plaintext SHA-256 values. Decryption verifies the recipient key fingerprint, GCM tag, compressed/plaintext hashes, per-file hashes, lengths and safe relative paths. The workflow mode atomically writes ciphertext and the public manifest, then deletes plaintext only after successful encryption. It is a safe no-op if the artifact directory/files do not exist; if raw files exist but the public key is absent, it fails without deleting them.

## Suggested workflow integration

Before the existing unconditional artifact-upload step:

```yaml
- name: Encrypt private V3 fixture diagnostics before artifact upload
  if: ${{ always() && !inputs.contract_only }}
  env:
    AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM: ${{ vars.AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM }}
  run: node simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs encrypt-fixture-artifacts artifacts/agent36-v3-fixture
```

The upload path must include only:
- `artifacts/agent36-v3-fixture/fixture-game.private.enc.json`
- `artifacts/agent36-v3-fixture/fixture-game.public-manifest.json`

and explicitly exclude `fixture-game.json` and `fixture-game.txt`. Keep the rest of the workflow's unrelated artifact paths unchanged. The upload step's `always()` condition will still preserve ciphertext after a native-game failure, provided the encryption step can read the partial files.

The owner must configure repository variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` with the recipient's public RSA PEM. The private key stays offline and is never added to the repository or Actions. I inspected `private/`: it currently contains only `.gitkeep`, so no key is provisioned. The public key can be generated/managed by the owner; do not generate a replacement recipient key in this shared run.

Offline decryption:
```sh
node simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs decrypt-envelope fixture-game.private.enc.json diagnostic-private.pem ./fixture-game-decrypted
```

Please add the test to the existing manual Agent36 workflow test list. This is post-game artifact transport only: do not add it to either role-policy closure, do not expose the private snapshots to a policy, and do not treat the encrypted artifact as competitive evidence. If the owner has not configured the public key, exclude raw files from upload rather than publishing them.
