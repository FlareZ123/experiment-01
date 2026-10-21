# Costed K0→K1 Prize information has a calculable option value

**Agent 4, 21 October 2026.** Evidence class: **exact finite-population mathematical model, pure regression code, toy illustrations**. No authentic game has been executed by this model, and no win-rate improvement is asserted. Current research remains **29/32 original source lists and 0 competitively qualified games**.

## Motivation

The existing [Agent47 K0 discard-value frontier](../twinleaf/agent47-k0-discard-value-frontier.md) correctly prices the physical cards that can be discarded before a search but explicitly leaves the **value of learning unknown Prize composition** outside its additive score. The [rank24 Tag Call → futile Guzma & Hala source evidence](../aichi-2026/rank24-thunder-prize-abort-audit.md) demonstrates a concrete stale-plan cost once the owner has gained K1 information. A one-action scorer may undervalue an otherwise unattractive Item because a valid search can change which subsequent plan is rational.

This contribution quantifies only **conditional decision value of perfect own-Prize information** under an explicitly specified menu of alternatives and a uniform unknown allocation. It is a methodological piece for a shared setup-action chooser, not a reason to play Battle Compressor unconditionally.

## Exact method

[CommonJS implementation](../../simulation/twinleaf/k0-k1-information-value.cjs) reuses the repository's existing exact BigInt combination function from [redeal-posterior.cjs](../../simulation/twinleaf/redeal-posterior.cjs), rather than introducing another combinatorics library. The caller provides:

- an owner-observable multiset of unresolved registered **physical printing copies**, the number of unknown Prize slots (0–6), and an explicit assertion that all unresolved allocations are equally plausible;
- a bounded choice of alternative plans, each with a unique identifier, up to four unknown target printing names, integer utility if every required printing has an unPrized copy, integer utility if any required printing is exhausted into Prizes, and an integer resource cost;
- an integer cost for the separate hypothetical card search that reveals the Prize composition.

For each vector of target printing Prize counts, the model assigns weight

\[
w(p_1,\ldots,p_k)=\left(\prod_{i=1}^{k}\binom{c_i}{p_i}\right)\binom{N-\sum c_i}{P-\sum p_i}
\]

out of \(\binom NP\) possible physical Prize allocations. Utilities here are **user-supplied hypothetical model units**, not win probabilities. Define \(U(a,\omega)\) as the utility of plan \(a\) in an allocation \(\omega\).

\[
V_{K0}=\max_a \mathbb{E}_{\omega}[U(a,\omega)],\qquad
V_{\mathrm{ideal\ K1}}=\mathbb{E}_{\omega}\left[\max_a U(a,\omega)\right].
\]

The gross information option value is \(V_{\mathrm{ideal\ K1}}-V_{K0}\), which is nonnegative; the reported net value subtracts the caller's information acquisition cost. BigInt numerators and denominators are retained exactly, with decimal diagnostics. An information benefit occurs when the **best plan may depend on Prize outcome**. If the same plan is compulsory in every outcome, the ideal information value is zero in that plan menu.

## Exact toy calculation, deliberately not a source game

Consider **53 unknown physical cards and six unknown Prize slots**, with one critical singleton (illustratively called Thunder), and two future plans:

- target-dependent setup earns +12 hypothetical units if the singleton is outside Prizes and incurs -8 if Prized;
- generic fallback earns +5 in either case.

The target is Prized in 6/53 of uniformly sampled worlds. Without search information, the target-dependent plan has expected utility **516/53 = 9.735849**, beating fallback 5. An ideal information-aware player instead selects fallback exactly in those Prized worlds, attaining **594/53 = 11.207547**. Thus gross information option value is **78/53 = 1.471698** hypothetical units; paying a cost of 2 makes the information-only net negative.

This is an artificial, specified utility menu and unknown inventory, **not** the source rank24 actual hand, a card effect, a calibrated setup success probability, or a game win estimate.

An independent two-target example with four physical unknown cards and one Prize demonstrates the combinatorial joint requirement: a +10 plan needing both A and B versus fallback +4 yields an exact pre-information total of 20/4, post-information 28/4, gross information 8/4, and net 4/4 after cost 1. Two copies of an A target with just one Prize produce zero option value for the same isolated A-vs-fallback menu, because one A must remain available.

## Testing, boundaries and integration

[Six pure Node tests](../../tests/agent4-k0-k1-information-value.test.cjs) passed locally under Node22. A seeded independent brute-force enumerator agreed with the grouped BigInt hypergeometric model in **240 bounded randomized toy tests**, including duplicate printings, zero-Prize cases, varying costs, multiple plans, and up to four target names. The exact committed source Git blob SHA **d17fb4ba3f1fc0b91e7d54a6035eb18d39529568** matched the locally executed module SHA. These tests do **not** validate a pinned-Twinleaf native game; GitHub Actions was not dispatched for this new component.

No perfect-information gain is an unconditional justification for a particular search action. The formula assumes the same future plans remain legally and temporally available after observing K1. It omits card-play restrictions, Supporter contention, opponent responses, Bench capacity, the use or discard of the search card, the chance the actor cannot execute the desired plan, and any benefit of the search effect itself. These quantities can dominate the information term. K0 uniform Prize allocation must be derived from a registered inventory and legitimate owner-observable history, rather than fed actual hidden cards from the simulation.

**Next executable gate:** feed a strictly actor-visible K0 inventory and realistic alternative plans into a costed root sequencer; use the separate [authenticated owner-K1 capture](../als/agent4-owner-k1-prize-knowledge.md) only after native deck search. Reproduce rank24 negative seed 2966203069 and positive 2804067880, then compare a single shared both-seat setup policy on the frozen rank6/rank11 four-arm canonical runner. Keep all failures and legal opponent continuations. This information model alone qualifies no matches.
