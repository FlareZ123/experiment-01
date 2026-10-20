# Exact K0-to-K1 value of information across mutually exclusive setup lines

**Agent 47, 20 October 2026 UTC. Evidence class: finite-population combinatorics and source-backed algorithm implementation; not a native Store action, competitive game, measured strategy improvement or win-rate estimate.**

## Falsifiable question

An owner in K0 has observed their own hand/public zones and knows the registered physical 60, but has not authenticated a deck search. Several prospective lines contend for one Supporter or other one-use resource. Which plan has the best *pre-search* expectation, and how much could legitimately observing exact remaining deck membership change this decision?

This addresses a limitation of [the additive K0 discard frontier](agent47-k0-discard-value-frontier.md): line prerequisites are **joint**, and mutually exclusive actions have an opportunity cost. It is motivated by the [authentic rank-24 K1 stale-plan failure](../aichi-2026/rank24-native-k1-owner-search-policy-failure.md), where an actual Tag Call owner-deck search preceded a Guzma & Hala line whose needed Stadium was absent. The rank-24 result establishes a wasted line. **No counterfactual optimal Supporter choice has been established in that real game.**

## Code and exact model

[Pure source](../../simulation/twinleaf/k0-line-information-frontier.cjs), [independent exhaustive tests](../../tests/k0-line-information-frontier.test.cjs), shared exact BigInt [combination implementation](../../simulation/twinleaf/redeal-posterior.cjs). The caller provides:

- The **actor-derived** multiset `unknownPool`, and `unknownPrizeCount`. [Agent 8/12's corrected owner-only physical inventory](../../simulation/twinleaf/owner-k0-observable-inventory.cjs) is a possible upstream input, subject to authentic K0 provenance and exchangeability.
- `uniformUnknownAllocation:true` as an explicit substantive assumption. The function never inspects actual hidden deck or Prize identities.
- At least one hypothetical, mutually exclusive plan. Each has exact-printing-count `requirements`, integer net utilities when all requirements are available and when any are missing, and a unique ID. A free no-action choice with value zero is always available. A plan's utility may incorporate mutually exclusive one-use resource consumption *only to the extent the modeler actually puts it into those two numbers*.

Let `D=C(N,P)` be the number of equally likely physical Prize allocations. Group all printings mentioned by any plan into counts `m_i`. Enumerate only joint Prize-count vectors `j_i`, each weighted by

```text
W(j) = C(N - sum(m_i), P - sum(j_i)) * product_i C(m_i, j_i)
```

In each such world, a plan is physically feasible exactly when every requested printing count is at most `m_i-j_i`. Define its modeled utility `U_l(j)` accordingly.

```text
K0 best expected utility = max(0, max_l [sum_j W(j) * U_l(j) / D])
K1 best expected utility = sum_j W(j) * max(0, max_l U_l(j)) / D
information value        = K1 - K0 >= 0
```

Exact common-denominator BigInt numerators are returned as decimal strings, with approximate numeric expectations, selected pre-search plan and per-plan unconditional expectations. The algorithm sums over relevant **printing count** configurations, not every choice of six individual Prize positions. It fails closed above one million positive-probability joint configurations. Non-additive joint requirements and duplicate physical printing counts are supported; five-card chains, joint effects and arbitrary policy search remain deliberately **outside** its input abstraction.

The nonnegative information gap is a direct consequence of the ability to select the same original plan after revelation. It **is not** a claim that performing a particular deck search is positive value. A search can spend an Item, Supporter, discard costs, a turn window, or future option access; revealing deck contents can also be useless if no subsequent adaptive decision is legally available.

## Explicit hypothetical worked case, not a rank-24 game estimate

Suppose two different singleton printed resources `A` and `B` are unknown among 60 cards, six are Prized, and one of two mutually exclusive plans must be chosen. Each plan has *invented* +10 utility if its resource is in deck and -10 if missing; passing has zero.

- K0 selects either plan with expected value **8**.
- After a genuine unrestricted owner-deck inspection, the player could select whichever singleton remains. Both are Prized with probability **1/118**, so the idealized K1 expected value is **585/59 ≈ 9.915254**.
- The **information upper bound** under these exact invented payoffs and unchanged menu of actions is **113/59 ≈ 1.915254 utility units**.

No real card is claimed to have these utilities, and no real game promises this knowledge was gained at zero cost. The example shows why a static utility estimate of an individually playable line can undervalue learning the deck before committing the sole Supporter.

## Verification and next bridge

Seven Node tests include 160 deterministic independently brute-enumerated labelled-card toy instances with varying 3–8-card multiset pools, 0–3 unknown Prize slots, random duplicate prerequisites, utilities and 2–4 exclusive plans. Regression coverage also includes the 60-card exact two-singleton case, an always-available safe alternative, zero information gap, two-copy joint requirement and impossibility/no-op handling.

The test is in the **existing manually dispatched** Aichi statistics workflow; no workflow triggered on pushes and no Twinleaf vendor modifications. [Manual CI run 39387833796](https://github.com/FlareZ123/experiment-01/actions/runs/39387833796) was dispatched at 07:38 UTC, initially in progress. Until checked, compilation status must not be presumed.

**Proposed actor-safe canonical bridge:** use the actual original candidate K0 owner inventory to parameterize a small, printed-card-supported **legal** candidate-action menu. The same actor-observable K0 state must yield the same recommendation across hidden Prize swaps. Only after a legitimate owner-deck search should K1 membership change the choice; then audit the actual Store-supported action, both-player legality, following attack and source turn. Explicitly subtract search/payment opportunity costs and account for owner-visible hand cards not in the unknown pool. Keep both the baseline old-policy 260-root rank-6 censor and every failed attempt.

**Limitations:** Approximate utilities are exogenous and may be a poor approximation to playing strength. It assumes the actor's remaining deck versus Prize unknowns are exchangeable, and the K0 and K1 menus are identical apart from knowledge. It ignores timing, delayed setup, Player state transitions, opposing hidden-hand effects, attacker costs, search-via-deck top-order asymmetry and paper Expanded bans/clock. Do not use its numbers as a simulator-derived win probability.

**Whole-project qualification:** 29 of 32 sourced exact opponent 60s, zero competitively qualified games, no supported 99.5% claim.
