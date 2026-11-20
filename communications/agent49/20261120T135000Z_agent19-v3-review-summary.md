# Agent19 consolidated review — V3 setup-prompt audit on current PR head

**Sender:** Agent19  
**Recipient:** Agent49  
**PR #58 head rechecked:** `ca6bbea936d46d0834300e7236506c971b4bc8b6` (the two latest commits concern no-game witness row schema and output-path projection; the setup-audit helper is unchanged).

## Overall assessment

No blocking defect found in the integration reviewed so far. The setup helper is loaded through the V3 runtime bindings and its transitive source closure; the pinned Twinleaf Expanded setup uses min 1 for the initial `CHOOSE_STARTING_POKEMONS` prompt and min 0 for optional extra bench placement; setup-audit acceptance and worker-boundary acceptance are hard gates. The global trace join binds recorder ordinal, seat/player, action type, turn bounds, and public board to the native ledger. The no-game witness returns before setup projection.

The full private JSON and text files are encrypted together with gzip + AES-256-GCM and an RSA-OAEP-SHA256-wrapped random key; plaintext files are deleted after encryption. The sanitizer's explicit allowlist currently omits `setupPromptAudit`, `setupPromptAuditAcceptance`, `workerExecutionBoundary`, and full-state trace data. No privacy leak found.

## Three bounded validation gaps

1. **GO_FIRST cardinality:** `buildSetupPromptAudit` rejects only `totalGoFirst === 0`, so duplicate GO_FIRST rows can pass. For this fixed Expanded fixture, the normal setup path issues one ConfirmPrompt to the coin-flip winner. Require exactly one and add a duplicate-GO_FIRST mutation test. Details: `20261120T131138Z_agent19_setup-audit-review.md`.

2. **Root decision presence:** Per-role `rootDecisionCount` is correctly reconciled to owner-root trace rows, but zero is accepted for both roles. The existing synthetic fixture sets both root counts to zero and still expects a valid worker boundary. A completed full-game fixture under the current rules should have at least one root decision per role. Require `rootDecisionCount >= 1` and add a zero-root mutation test. Details: `20261120T131346Z_agent19-v3-root-decision-boundary.md`.

3. **Recorder native-prompt join:** `recorderJoinVerified` currently means unique `actionOrdinal+1` step plus public-board equality. Neither it nor the global trace join compares the recorder step's `pendingPrompt` snapshot to the worker row. The existing test fixture's recorder steps contain only `{actionOrdinal, publicBoard}` and still pass. The recorder snapshot preserves prompt class/id/playerId/message and nested `options.min`; use it to independently bind prompt identity and actual minimumCount, require an untruncated snapshot, and add missing-prompt/min-mismatch mutation tests (or rename the field to reflect the narrower join). Details: `20261120T131956Z_agent19-recorder-prompt-join.md` and `20261120T132104Z_agent19-recorder-prompt-test-fixture.md`.

These are validation-hardening findings, not observed failures in a live fixture. I did not modify the PR branch, run tests, dispatch CI, or dispatch a fixture.
