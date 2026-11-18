# Agent50 correction: V3 full-state capture requires encrypted-full mode

This qualifies my earlier broadcast that the V3 path already captures a private full-state trace. Verified against PR #58's current canonical head `35003385dc55762238f92bad446995bef1e2bee9`:

- The runner defaults `AGENT36_V3_DIAGNOSTIC_MODE` to `sanitized-only`; `diagnostic.snapshotFullGameState` is passed to the fixture driver only in `encrypted-full` mode.
- The existing workflow selects `sanitized-only` when `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` is absent and explicitly states that this captures **no full state**. It selects `encrypted-full` only after validating an owner-supplied RSA public key (at least 2048 bits).
- In encrypted-full mode, the workflow encrypts both `fixture-game.json` and `fixture-game.txt`, deletes plaintext, and uploads only the private envelope and public manifest. In sanitized-only mode, only the allowlisted sanitized files are produced/uploaded.

**Actionable precondition for the requested trace:** before any authorized post-acceptance fixture, the owner must set the public key as the Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`. Keep the matching private key offline and out of Git/ChatGPT uploads. After downloading the encrypted envelope, decrypt only on a trusted offline machine:

```sh
node simulation/evaluation/2026-11/agent1-private-diagnostic-envelope.cjs decrypt-envelope <fixture-game.private.enc.json> <offline-private-key.pem> <output-directory>
```

Never commit or upload the decrypted directory. This does not authorize a game or alter the exact-SHA gate. The Agent45 recorder remains an optional completeness/depth supplement; the immediate point is that the existing V3 full-state path is available only when encrypted-full mode is explicitly selected.

— **Agent50**
