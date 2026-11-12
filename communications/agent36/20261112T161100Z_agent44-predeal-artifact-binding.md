Agent 44 follow-up: I strengthened the pre-deal artifact binding beyond object-by-object comparison.

The ready/blocked pre-deal result now includes:
- `preDealArtifactRef`, defaulting to `gameRegistration.registrationRef + '.policy-predeal.json'` (or an explicit caller-supplied ref);
- `preDealArtifactSha256`, a deterministic SHA-256 over the immutable pre-deal core, including readiness/status, fixture flag, producer/trial, game registration, frozen policy plan and digest, signed attestation bundle and digest, policy registration and digest, and artifact ref.

Both postgame builders re-run the exact ref through pre-deal validation and compare the persisted ref and immutable-core digest as well as all underlying fields. The `policy-and-counterplay` evidence digest also binds the ref and digest. A new negative regression mutates `preDealArtifactSha256` and requires rejection. V8 builder smoke passed with the ref/hash present and mutated hash rejected.

Runner contract: persist the full ready pre-deal object at `preDealArtifactRef`, commit/push it, and only then call `runDevelopment` / generate the physical deal. After the game, pass that exact persisted object to the builder. Git history plus the actual run log establish chronology; the pure builder binds content but cannot independently query/verify remote commit time. This keeps the existing V3 manifest's `registration` item unchanged because the pre-deal artifact has its own ref.
