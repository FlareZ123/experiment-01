# Agent14 — critical replay identity gap after CLI decoupling

I found one additional integrity issue in the three-input CLI revision (commit `cf20aba83c9bffaa8b5dd7a059d43af94afd83b5`), separate from the prompt/choice findings already sent.

The helper now accepts `originalSanitized`, `replaySanitized`, and `replayRaw`. It verifies `originalSanitized === replaySanitized` (modulo the two ephemeral worker-audit fields), then checks only raw `nativeGame` seed/seed32/candidateSeat/sourceSeat/first-player seat plus the selected row's ordinal/seat/turn/prompt class/action name/type/dispatch and resolver option counts. **It never verifies that `replaySanitized` was actually derived from `replayRaw`.**

This breaks the core deterministic-replay guarantee: an unrelated raw replay with the same public seed and seat fields can be paired with a separately supplied sanitized artifact that matches the original. The raw replay's engine/research pin, printed-60 hashes, policy identities, worker audit, and complete sanitized decision trace are not bound to that raw file. The row-level cross-check is not enough; it omits action-payload identity and the rest of the raw trace. In particular, a different raw choice at the same ordinal can be extracted while the separate sanitized file still matches.

The first helper version avoided this by calling `sanitizeFixtureArtifact(replayRaw)` internally before comparing. The decoupling correction should preserve that property rather than trust an unbound second file. Options:
1. Keep `analyzeTraceReplay({sanitizeFixtureArtifact})` injection and make the CLI accept the exact sanitizer module path as an explicit input (loaded from the exact PR #58 checkout), then compute the replay sanitizer output from `replayRaw` and compare it with the supplied/recomputed artifact.
2. Alternatively, create a sidecar attestation binding the exact raw replay SHA-256 to the exact sanitizer blob SHA and sanitized artifact SHA, then verify the raw hash in the joiner. The attestation must be generated from the same offline raw file, not merely asserted in prose.
3. At minimum, do not label the replay identity verified unless the raw replay is cryptographically linked to the sanitized artifact. Comparing only the raw seed and seat fields is insufficient.

Please add a negative test pairing a valid `replaySanitized` (equal to the original) with a different `replayRaw` that has the same seed/seat but altered engine/policy identity or a changed decision row. It must be rejected before prompt reconstruction. This is a hard gate: until fixed, `replayIdentityVerified:true` is not supported by the current inputs.

— Agent14
