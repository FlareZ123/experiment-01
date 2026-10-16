# Agent 1: rank-10 source-State continuity versus speculative AI and compatibility hooks

**16 October 2026, invocation 105.** This is a bounded source-ranked instrumentation result. It is **not competitive matchup evidence**: `qualified_for_competitive_inference: false`.

## Authentic deal and reproducibility

The input is the published Aichi Open League 2026 rank-10 Regidrago list against the exact rank-1 champion Shadow Rider list, both through the print-aware source resolver with its documented Japanese-promo and equivalent Basic-Energy allowances. The physical pilot-B seed `4246551499` is from the frozen `decorrelated-slots-v3` schedule; the champion occupies physical seat 1 and actually goes first. These are the same published source 60s used in [the rank-10 qualification packet](../aichi-2026/qualification-packets/rank-10/README.md), without injecting any staged cards.

Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The `maxActions` limit was 350; flags enabled strict prompt checking, isolated policy RNG, Forest Seal search and Supporter correction, Double Dragon recovery, Mimikyu Copycat compatibility, declared Mimikyu/Regidrago attack history and Pass clearing. Both simulator modes received the same options, except that `postSuperAliasRepairIsolation` was enabled in the experimental mode.

The read-only [source continuity observer](../../simulation/twinleaf/source-state-continuity.cjs) records exact card printing, physical card `damageTakenLastTurn`, hidden-zone order, board flags and attack history from the **same live Store** immediately after each intercepted dispatch and immediately before its next intercepted dispatch. The first actual `AddPlayerAction` selects the live Store; cloned speculative Stores are excluded. No telemetry enters either policy. The [runner](../../simulation/twinleaf/agent1-rank10-continuity.cjs) independently repeats the game without instrumentation and asserts deep equality of returned game summaries in each mode. Pure regression tests are in [state-continuity-observer.test.cjs](../../tests/state-continuity-observer.test.cjs).

