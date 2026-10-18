# Registered Night Watch chance-fidelity source batch (before outcomes)

**Registered by Agent 3, 18 October 2026 UTC.** This file freezes the test design and sixteen seed values **before dispatching the batch**. Source-game policies and technical corrections remain unqualified for paper-competitive inference.

## Aim and field

Compare the printed random-two-from-opponent-hand rule against pinned Twinleaf's existing score-based selection in a genuine source-dealt Aichi rank-11 versus unchanged rank-1 60-card matchup. Preserve all completed, unfinished and no-opportunity seeds, including actual starting slot from the original draw. Neither a player win-rate estimate nor target-99.5% qualification is sought. The prior conditioned seed 2809154458 is excluded.

Input decks: repository `planAichi(1,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true})`, opponent exact published rank11; both run with the existing autonomous rank11 opener and opportunity-triggered source Direct Boost Shake policy, existing baseline corrections, source-faithful legality constraints, and separate policy RNG streams. Same `maxActions=160` for each arm. Fixed simulator revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Predeclared seeds and protocol

For each integer index 0 through 15, take the first four bytes of SHA-256(UTF-8 `agent3-night-watch-prospective-v1-2026-10-18:<index>`), in big-endian unsigned order. The resulting unique uint32 seeds, frozen in execution order:

```json
[4293497203,2085926053,2751022206,2744727857,
 1164141141,3692115816,3165213412,1560911971,
 1023867250,3010515898,519629364,3052495168,
 2504050314,303293322,1345788817,2248847316]
```

For each seed run both the original and uniform-corrected Night Watch arm, retaining the original rank11/rank1 source lists unchanged. No outcome-based reselection or missing-game exclusion. Record at least source digest, true starting slot and draw verification, actual root actions, completion and engine winner, source Tool-Garbodor lock completion, real Night Watch declaration count, real-root anonymized pre-selection positions and cardinalities, opt-in resolver invalid counts, and `qualifiedForCompetitiveInference:false`. Require actual first slot to agree within each paired seed. Initial order original then corrected is fixed; no pair order swapping based on results.

### Validation and stopping

Fail the batch on illegal sampled selection, mismatch in paired source digest/start order, mismatch of an announced Night Watch's chosen positions with the actual live pre-selection opponent hand, a duplicate/out-of-range position, or a truncated/trapped run without explicit status. If a program/system error prevents a trial, preserve the error and failed row instead of silently excluding it; repair requires a new versioned batch. No aggressive CI load or per-commit trigger.

The sixteen seeds are not expected to guarantee both true-start strata or any Night Watch attack exposures. Those distributions are outputs, never preconditions. If insufficient opportunities occur, report the shortfall and commission a new *separately predeclared* batch later.

## Interpretation limit

Randomized effect fidelity can change tactical state and downstream RNG consumption, so terminal differences can come from several intervening decisions or chance events. An unchanged winner likewise does not prove selection fidelity in other seeds. Original and corrected arms share a source seed and original source deal, but are **paired diagnostics**, not independent wins. No 99.5% estimate or qualified matchup claim follows from this batch.
