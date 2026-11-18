# V3 step-34 worker-closure failure diagnosis — 2026-11-18

## Question

Why did the canonical exact-head V3 compile/no-fixture gate fail before reaching the native no-game witness on `9f3c84b88fc61f8e5de2929574a1ecfe8aa2fc3d`?

## Evidence

Actions run `44243254571` compiled the pinned Twinleaf revision successfully and failed at step 34, `Verify V3 compiled no-fixture worker, prompt, privacy, and fixture contracts`, with **318/320 tests passing** and exactly two failures:

1. `tests/2026-11/agent36-v3-fixture-game.test.cjs:213` expected the obsolete source literal `actorOnlyExecutionBoundary: null`. The production runner now correctly maps the role-composer boundary through `projectActorOnlyBoundaryToTrial(roleResult)` before storing it in the trial. This is a stale test assertion, not evidence that production propagation should be reverted.
2. `tests/agent36-v3-runner.test.cjs:781` failed the role-closure assertion because `unclassifiedEnvSites` contained `simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs`.

The second failure initially appears to be caused by `function buildEnvironmentManifest(files, env = process.env)`. The lexical audit in `simulation/evaluation/agent36-source-closure-audit.cjs` counts bare `process.env` references as unresolved unless they are recognized dotted/bracketed reads. Moving `process.env` to another call site in the same file would still trigger that detector.

A dependency trace identified the more useful root cause:

`agent49-native-fixture-game.cjs`
→ `agent45-independent-competitive-admission.cjs`
→ `agent43-independent-outcome-competence-v3/v2.cjs`
→ `scripts/agent12-balanced-field-ledger-validator.cjs`
→ `agent36-4410-policy-provenance.cjs`.

`agent49-native-fixture-game.cjs` uses only `evidenceBundleSha256` from the heavyweight admission module. That helper is also exported directly by `simulation/evaluation/canonical-evidence-json.cjs`.

## Recommended repair

On the canonical PR branch:

- Replace the `agent49-native-fixture-game.cjs` import of `evidenceBundleSha256` from `agent45-independent-competitive-admission.cjs` with the direct import from `canonical-evidence-json.cjs`.
- Update the stale fixture-game test to validate the current `projectActorOnlyBoundaryToTrial` behavior rather than regex-matching the removed `actorOnlyExecutionBoundary: null` implementation detail.
- Re-run the exact acceptance sequence on the new SHA. Because the dependency change is production source, do not reuse the old exact-SHA contract receipt.
- Preserve the existing lexical environment detector; do not evade it with alternate spellings of `process.env` or a broad exception.

## Status

No native no-game witness ran on `9f3c84b` because step 34 failed first. No fixture or competitive evidence was produced. The findings were sent to Agent49 and Agent44; Agent7 made no canonical branch changes.