Two successful manual CI runs at heads `2b38f66a` and `9b9b55d1`:
[38913338215](https://github.com/FlareZ123/experiment-01/actions/runs/38913338215) and [38914413332](https://github.com/FlareZ123/experiment-01/actions/runs/38914413332). Full [second-run continuity JSON archive](https://github.com/FlareZ123/experiment-01/actions/runs/38914413332/artifacts/12052346533).

## Recorded root-Store boundary differences

| Diagnostic mode | Actual root actions | Live Store dispatches | Nonlive Store dispatches excluded | State differences seen across consecutive observed boundaries |
| --- | ---: | ---: | ---: | ---: |
| Pinned original Simulator | 169 | 171 | 602 | 10 |
| Experimental post-super reconciled Simulator | 348 | 350 | 2,519 | 5 |

The original mode's ten boundary mismatches comprised **seven first mismatches in physical Card `damageTakenLastTurn`** and three first mismatches in attack-history metadata. Concrete field changes included `0 -> 200` at live ordinal 82, `400 -> 0` at 121, `0 -> 150` at 137, and `0 -> 280` at 148 and 168. These appeared for actual opponent and champion Active Pokémon after AI activity; the published `simulator-card-reference-leak.md` separately established that the pinned Simulator can write this field through leaked Card references.

The reconciled mode's five *first* mismatches all concerned `previousAttack` metadata (record count or `Kaiser Tackle -> Apex Dragon`). **This does not prove that no physical Card field changed at the same boundary**, since this initial diagnostic only logged the first differing field. A separately logged Card-history subcomparison and direct pre/post bot-decision snapshots were subsequently added for follow-up testing.

### Recorder ordering is an important confounder

The observer is installed outside `runMatch`; the engine runner then installs its reversible research compatibility hooks **around** the observer's `Store.dispatch`. In particular, [the Pass history hook](../../simulation/twinleaf/last-attack-pass-hook.cjs) deletes the active player's previous attack before calling the wrapped dispatch, and [the declaration-history hook](../../simulation/twinleaf/copycat-declared-history-hook.cjs) repairs the printed copy-attack record after the wrapped dispatch returns. A metadata difference across these boundaries may therefore be a normal *hook-before-or-after-inner-dispatch* effect. Such history differences must not be promoted into proof of unsanctioned inter-action engine mutation. The separate Card damage-history scalar changes are consistent with the established simulator alias mechanism, but this observer alone does not attribute every change exclusively to speculative scoring.

The two modes follow different game trajectories and execute different numbers of actions. Their 10-versus-5 counts must **not** be compared as a failure rate or evidence of competitive improvement. Both reported an engine winner at physical seat 0, which is an unqualified bot outcome.

## Qualification boundary and next evidence

A [root policy boundary observer](../../simulation/twinleaf/source-state-continuity.cjs) now snapshots the actual root `SimpleTacticsAi.decodeNextAction` input and result, independent of the `Store.dispatch` hook order. A newly extended rank-10 runner also separately compares physical Card-history fields, so attack-history metadata cannot conceal a Card delta. That extension passed in [manual CI 38915754262](https://github.com/FlareZ123/experiment-01/actions/runs/38915754262). Exact root bot-decision observations and their limitations are recorded below.

This is a **partial-State observational diagnostic**, without a complete live prompt/reducer replay, equivalence of arbitrary simulator state transitions, competent two-sided opponent policy, full both-starting-order qualification, paper-rule sign-off, or independently sampled game outcomes. The rank-10 packet and central 32-rank readiness ledger remain unqualified.

## Follow-up: direct root bot-decision mutation attribution, verified

[Third successful manual CI 38915754262](https://github.com/FlareZ123/experiment-01/actions/runs/38915754262), repository head `10df9c9756f22b0e86a1d6b7dc0ba1f1e7a9ce45`, executed the nested `withRootPolicyMutationAudit` recorder while retaining a separately repeated uninstrumented game. Every physical source deck, seed, starting seat, engine revision and correction flag remained unchanged.

| Bot-decision measurement | Original pinned Simulator | Post-super reconciled Simulator |
| --- | ---: | ---: |
| Actual game actions | 169 | 348 |
| Root `decodeNextAction` source-State mutations | **7** | **0** |
| Root mutations involving `Card.damageTakenLastTurn` | **7** | **0** |
| Underlying Store-boundary differences | 10 | 5 |
| Physical Card-history differences across those boundaries | **7** | **0** |
| Read-only control result equality | Verified | Verified |

The root-only bot wrapper takes a detached full observable-State snapshot immediately before calling `SimpleTacticsAi.decodeNextAction(sourceState)` and immediately afterward, with a strict reference identity check against the authentic game's own `Store.state`. It therefore excludes the before/after dispatch hook-order artefact described above. The original mode's seven root-side effects are concrete effects of normal policy-decision evaluation on the authoritative game State. The reconciled mode produced **no root bot-decision State mutation observed by this audit on this source deal**, across its distinct 348-action trace. Both reruns preserved exactly the uninstrumented `runMatch` results.

Examples from the original mode's causal observations:

- Turn 7, champion bot (`actorId=202`) selected **Eon Blade**: opponent Active physical `damageTakenLastTurn` changed **0 → 200** during action selection.
- Turn 9, champion bot again selected **Eon Blade**: changed **0 → 200** on another Active Card instance.
- Turn 11, champion bot again selected **Eon Blade**: changed **0 → 200**.
- Turn 12, Regidrago bot (`actorId=101`) selected **Retribution Strike**: its Active Card history changed **400 → 0**.
- Turn 13, champion bot selected **Night Watch**: opponent Active Card history changed **0 → 150**.

The two other original-mode policy changes are preserved in the uploaded [third-run continuity JSON artifact](https://github.com/FlareZ123/experiment-01/actions/runs/38915754262) along with the full first-mismatch and field-specific digests.

**What has been proved:** For this exact rank-10 source deal, the pinned bot-selection routine mutates the authoritative physical-card damage-history fields, while the experimental reconciled clone did not cause any of these directly observed policy-time mutations. **What remains unproved:** that the repaired clone is generally semantically correct; that both modes have equivalent chance exposure given their different playing trajectories; that a particular mutated field changed the winner; or that either mode's AI decisions and paper Expanded game handling are sufficiently strong for matchup win-rate inference. None of these traces is a qualifying competitive game.
