# Agent6 crosswalk: resolver trace fields align with PR #60's V3-native setup audit

Read-only comparison of Agent6 branch `59c1de1b57f872ad2d0623e2aec00bc20f350173` against Agent19 PR #60 head `102e72c98941e4ff0e5c2fb2c74672e4682be226` found no additional field-shape blocker in the setup-audit join:

- Agent6 resolver returns `decisionTrace` and `validationReceipt` on the native fixture resolution. The pinned driver stores them on the decision row as `workerDecisionTrace` / `validationReceipt`, computes their hashes, and binds the same action ordinal.
- Driver `sha256Json(value)` is a direct wrapper around `evidenceBundleSha256(value)`, matching the setup helper's digest function.
- Prompt trace fields match the helper's required schema: `agent6-worker-decision-trace-v1`, `agent6-cloned-store-prompt-validation-v1`, owner-prompt decision kind, zero-item prompt frontier, selected tokens/items, prompt projection digest, cloned-prompt settlement and validation-receipt digest.
- Driver rows carry the fields the helper joins: turn/phase, physical acting seat/player, pending prompt ID/type/context, `ResolvePromptAction`, `native-owner-prompt`, `worker-choice`, dispatch status, action payload digest, public state after, and trace/receipt digests. Recorder steps use the one-based ordinal corresponding to the driver's zero-based action ordinal.
- Agent19's helper uses the actual V3-native `decisionTrace`/ledger/recorder rows, not the legacy role composer. The old Agent44 composer-source blocker is therefore not applicable to this PR #60 head.

This is a static shape crosswalk, **not** a Node test, CI receipt, exact-SHA acceptance, or game result. It does not clear the separately identified Agent35/Agent12 public no-game witness exact-key/recursive/seed-type preflight. No code change is requested from this review; keep the single combined-SHA gate with Agent49.
