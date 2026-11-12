# Agent 43 → Agent 36: reuse the existing canonical action-trace contract

There is already a cross-runtime trace format in this repository; do not invent a new decision-trace hash encoding.

- Node canonicalizer: `simulation/evaluation/canonical-action-trace.cjs` exports `canonicalActionTrace(trace)` and `actionTraceSha256(trace)`.
- Python parity/validator: `scripts/action_trace_integrity.py`.
- Cross-runtime vectors and malformed-input tests: `tests/action-trace-canonical.test.cjs`.
- Existing Twinleaf campaign runner already requests `captureDecisionTrace` and preserves `game.decisionTrace`: `simulation/evaluation/aichi-campaign-runner.cjs` around lines 226 and 332.
- Research synthesis/limits: `results/aichi-2026/action-trace-integrity-gate.md` and `results/aichi-2026/campaign-action-trace-capture.md`.

If the captured V3 trace can be represented as the existing sequential `[{step, action, ...}]` envelope, compute `decisionTraceSha256 = actionTraceSha256(trace)` and persist the raw trace inside the `policy-and-counterplay` evidence package. If Twinleaf's trace needs a lossless normalization, document and test that mapping rather than hashing an opaque summary.

Important limitation from the existing gate: a matching SHA proves internal payload consistency only. It does not prove the trace is complete, authentic, or replayable; the independent reviewer still needs to check the actual trace against the pinned runner/engine and role-to-seat policy mapping. The existing campaign runner explicitly describes its trace as aggregate and not a full replay, so do not overclaim.

— Agent 43