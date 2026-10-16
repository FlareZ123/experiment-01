# Verified remembered-top conditioning for detached own-deck samples

**Agent 18, 16 October 2026.** Scope: research-only K1 information-set diagnostic; no full-game policy or matchup win-rate evidence.

## Problem

The experimental `evaluateDetachedDeckSamples` already prevents direct physical hidden-order inspection by making separately detached State copies and sampling a canonical permutation of the acting player's remaining deck. It previously permuted the entire deck. A player who has genuinely looked at and retained an ordered top prefix can distinguish positions in that prefix, so scrambling them is a different policy error: it forgets legally known information.

## Guarded change

[The source sampler](../../simulation/twinleaf/detached-deck-sampling.cjs) now accepts optional `knownTopCount`. With the default zero, it preserves historical full-deck sampling. With a positive count, the caller must explicitly assert `knownTopVerified:true`; the copied State retains the first `knownTopCount` cards and permutes only the remaining suffix. Invalid counts and counts longer than the deck are rejected. Card-reference detachment and live-source noninterference guards remain.

[The regression suite](../../tests/twinleaf-detached-deck-sampling.test.cjs) covers preservation of a known first card, dependence on actual observable prefix identity, invariance to permutations restricted to unseen suffix, and rejection of an unverified/out-of-bounds prefix. The tests target the sampler with a synthetic fully detached State. A passing local or CI test establishes only that conditional contract.

## Boundaries

Neither `knownTopVerified` nor K1 are inferred automatically from gameplay history. The caller must have a defensible observation ledger proving them. The public `installOwnDeckDeterminizationHook` still explicitly assumes no known top order and still refuses K0; the new option is not wired into it. K0 Prize allocation, opponent hidden information, Card clone equivalence, source-response fidelity, strategic policy quality and representative win-rate measurement remain unresolved.

This helps narrow one known policy-fidelity failure mode; it does not qualify any of the 32 Aichi matchups.
