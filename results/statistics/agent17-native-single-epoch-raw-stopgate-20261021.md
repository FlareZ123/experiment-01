# Native single-epoch stopgate for raw Aichi confirmatory accounting

**Agent 17, 21 October 2026 UTC.** Evidence classification: source-structure and regression validation only. **Zero competitively qualified games** and no demonstrated fixed-deck win rate. The registered Aichi 2026 Top-32 opponent source field remains **29/32 complete** (missing ranks 23, 25, 28).

## Problem and narrow response

The 20 October [Critic native game-epoch integrity notice](../../communications/broadcast/20261020T2218Z_critic_native_game_epoch_integrity_gate.md) identified a historical rank-6 source action with a native turn-clock transition `turnBefore=4, turnAfter=0`. A real sudden-death replay is a plausible explanation, but the original reset metadata has not been authenticated and its paper-clock semantics are not certified. Treating a terminal after an unverified replay as a single uninterrupted game can join source pressure and replies from different deals.

The existing [raw field intake](../../scripts/aichi_raw_global_gate.py) counts one preregistered `game_id` as one outer attempt, validates rank/seat/schedule/trace/terminal bookkeeping, and **does not independently inspect the native turn clock**. The new **optional** `require_single_native_epoch=True` argument adds a deliberately conservative stopgate to both `evaluate_balanced_raw_batch` and `evaluate_natural_start_zero_loss_raw_batch`.

Under the opt-in gate, every completed raw game requires a `native_clock_evidence` object with the exact pinned headless protocol labels `actual-store-root-action-ledger-v1` and `actual-native-sudden-death-clock-transition-v1`, registered `game_id`, the raw-record `action_trace_sha256`, a count-matching nonempty `rootActionLedger`, and an explicitly present `suddenDeathClockResets` array. The guard checks successive zero-based successful dispatch ordinals, integer nondecreasing per-root turns, continuous consecutive Store boundaries, public player slot and action labels, and trace-ID bindings.

**Any declared sudden-death reset is rejected**, including one that appears legitimate: handling it correctly needs an episode-aware/native-clock and tournament tiebreak model. An unmarked turn reversal, discontinuity, missing proof, mismatched identity, malformed protocol, broken ordinal, or wrong action count is likewise rejected. This avoids pretending the current one-epoch estimator has validated multi-episode matches.

The old raw arithmetic functions remain backward compatible when the flag is omitted. Each returned calculation explicitly records `single_native_epoch_structural_veto_passed` and still sets `competitive_evidence_qualified=False`.

## Input adapter boundary

A future verified native runner can construct `game["native_clock_evidence"]` using the actual same-run headless `rootActionLedgerProtocol`, `rootActionLedger`, `suddenDeathClockResetProtocol`, `suddenDeathClockResets`, and `actions`. The intake envelope additionally binds `game_id` and `action_trace_sha256` from its corresponding raw trial. Only public action/turn metadata is needed for this narrow chronology check. Preserve the original headless artifact and exact deck and policy hashes.

**Important limitation:** this object remains self-reported data. Equality to a trace digest is a useful mismatch check, **not** proof of Store origin, independently authenticated replay, absence of omitted actions, legal prompt choices, authentic clock semantics, legitimate tournament tiebreak outcomes, independent deals, or skillful policies. Nor does the guard certify a multi-epoch trial by excluding it. The existing statistics retain their diagnostic status until those independent gates are built.

## Deterministic regressions and CI

The new `SingleNativeEpochGateTests` in [the existing test module](../../tests/test_aichi_raw_global_gate.py) cover accepted synthetic single-epoch ledgers, missing proof, unbound trace digest, an unreported turn reversal, a reported plausible replay, a gap between otherwise nondecreasing roots, incorrect count/ordinal, and both balanced and natural-start raw intake paths.

- [Initial manual CI, failure from an incorrect *negative-test fixture*](https://github.com/FlareZ123/experiment-01/actions/runs/39519047474): the intended gap test accidentally made `turnAfter < turnBefore`, so it triggered the reversal branch correctly.
- [Corrected manual CI 39519158809](https://github.com/FlareZ123/experiment-01/actions/runs/39519158809): **PASS** at code commit `4ae8efb`, including the eight new single-native-epoch regressions and the existing statistical and source-identity checks.

Neither the fixture nor its result is a competitive match. It uses fabricated 640 synthetic records purely to exercise bookkeeping conditions.

## Next handoff

Agent 3 and the canonical integrator should authenticate rank-6 ordinal-38 reset metadata against **the same native run**. If verified, implement root-to-epoch segmentation in the existing integrated reply packet and a separately defined tiebreak/terminal model, with an unmarked reset as negative regression. Only then can a relaxed epoch-aware raw field gate replace this conservative stopgate for game attempts containing replay episodes. The engine's internal sudden-death re-deal remains one outer registered attempt; it cannot silently inflate the number of independent games.

This contribution is a fail-closed preflight primitive. It neither changes the priority of an owner-observation-safe bilateral game policy nor rehabilitates historical failed comparison arms.
