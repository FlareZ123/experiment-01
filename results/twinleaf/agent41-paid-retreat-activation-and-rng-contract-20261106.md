# Agent41: paid-Retreat root activation and RNG adapter contract

Date: 2026-11-06  
Scope: shared Twinleaf adapter correctness and historical v9 experiment validity  
Current adapter blob: `bddee0435a3a0001c0d0e4620dba4ced08a6e6ec`  
Current headless blob: `779dcdb327327d8c60a369de4abd72424ccd24a1`

## Executive finding

The historical Agent36 v9 paid-Retreat A/B/A experiment did not activate its intended treatment. Its frozen Agent41 adapter blob omitted the paid-Retreat flags from the predicate that decides whether to install the actor-only `scopedRoot` wrapper. Since the treatment option was only passed inside that wrapper, B ran without the treatment.

This is a tooling and experiment-validity failure. It is not evidence that paid Retreat is ineffective, and it is not a competitive matchup result.

The shared adapter now fails closed on treatment activation, records the selector and wrapper receipts, and forwards explicit RNG-isolation settings to the pinned headless runner. The targeted CI suite passed.

## Historical v9 defect, independently verified

The v9 registration is:

- `results/aichi-2026/registrations/agent36-issue25-common-v9-paid-retreat-aba-20261106.json`
- It froze Agent41 adapter blob `537157dff43fefa1a429f6e0bb72387cde51708d`.
- Fetching the adapter at commit `7ea8479c6acda71916aade2f28f73065a50b7c88` returned that exact blob.

In the frozen file, the empty-wrapper predicate at lines 1455-1470 omitted both `!actorTwoUnitPaidRetreatRoot` and `!actorTwoUnitPaidRetreatRootV2`. The v9 B mode set `actorTwoUnitPaidRetreatRoot=true`, but the predicate still selected `scopedRoot={}`. The option payload inside `withActorOnlyRootPolicy` was therefore unreachable.

The v9 native workflow run was `42246115429`. Its failed-job log reported:

- 24 attempts, with all registered IDs returned.
- Five native errors per phase and three 128-root caps per phase.
- Zero finished games.
- Zero source or candidate `RetreatAction` roots.
- Zero paid-Retreat events, physical-custody joins, follow-on attacks, or competitive-qualified games.
- `treatmentChangedTrialCount=0`.
- `controlsRepeatedExactly=false`.

The native test failed at line 28 on `controlsRepeatedExactly`. The summary's `allTreatmentFirstDivergencesAreRetreat=true` is vacuously true when there are no treatment divergences. It is not a treatment witness.

The original v9 registration and archive remain unchanged. The current adapter has a different blob, so the v9 preflight should remain frozen and should not be rerun against the modified adapter.

## Adapter changes

File: `simulation/evaluation/agent41-bilateral-v2-development.cjs`

1. Added `isolatePolicyRandomness` and `isolatePhysicalShuffleRandomnessAfterSetup` options to both `runDevelopment` and `executeDevelopment`.
2. Preserved legacy shared-PRNG behavior by default.
3. Explicitly pinned full physical-shuffle isolation off in the request.
4. Passed the selected flags to `headless.runMatch`.
5. Compared the headless result's policy-isolation, physical-shuffle-isolation, after-setup isolation, and protocol fields against the requested selection.
6. Recorded the selected RNG protocol in every successful row, error row, and top-level run manifest.
7. Precomputed the exact v1/v2 paid-Retreat selector object and passed that object into the live `withActorOnlyRootPolicy` wrapper.
8. Added a fail-closed activation receipt. A paid-Retreat opt-in now requires:
   - bilateral actor-only composition;
   - an installed live `scopedRoot.root` wrapper;
   - the exact requested v1/v2 selector flag in the wrapper options;
   - the exact requested target turn in those options.
9. Added row and run-manifest fields:
   - `twoUnitPaidRetreatRootOptIn`
   - `twoUnitPaidRetreatRootV2OptIn`
   - `twoUnitPaidRetreatRootOptionPassed`
   - `twoUnitPaidRetreatRootWrapperSelected`

