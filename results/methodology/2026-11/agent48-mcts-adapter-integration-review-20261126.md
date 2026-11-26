# MCTS adapter integration review — 26 November 2026

**Disposition:** integration not yet accepted; no full game or competitive result is authorized by this review.

## Scope and revisions

Read-only review of `agent12/current-main-mcts-integration-20261126` at `cadf997be0922aae94923ef95a98fde4eb6f1c0a`, compared with `main` at `4b4891e626b79ee7cc59bdca2238cffe828ea0fb`.

The feature branch is **44 commits ahead / 87 behind** current main and changes seven paths: the existing native workflow, one results README line, Agent5's core result note, the new generic adapter, the MCTS core, the new adapter test, and the new core test. The main-only delta includes V3 runner/test changes. Do not merge the feature branch wholesale or carry its README snapshot forward; reconcile the focused code/test/workflow changes onto current main and preserve the existing Flittle pilot/test unchanged.

## CI evidence

Existing workflow `.github/workflows/agent5-owner-root-native.yml` already contains the new adapter test step; no new workflow is needed.

- Core/event-schema checks passed on run [45761275117](https://github.com/FlareZ123/experiment-01/actions/runs/45761275117), head `4e3aea07794b54e3ba485051ff72d3386626426d`.
- Existing MCTS core/belief checks passed on run [45760983787](https://github.com/FlareZ123/experiment-01/actions/runs/45760983787), head `9a66bf5df0c67c09e68df8055eef83ed132fde33`.
- The current adapter test run [45764874245](https://github.com/FlareZ123/experiment-01/actions/runs/45764874245), head `cadf997be0922aae94923ef95a98fde4eb6f1c0a`, **failed**. The existing Agent14 same-Store native prompt continuation test passed 2/2; the new adapter test failed 4/4.

The failed-job log was retrieved with a 150-line tail and only the failed job. Immediate causes:

1. Three tests failed with `TypeError: initializeHistory is not a function`. The adapter defines `initializeHistory`, but omits it from the object returned by `createTwinleafTwoSidedSearchAdapter`; the wrapper destructures and calls the missing property.
2. The native fixture failed with `ReferenceError: NATIVE_PROMPT_KECLEON is not defined`. The test references five `NATIVE_PROMPT_*` constants but declares/imports none. Their source-backed values exist on PR65 head `420ad63774c51b6eeb97fd78174958ad2a8205d7`, file `tests/2026-11/agent3-dde-energy-frontier-native.test.cjs` lines 22–26:
   - `Double Dragon Energy ROS`
   - `Regidrago V SIT`
   - `Kecleon PLF`
   - `Dedenne GX UNB`
   - `Tapu Lele-GX GRI`

The PR65 file is unmerged; the adapter test must define these exact values or import a shared fixture from a mainline module.

## Additional adapter contract findings

### Per-seat history is lost across redeterminization

The c9668a7 history update correctly separates native action history (transition actor) from prompt decision history (prompt owner), storing a sanitized actor observation, prompt projection, selected opaque tokens, and digests. However, `historyByState` is an adapter-private WeakMap. The adapter's `transferMetadata()` copies it only across native Simulator transitions and prompt continuations.

The adapter still returns `redeterminize: deps.redeterminize` unchanged. The core calls this callback to create sampled States. The native fixture's redeterminizer constructs a new `Simulator(state).store.state` and copies only the external K0/K1 `metadataByState`, not the adapter's `historyByState`. The next observation therefore receives an empty `unattested-root-prefix` history. Prior action/prompt history is lost; with `requireCompleteHistory:true`, the sampled State is no longer complete. The core's before/after actor-observation hash check should expose this once the test reaches that point.

Minimal fix: wrap `deps.redeterminize` in the adapter and copy only the immutable history metadata from the source State to the returned sampled State. Do not invoke the full `transferMetadata()` unless its K0/K1 refresh is made idempotent; the external redeterminizer already handles knowledge metadata. Add a regression that verifies distinct physical-seat histories survive redeterminization and that the other seat's private history is never exposed.

### Root-history attestation is not bound to the root State

`initializeHistory(rootState)` checks that `rootHistoryAttestation.rootStateDigest` is 64 hex characters, but does not compare it with a canonical digest of the actual supplied `rootState`. The new test uses `'a'.repeat(64)` and accepts it. Thus a stale attestation from a different root can mark a prefix complete. Bind the digest to a canonical host-side snapshot of the actual root State, or require a trusted verifier callback that performs that binding; test stale-root rejection.

### No-winner terminal contract is a separate required core dependency

The current integration-branch core supports `seat-win` and `adjudicated-draw` but not the distinct `adjudicated-no-winner` terminal class. This is not equivalent to a draw for evidence purposes even though both map to the payoff vector `[0,0]`. Agent5 implemented the distinct typed class plus a per-rollout terminal receipt in PR #77 head `806ee886034d34ff9b757f32c740e9b56b220b2c`; exact-head native-search-only run [45761999616](https://github.com/FlareZ123/experiment-01/actions/runs/45761999616) passed. When porting the general-sum core, include this PR77 union/receipt delta and its `typed-terminal-outcome-v2` schema. Raw Twinleaf `GameWinner.NONE`, unresolved, invalid, aborted, and unsupported outcomes must remain rejected unless the event-level adjudicator explicitly emits the typed no-winner result.

### Core/adapter interface mismatches remain

Agent5's source review also identified that the adapter asserts `actionContext.actorSeat`, while the core supplies `transitionActorSeat`, and that the adapter audit's prompt-event schema ID differs from the core's expected schema ID. These were not reached by run 457648 because the adapter export and fixture-constant failures occur first. Reconcile against the exact current core contract before the next CI run.

### Engine pin environment is a literal

The branch workflow currently sets `AGENT36_TWINLEAF_COMMIT_SHA` to the literal `a9905a76...`. The pinned submodule currently has that gitlink, so the run's present environment is consistent; however the runner only compares the environment value with the manifest's `enginePin`, not with the actual checked-out submodule commit. Derive the environment value after checkout using `git -C vendor/twinleaf rev-parse HEAD` and compare it with the manifest pin, so a future gitlink update cannot be mislabeled by a stale literal.

## Acceptance boundary and next steps

1. Export `initializeHistory` from the adapter factory.
2. Define/import the five exact PR65 native fixture names.
3. Wrap redeterminization to preserve per-seat history; bind root attestation to the actual root State.
4. Correct `transitionActorSeat` and prompt-event schema ID against the current core.
5. Derive the engine SHA from the checked-out gitlink.
6. Rebase or port the focused changes onto current main; do not merge the 87-commit-behind branch wholesale.
7. Rerun the existing `agent5-owner-root-native.yml` lane on the exact new head. Review one exact-head run before declaring the adapter accepted.

No game was dispatched by Agent48. This review is integration evidence only: it establishes neither a competent full-game policy nor any deck matchup result, and it makes no claim toward the 99.5% target.

## Communications

- Agent12 branch-delta map: `communications/agent12/2026-11/20261126T054904Z_agent48-current-main-branch-delta-map.md`
- History/redeterminization review: `communications/agent12/2026-11/20261126T055514Z_agent48-history-redeterminization-review.md`
- Exact-head CI failure: `communications/agent12/2026-11/20261126T055940Z_agent48-exact-head-ci-failure.md`
- Fixture constant source: `communications/agent12/2026-11/20261126T060033Z_agent48-native-fixture-constant-source.md`
- Follow-up pin/history review: `communications/agent12/2026-11/20261126T055723Z_agent48-followup-history-and-engine-pin-review.md`

— Agent48
