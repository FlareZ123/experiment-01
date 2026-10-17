# Rank-10 source continuity: exhaustive selected-snapshot delta audit

**Agent 22 · 17 October 2026 · Evidence: compiled single-deal replay and adversarial pure tests. Qualified competitive outcomes: zero.**

## Why the older five-gap report was incomplete

The previous [five-gap attribution](agent22-rank10-continuity-hook-boundaries.md) used `firstMismatch` on detached `observableState` snapshots after one source `Store.dispatch` and before the next. An array-length mismatch ends that comparison immediately, so additional hidden-zone or card-history changes occurring at the *same* boundary could be omitted from the report. The earlier phrase “only first observed field” accurately described its limited evidence. It was insufficient for asserting that a gap affected just the attack-history ledger.

## New code and acceptance gate

- `simulation/twinleaf/source-state-continuity.cjs`: `differingLeafPaths` enumerates all changed paths from the **same selected detached schema**, preserving both array-length changes and individual array elements, without mutating the source. `withSourceContinuity` now emits `changedLeafPaths` for each detected between-dispatch mismatch.
- `simulation/twinleaf/rank10-hook-boundary-attribution.cjs`: source rank-10 five-gap audit requires nonempty exhaustive paths and rejects any changed path outside `$.zones.previousAttack`. It also checks exact source trace step adjacency, attack-choice and WaitPrompt evidence, historical first mismatch, and absence of detected Card-history/policy-time changes.
- `tests/state-continuity-observer.test.cjs` and `tests/rank10-hook-boundary-attribution.test.cjs`: include an independent hidden-deck mutation that the old first mismatch would conceal. The new audit rejects the combined change.

A positive gate shows **exhaustiveness only inside the partial observableState projection**. Transient reducers, prompt callback closures, reference topology and other omitted engine properties require their own tests.

## Controlled CI evidence

[Manual CI 39032544872](https://github.com/FlareZ123/experiment-01/actions/runs/39032544872) **passed** on the isolation branch `agent22-rank10-full-delta-audit-20261017`, starting from last-known passing replay head `a0457938c56e31b2856d7b4524e0318e94e3f452` and adding only the four changed audit/test files. The pinned Twinleaf submodule remained unchanged.

The job compiled the engine, ran the pure tests, independently reproduced the unchanged root source-locked champion-B control (**350/350** actions) and Copied-Attack counterline (**235/235** actions) in a fresh process, and completed the strengthened hook-boundary attribution. Its corrected-clone continuity output still shows **five** selected-snapshot gaps, **zero** Card-history gaps, and **zero** policy-time mutations under the selected observer. Every exhaustive changed path in the five gaps belonged to the previous-attack ledger; the five source action classifications were three pre-Pass clearing actions and two post-copied-attack history restores.

The pinned *unrepaired* Simulator mode in that same run separately showed **10** selected-state boundary gaps, **7** Card-history gaps and **7** policy-decision mutations. These are diagnostic observations, not matched competitive trials. The corrected clone audit and pinned-source reports must remain separate.

## Shared-head incompatibility

The first [current-main run 39032146531](https://github.com/FlareZ123/experiment-01/actions/runs/39032146531) exposed a pure-test fixture ordering mistake and passed 116/117 tests; the corrected [current-main run 39032248776](https://github.com/FlareZ123/experiment-01/actions/runs/39032248776) passed **117/117** pure tests and compiled, but its fixed source-turn-27 capture was never observed. That later failure occurred *before* the exhaustive continuity gate, and therefore cannot be used to reject that gate.

A hypothesis under active independent testing is changed Double Dragon Energy decision policy in `dde-attach-tactic.cjs`. The code now checks attached cloned `selectedEnergy` from the speculative Store instead of a physically distinct source `wanted` Card, potentially enabling decisions that changed before archived turn 27. A branch replay at the otherwise unchanged baseline with only this tactic difference, `agent22-rank10-dde-v4-isolation-20261017`, is under [manual CI 39032690833](https://github.com/FlareZ123/experiment-01/actions/runs/39032690833). Until the controlled comparison completes, **do not claim causal identification**. A correctly changed policy should receive a new versioned source trace instead of being forced to reproduce an obsolete policy's action sequence.

## Qualification boundary

This proves a narrowly bounded observation: the *five particular* selected-snapshot discontinuities in one historical corrected-clone match were not accompanied by other changes visible to this projection. The replay remains `sourceReplayMechanicsVerified:false` and `qualifiedForCompetitiveInference:false`, pending full simulator mechanics, credible imperfect-information bot decisions, paper-rule review, opposite actual turn order, new independent source seeds and full Aichi field coverage. The tournament still has 29 of 32 exact source lists, with ranks 23/25/28 missing. Nothing here supports the 99.5% target.
