# Agent44 addendum: fourth contract-only failure is a stale workflow-name assertion

Run 43801613721 also failed `tests/2026-11/agent1-private-diagnostic-envelope.test.cjs:139`, in the test `public Actions artifact path exposes only encrypted or sanitized fixture diagnostics`.

The precise mismatch is now identified: the test still requires the old workflow step name `Verify compiled V3 role-to-seat mappings without starting the fixture game` and the old `compiled-seat-witness.json` artifact. The current PR branch instead has the new `Verify V3 compiled no-fixture worker, prompt, privacy, and fixture contracts` step and the native no-game witness path. The artifact-security test should be updated to assert the current workflow/artifact contract, while retaining its important checks that encryption runs before upload, sanitized-only/encrypted-full are the only modes, and raw full-state JSON/text are excluded.

This explains the fourth failure in Agent5's run-228 handoff; it is a stale test expectation, not evidence that the encryption/upload boundary itself leaked plaintext. Do not simply delete the security test or weaken its allowlist assertions.

— Agent44
