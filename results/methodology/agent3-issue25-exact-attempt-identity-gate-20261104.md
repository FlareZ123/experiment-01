# Agent 3: exact registered-trial custody for Issue 25 v0

**Date:** 4 November 2026. **Scope:** evidence reconciliation only, not competitive gameplay.

## Question and observed defect

The newly selected development entry `simulation/evaluation/agent36-issue25-selected-v0.cjs`, reviewed at 16:17 UTC, constructs the expected four `developmentTrials().map(row => row.id)` entries and then exposes:

```js
allRegisteredAttemptsReturned: rows.length === expected.length
```

This can return true when a runner repeats one registered ID and omits another, or returns a foreign ID in place of an expected ID. Four rows are necessary but insufficient for a four-trial exact return claim. A row with absent or contradictory IDs must be flagged without guessing attribution from seed or rank.

## Implemented pure guard

[`simulation/evaluation/agent3-registered-attempt-reconciliation.cjs`](../../simulation/evaluation/agent3-registered-attempt-reconciliation.cjs) exports `reconcileRegisteredAttempts(registeredIds, returnedRows)`. It accepts returned native success, error, abort and cap rows as raw inputs. It reports the count parity separately from `exactlyReconciled`, which requires:

1. Each registered ID is a nonempty unique string.
2. Each returned row resolves to one nonempty trial ID from `row.trial.id` or `row.id`, and these are equal if both present.
3. Each registered ID appears exactly once and no extra ID appears.
4. Total registered and returned row counts agree.

All failure classes are explicit: duplicate registered, duplicate returned, missing registered, unexpected returned, missing-ID row index and contradictory-ID row index. The check is independent of row order and deliberately does not filter failure/cap/abort statuses. Its success proves only exact ID accounting.

## Tests and reproducibility

[`tests/agent3-registered-attempt-reconciliation.test.cjs`](../../tests/agent3-registered-attempt-reconciliation.test.cjs) contains six tests: an exact four-arm mixed-status positive, same-count duplicate substitution, same-count unknown substitution, malformed/conflicting IDs, duplicate registration, and direct IDs/type rejection. **Local Node `node --test`: 6/6 pass, 0 fail.** Existing manually dispatched pure CI [run 41866395642](https://github.com/FlareZ123/experiment-01/actions/runs/41866395642) **SUCCEEDED** at head `62f5768f635eff7d96be9a9d93cc011f1ee94688`, including the six new tests. This is the pure suite, not native gameplay certification.

Source commit: [`5952de20`](https://github.com/FlareZ123/experiment-01/commit/5952de20e1b324ecb475ed9f598e54b1d6e680a8); test commit: [`e51254ed`](https://github.com/FlareZ123/experiment-01/commit/e51254edf9493d7564ce330deeb8ccef26523943). Agent 36 direct handoff: [message](../../communications/agent36/20261104T1620Z_agent3_exact_trial_id_reconciliation_ready.md).

## Integration boundary and remaining vetoes

The current Agent36 selected v0 does **not yet invoke this helper**. Its existing flag therefore remains count-only. The steward can include this component and its source in the actually running hash closure, replace the flag with `exactlyReconciled`, and rerun an injected duplicate-row regression before marking custody PASS. Neither this helper nor an exact four-arm return proves symmetric actual policy, owner-information safety, correct printed resource payment, historical printing legitimacy, an adequate opponent reply, an uncapped paper-clock game, or a win-rate result. These remain separate Issue25 gates.

At report time: 29/32 original field card-name/count inventories authenticated, no selected competitive fixed 60, zero competitively qualified games, 99.5% not demonstrated.

## Concurrent Issue25 stewardship development

After this registration, Agent36 independently updated selected-v0 to reconcile unique ID strings and observe actual vendor/repository HEADs; see the updated source at the time of any release. That implementation does not presently use this helper's stricter raw-row conflicting-ID check. The initial count-only defect is therefore historical for the original v0 source commit, while the stronger raw-row custody test remains independently usable. No qualified games arise from either version.
