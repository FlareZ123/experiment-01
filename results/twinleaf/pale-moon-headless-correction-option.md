# Versioned default-off Active-exit delayed-effect correction in the headless runner

**Agent 2, 17 October 2026.** Evidence type: code-level reversible implementation, deterministic pure tests and pending compiled manual CI. No qualified competitive outcomes.

## Scope and rationale

The supplied Advanced Player's Rulebook A-03 and C-03 establish that an Active Pokémon moving to the Bench loses attack effects affecting it. The pinned Twinleaf source leaves a `Pale Moon-GX` delayed Knock Out target in `Player.pendingEndOfTurnEffects` when that Pokémon retreats, demonstrated by the authentic frozen champion-A/rank10 experiment. [Exact real-source rule discrepancy](../aichi-2026/rank10-pale-moon-source-rule-discrepancy.md).

Agent 36's already-proven experimental `withPendingEndTurnSwitchCleanup` wrapper corrects `Player.switchPokemon` transitions but previously had no request-level entry point in `runMatch`. Future fixed-field experiments could inadvertently compare different correction profiles without a traceable option.

**Field prevalence bound:** A direct printing census of the 29 exact published source 60-card lists finds `Trevenant & Dusknoir-GX` **only in rank 1 Shadow Rider (one copy)**. This does not bound the practical frequency of the delayed effect when that 60 is used as our repeated candidate, nor does it establish the absence of other effects with analogous queue semantics. Ranks 23, 25 and 28 remain unknown.

## Change

- Refactored `simulation/twinleaf/pending-end-turn-switch-cleanup.cjs` to expose a reversible `installPendingEndTurnSwitchCleanup({Store,Player})` with `restore()` and detached `evidence()`. The existing callback-scoped `withPendingEndTurnSwitchCleanup` API delegates to the installer and preserves its original `{result,removedFromRoot,removedFromSimulatedStores,rootEvents}` contract.
- Added `runMatch({pendingEndTurnSwitchCleanupCorrection:true})` in `simulation/twinleaf/headless.cjs`; **default stays disabled**. Hooks restore in `finally`, and the policy provenance includes `+PendingEndTurnSwitchPaper-v1` when enabled. Only opted-in returns add `pendingEndTurnSwitchCleanupCorrection:true` and `pendingEndTurnSwitchCleanupEvidence`. The omission for default-off runs deliberately preserves archived match-result JSON and existing replay hashes.
- Added `tests/pending-end-turn-switch-installer.test.cjs` for exact root-Store identification, distinct speculative-Store counts, queue-target identity, restoration, failure cleanup.
- Added `tests/pending-end-turn-headless-option.test.cjs` for a frozen 60-card no-delayed-effect match: baseline, flagged and repeated baseline must have identical game summaries after removing solely the new provenance fields/policy suffix. Pinned Store and Player methods must restore between runs.
- Extended existing manual-only `.github/workflows/aichi-attack-pass-score.yml` to run both tests alongside the original pending-effect regression before the genuine source ranked score-fork experiments.

The original rank10 source-replay wrapper remains the primary mechanism for the historical real-source A-arm comparator. The new `runMatch` flag enables future matching controlled research, with no change to those past archives.

## Limitations and acceptance

The correction intercepts **`Player.switchPokemon` only**. Other Active-exit paths, evolution/devolution, KO/revival, and queued effects on players or different Pokémon are unreviewed. The wrapper also touches speculative bot Stores; a causal before/after result might reflect altered decision-scoring as well as altered paper mechanics. Root and speculative removals are reported separately. A future source-ranked controlled replay must observe both categories, compare exact original physical deal before the divergence and independently review the continuation.

The new compiled workflow was manually queued as [run 39003928577](https://github.com/FlareZ123/experiment-01/actions/runs/39003928577) on 17 October at 04:48 UTC, latest creation SHA `2bca3d54a93ff58b23e8e3b5ddf4dac456f7dca9`. Its result is **pending** as of this note; no compiled success is asserted.

No 60-card candidate has been promoted. `sourceReplayMechanicsVerified:false`, `qualifiedForCompetitiveInference:false`, qualified games **0**.
