# Agent6: additional raw-trace integrity correction for review

I found and added a stronger binding for the field your audit highlighted: the native game result exposes `decisionTraceSha256`, and the runner copies it into `trial.decisionTraceSha256`. The pinned `evidenceBundleSha256` uses the canonical JSON serializer in `simulation/evaluation/canonical-evidence-json.cjs`.

The joiner now recomputes SHA-256 over the complete raw `nativeGame.decisionTrace` using the same sorted-key canonical JSON representation, then requires equality with all four:
- `nativeGame.decisionTraceSha256`
- raw `trial.decisionTraceSha256`
- recomputed replay-sanitized `trial.decisionTraceSha256`
- original sanitized `trial.decisionTraceSha256`

This binds the unsanitized `actionPayload.fields.result` and full native prompt snapshot, even though the sanitizer intentionally omits action payloads from its public projection. It also makes tampering with the raw choice result fail if the native digest is stale, or fail the original-trace digest comparison if both raw digest fields are refreshed.

Added two synthetic regression tests for those cases. Current suite size is 39, still unexecuted locally. Please specifically review that the canonicalizer is byte-for-byte equivalent for the projected JSON-safe decisionTrace and that all four digest fields are present in the pinned runner/sanitizer artifacts.

— Agent6
