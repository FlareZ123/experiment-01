# Strict native terminal-marker qualification for the common Aichi runner

**Agent 48 | 3 November 2026 | evidence-classification correction, no gameplay result**

## Defect and direct source trace

The canonical live headless Twinleaf runner `simulation/twinleaf/headless.cjs` emits `finished: true, endReason: 'engine-game-end'` only when the Store has reached `GamePhase.FINISHED`; unfinished action budgets emit `finished: false, endReason: 'action-limit'` (the current pinned research runner, lines near 1787-1789). `simulation/evaluation/agent41-native-attempt-disposition.cjs` instead treated `finished: true` with *any non-null end reason* as `ENGINE_TERMINAL`. A fabricated or version-drifted end reason such as `bot-shutdown` would be counted in native terminal tallies. An unrecognized reason for `finished: false` could be reported as incomplete without exposing the explicit contradictory native marker.

This classification is consequential because archived terminal/cap denominators are developmental evidence for source-policy competence and prospective paired-run preservation. Neither classification establishes a paper-valid tournament game.

## Correction and verification

Commit [`418b801`](https://github.com/FlareZ123/experiment-01/commit/418b80116ea777b5472ef80a2aed8112c815864c) makes `ENGINE_TERMINAL` contingent on the headless producer's exact `engine-game-end` marker, and permits only `action-limit` for unfinished rows with an explicit end reason. Other labels fail closed as `CONFLICTING_NATIVE_FIELDS` and supply no winner. Rows with missing end reason remain unverified.

Commit [`90cf2f4`](https://github.com/FlareZ123/experiment-01/commit/90cf2f43381a8b289e827860f49ea80208e19529) adds two negative/positive cases to `tests/agent41-native-attempt-disposition.test.cjs`, including arbitrary completed-end labels and unrecognized unfinished reasons. The earlier real archived rank16 and rank6 terminal/cap regressions remain in the suite. Commit [`32cbb68`](https://github.com/FlareZ123/experiment-01/commit/32cbb688d5538c3babaac1472d60722f147c887e) attaches this test to an existing manual-only statistical verification step, with no new workflow or automatic trigger.

The [manual GitHub Actions run 41593386428](https://github.com/FlareZ123/experiment-01/actions/runs/41593386428) at exact head `32cbb688d5538c3babaac1472d60722f147c887e` completed **successfully**. Its “Verify independent source-deal and real native-opportunity receipt integrity” step passed the 18 Agent48 receipt tests and nine native-attempt-disposition tests. The entire `test-benchmark` job and workflow succeeded.

## Scope

This gate is a pure result-reader correction. It does not validate actual Store gameplay, owner-only decisions, prompt payments, response quality, hidden information, official paper match clock, or 99.5% wins. It adds no original Aichi opposing 60 and changes no selected deck or policy. Full field status stays **29/32 authentic printed opponents and zero competitively qualified games**.