The root activation receipt is intended to prevent a silent no-treatment A/B/A. It is an instrumentation receipt, not proof that a legal RetreatAction was proposed, accepted, paid, or strategically useful.

The headless callback contract already existed and did not need further plumbing:

- `onRootStoreCreated(store)` runs immediately after the actual match `new Store(...)`.
- `onRootActionDispatched(store, action, actions, seat, turnBefore)` runs after successful dispatch and after the root ledger row is inserted. The callback's `actions` value is the same ordinal recorded in `rootActionLedger`.

Agent41 already forwards both callbacks through `runDevelopment` and `executeDevelopment`. Agent42's v2 custody observer consumes this exact contract and binds its receipt to the root ordinal.

## Tests and CI

Added pure regression tests in `tests/agent41-bilateral-v2-development.test.cjs` for:

- legacy RNG defaults;
- each isolated RNG protocol;
- explicit full-shuffle isolation remaining disabled;
- invalid RNG option types;
- v1/v2 paid-Retreat selector and target-turn propagation;
- missing selector or missing wrapper failing closed.

Added the Agent41 adapter and Agent42 v2 custody tests to `.github/workflows/twinleaf-policy-rng.yml`.

Successful run: [42254027786](https://github.com/FlareZ123/experiment-01/actions/runs/42254027786)

The run checked out and compiled the pinned Twinleaf revision, passed the Agent41 adapter test, passed the Agent42 v2 custody test, passed the shared/isolated RNG smoke test, and passed the native proposal-to-Store noninterference smoke test.

A default `twinleaf-completion.yml` run `42253455137` passed its bounded-match job but skipped the abort-custody job. An explicit attempt to dispatch that workflow with `abort_provenance_only=true` failed because the workflow declares more than GitHub's 25 `workflow_dispatch` inputs. The focused RNG workflow was used instead. The oversized dispatch-input surface remains a CI maintainability issue.

## Agent42 v2 replay coordination

Agent42's v4 registration is:

`results/aichi-2026/registrations/agent42-rank1-root-bound-paid-retreat-v2-replay-20261106-v4.json`

It pins the current Agent41 adapter blob and discloses that it deliberately reuses previously observed v4 seeds. It must remain labeled as a paired replay, not an independent sample.

At the time of this report, the only visible replay runner still pointed to the older v2 registration path and blob. Agent42 was notified to update the runner's registration path, blob, version, output, and workflow invocation before execution. The runner should also assert the B-phase Agent41 option-passed and wrapper-selected receipts, with A/C controls false.

## What this work does not establish

- No new native paid-Retreat A/B/A game was executed by this investigation.
- The successful CI run validates adapter and custody tests, not competitive game strength.
- The historical v9 result is a failed treatment activation, not a negative card-strength result.
- Agent42's v4 replay uses reused seeds and is not a fresh sample.
- No paper-qualified game, matchup win rate, final 60-card deck, or 99.5% field performance is established.

The shared project status remains 29/32 authenticated Aichi original lists, zero competitively qualified games, no nominated final deck, and no demonstrated 99.5% win rate.

## Next steps

1. Confirm Agent42's v4 runner actually consumes the v4 registration and refreshes every frozen blob before running.
2. Require B rows to carry all three true receipts: opt-in, option passed, wrapper selected. Require A/C to carry false receipts.
3. Preserve Agent42's exact root-Store callback custody and root-action-ordinal join.
4. Use a root horizon beyond the known root134 terminal event. Retain all aborts and action caps.
5. Require exact A/A' root-ledger replay before interpreting A/B.
6. Require a positive source-seat B divergence at an accepted RetreatAction, two exact physical Psychic Energy objects, correct target promotion, preserved target Energy/Tools, a settled target attack, Prize transition, immediate opponent response, and the next source turn.
7. Keep paired historical replay separate from fresh prospective seeds and from competitive-game qualification.
