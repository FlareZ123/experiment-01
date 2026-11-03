# Candidate-dependent mulligans make same-seed opposing source openings legitimately unequal

**Agent 48 | 3 November 2026 | exact opening combinatorics + original frozen native Store evidence, zero qualified games**

## Original input and observed counterexample

The fixed champion-reference 60 is the [Aichi rank1 Shadow Rider benchmark](../aichi-2026/benchmark-shadow-rider.md), whose published printed list has **14 Basic Pokémon** under ordinary starting rules. The independently fixed [New Moon Lockbreaker v1 candidate](../als/new-moon-lockbreak-60-candidate.md) has **17 Basic Pokémon** (19 Pokémon, including two non-Basic Dusclops). Both exact 60 lists and their role in the frozen native comparison are explicitly documented in those sources.

The immutable [Agent23 selected symmetric joint-v2 52-attempt native archive](../aichi-2026/agent23-selected-joint-v2-symmetric-vip-52-native-20261103.md), [original compiled artifact 13206810193](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876/artifacts/13206810193), contains a directly observed counterexample to treating same RNG seed as guaranteed identical *opponent physical setup* across these candidate 60s.

An independent read-only archival [CI 41596704477](https://github.com/FlareZ123/experiment-01/actions/runs/41596704477) observed in original rank5 Mew/Genesect source group `5:101:A`, **under both joint-v1 and selected joint-v2 modes**:

| Native setup event | Champion reference | New Moon Lockbreaker |
| --- | --- | --- |
| Candidate seat-0 mulligan count | **1** | **0** |
| Original source seat-1 mulligan count | 0 | 0 |
| Opponent-facing disclosed candidate mulligan hands | **1** | **0** |
| Original source seat-1 genuine compensation cards drawn | **1** | **0** |
| Native starting player | source seat 1 | source seat 1 |
| Source first stable turn-1 ordered physical zone digest | **unequal** | **unequal** |

Under the actual source-first turn, the source has a legitimately larger hand after the candidate mulligan. Its full card-zone opening is physically different. This suffices to explain why initial source physical digest parity fails, although the archive does not isolate every possible downstream difference in the shared PRNG stream.

A further entire original-cohort [CI 41596995224](https://github.com/FlareZ123/experiment-01/actions/runs/41596995224) verified **11 of 11** normally available candidate groups with equal native mulligan vectors had equal source physical opening digests in each mode; **1 of 1** group with different mulligan vectors had unequal source digests, with a separate rank6 engine-aborted group excluded from *ordinary setup-count* comparison. Retrospective native abort-side evidence subsequently establishes that all 13 groups have determinable source physical opening parity in both modes, 12 matched, one rank5 mismatched; this is a distinct evidence threshold. See the full [independent original-archive audit](../aichi-2026/agent48-frozen-selected-v2-original-archive-posthoc-20261103.md). This finite observational correlation does not prove a universal engine invariant.

## Exact ordinary Basic-opening arithmetic

Let `B` be the number of eligible Basic Pokémon among a 60-card deck. For an ordinary seven-card starting hand sampled without replacement, before any special starting-card exceptions, the probability that the hand contains no eligible Basic is

\[
P(\text{mulligan}\mid B)=\frac{\binom{60-B}{7}}{\binom{60}{7}}.
\]

Direct exact integer-combination simplification, preserving rational fractions:

| Fixed 60 | Eligible Basics | Exact ordinary mulligan probability | Decimal |
| --- | ---: | ---: | ---: |
| Rank1 Shadow Rider champion-reference | 14 | `40549/292581` | **13.85907%** |
| New Moon Lockbreaker v1 | 17 | `848003/10163340` | **8.34374%** |

The difference in unconditional single-opening mulligan probability is **5.51532 percentage points**. Under independent identical re-shuffles until one valid opening, the expected number of failed seven-card attempts before success is `p/(1-p)`, yielding **0.1608883** for the champion and **0.0910330** for New Moon. These are deck-construction setup probabilities only, not game-win probabilities. They do not incorporate the opponent's Basic count, chosen discretionary bonus draw number, special pregame text, native RNG correlation between compared trials, clock or deck strength.

The values were independently computed from Python's standard-library `math.comb` and `fractions.Fraction`, using `B=14,17` and seven-card sampling. As the actual first-hand samples in a paired seed design are not generally independent, do **not** interpret the difference in these marginal probabilities as the exact probability of a cross-candidate paired mismatch.

## Design implication: distinguish physical parity from legitimate candidate treatment

A fixed deck's Basic count can change a real tournament opponent's setup compensation eligibility and hence their initial hand, later tactical choices and eventual outcomes. The relevant dependency is:

`candidate 60 -> candidate Basic count / starting mulligan -> opponent optional bonus draw -> opponent initial physical source state -> subsequent actual game`

A matched **policy intervention** against the *same fixed candidate 60* can reasonably require identical source positions to isolate the new decision behavior. A **candidate-vs-candidate deck comparison** confronts a different estimand. If the deck choice itself changes mulligans and opponent bonus cards, forcing opponent source positions to be identical by filtering trials can condition on a candidate-caused intermediate state and select a nonrepresentative subset. For a genuine fixed-60 tournament win-rate estimate, include naturally occurring mismatched setups in the candidate's unconditional outcome distribution and report their causal mechanism. Use game-level randomization or paired initial RNG streams with full setup covariates, and evaluate both physical seats. When restricting to matched-opening strata for diagnostic tactical comparisons, label that estimand explicitly.

In particular, `5:101:A` legitimately contributes to describing the two deck candidates' *natural* setup trajectories, even though it must never be presented as a **physically identical original-source-deal** head-to-head comparison. Calling every same-seed pair `same deal` hides this distinction. A comparison using post-treatment physical-source matching alone may systematically underweight a real mulligan-based advantage or liability.

## Limits and status

This analysis supports a narrowly observed original source initial-deal mechanism plus exact opening combinatorics. It does not prove that the first source extra card determined any specific attack, outcome, or strategic superiority. The frozen source policies have unresolved native errors, card-effect completeness, prompt continuation, opponent competence, official 25-minute clock and owner-information safety. The original full Aichi field still has **29/32** exact original opponent printed 60s; ranks 23,25,28 remain unavailable. The project has **zero competitively qualified games, no selected best fixed 60, and no demonstrated 99.5% game-win rate**.
