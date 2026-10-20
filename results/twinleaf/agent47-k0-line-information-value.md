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

### Previously authenticated deck printings

A follow-up implementation now accepts optional `observedDeckPrintings`. These must already have been learned through a legitimate actor-own observation *while the deck remains otherwise K0*, such as a previously revealed top card that is still known to be in deck. They count as **guaranteed deck copies** for each line, independent of the unresolved uniformly allocated Prize slots. The [existing owner-only K0 physical inventory](../../simulation/twinleaf/owner-k0-observable-inventory.cjs) already returns this field after physically subtracting known copies from the unresolved pool, so the frontier can directly consume the same two fields without counting a known printing twice.

The new regression covers a guaranteed held-in-deck A printing, and uncertain B/C (one unobserved Prize). The invented A line pays +8 deterministically; B pays +20 if available, -20 otherwise. Thus K0 chooses A for **8**, while idealized K1 chooses B in the one case where B survives and A otherwise, for **14**. Information value is **6 units**. Without any authenticated known A printing, the same unresolved B/C pool produces a different physical problem, and A must not be treated as reachable. Further tests cover duplicate known printing requirements, empty unknown populations and malformed observations. [Manual statistics CI 39389266609](https://github.com/FlareZ123/experiment-01/actions/runs/39389266609) **passed** at code/test head `91af42a38d98370c0c181bd70100da48bb95e340`. The non-overlap and provenance of the known deck subset still require caller authentication.

## Connector contention and signed value of acquiring information

The model now accepts `observationCost` (a fixed nonnegative integer utility payment) and `postObservationPlanIds` (the subset of initially named lines still available after spending the information-gathering action). The original **free unrestricted K1 information upper bound** remains reported separately. The additional signed calculation is

```text
restricted post-search utility = E[max(0, available U_l(j) with l in allowed post-search ids)]
net observation utility         = restricted post-search utility - fixed observationCost
net observation advantage       = net observation utility - K0 best-commitment utility
```

The model reports `modelPrefersObservation` only when the last number is strictly positive. The action may have **negative signed value** even when the free-information gain is positive. This is a bounded abstraction of resource and Supporter contention, not a complete representation of a turn's legal sequencing.

A controlled two-card toy example, with one of A/B Prized, compares a risk-taking plan worth +10 if A is in deck and -20 otherwise with a guaranteed +3 fallback. K0 rationally chooses the safe **3**. Free K1 information would give **6.5**, an advantage of **3.5**. An information action costing 2 utility still leaves **4.5** and a +1.5 net advantage **if the safe line remains available**. If obtaining the information instead consumes the connector needed for the safe line, and has fixed cost 3, only the risk-taking plan remains; its restricted after-search expectation is **5**, net **2**, a **-1** advantage to searching. The positive 3.5 free-information value remains mathematically correct in that same case, illustrating why access alone is insufficient for a strategically good action.

The cost and post-search plan menu must be **substantiated by the actual hand, board, game rules and card text** before using this as a recommendation. Treating every lost option as a fixed globally removed ID can itself be overly coarse when actions compete conditionally. These numbers are invented only as a test of the model.

[Manual CI 39390235867](https://github.com/FlareZ123/experiment-01/actions/runs/39390235867) **passed** on code/test head `3e92542f819d5022d11313da02cf2897356ddb42`, including **160 randomized independent physical Prize enumerations with nontrivial modeled observation costs and restricted menus**, positive/negative controls, and exact rank24 printed roster. Its two preceding failed CI attempts were assertion-message ordering issues and are retained in the workflow history; the independently enumerated numerical cases passed even in those attempts. This checks code arithmetic, not native Twinleaf compatibility or observed turn choices.

## Explicit hypothetical worked case, not a rank-24 game estimate

Suppose two different singleton printed resources `A` and `B` are unknown among 60 cards, six are Prized, and one of two mutually exclusive plans must be chosen. Each plan has *invented* +10 utility if its resource is in deck and -10 if missing; passing has zero.

- K0 selects either plan with expected value **8**.
- After a genuine unrestricted owner-deck inspection, the player could select whichever singleton remains. Both are Prized with probability **1/118**, so the idealized K1 expected value is **585/59 ≈ 9.915254**.
- The **information upper bound** under these exact invented payoffs and unchanged menu of actions is **113/59 ≈ 1.915254 utility units**.

No real card is claimed to have these utilities, and no real game promises this knowledge was gained at zero cost. The example shows why a static utility estimate of an individually playable line can undervalue learning the deck before committing the sole Supporter.

## Published rank-24 source-printing control

The [additional source-identity regression](../../tests/k0-line-information-source-printings.test.cjs) uses **the actual published 60 physical printings** for Aichi rank 24 Ryoya Fujii. Both **Thunder Mountain ♢ LOT 191** and **Wondrous Labyrinth ♢ TEU 158** occur as separate singleton Stadium cards. Conditional on a deliberately **hypothetical** visibly held Tag Call, Iron Thorns ex and Double Colorless Energy, the K0 unknown pool is 57 printings with six unknown Prizes.

Assigning the same *invented* +10/-10 utility to merely accessing either one of those distinct Stadium printings yields K0 best-plan expectation **150/19 ≈ 7.894737**, after-search idealized expectation **≈ 9.906015**, and information upper bound **≈ 2.011278 units**. This supports physical-printing arithmetic and joint Prize enumeration for a real sourced roster. It **does not** imply the two Stadiums have equivalent game effects, that both can enable Volt Cyclone, that those three held cards occurred in any historical source game, or that a particular alternative Supporter was legally optimal at seed 2966203069.

## Verification and next bridge

Seven Node tests include 160 deterministic independently brute-enumerated labelled-card toy instances with varying 3–8-card multiset pools, 0–3 unknown Prize slots, random duplicate prerequisites, utilities and 2–4 exclusive plans. Regression coverage also includes the 60-card exact two-singleton case, an always-available safe alternative, zero information gap, two-copy joint requirement and impossibility/no-op handling.

The test is in the **existing manually dispatched** Aichi statistics workflow; no workflow triggered on pushes and no Twinleaf vendor modifications. [Manual CI run 39387833796](https://github.com/FlareZ123/experiment-01/actions/runs/39387833796) **passed** at head `81363b0608fbdd3aa8cd1cb7a4ae8a1bdb4cfe20` on 20 October 07:39 UTC, including the new 160-case test and the other existing manual workflow jobs. This is Node-pure mathematical validation, not a compiled Twinleaf Store match or strategic win claim.

**Proposed actor-safe canonical bridge:** use the actual original candidate K0 owner inventory to parameterize a small, printed-card-supported **legal** candidate-action menu. The same actor-observable K0 state must yield the same recommendation across hidden Prize swaps. Only after a legitimate owner-deck search should K1 membership change the choice; then audit the actual Store-supported action, both-player legality, following attack and source turn. Explicitly subtract search/payment opportunity costs and account for owner-visible hand cards not in the unknown pool. Keep both the baseline old-policy 260-root rank-6 censor and every failed attempt.

**Limitations:** Approximate utilities are exogenous and may be a poor approximation to playing strength. It assumes the actor's remaining deck versus Prize unknowns are exchangeable, and the K0 and K1 menus are identical apart from knowledge. It ignores timing, delayed setup, Player state transitions, opposing hidden-hand effects, attacker costs, search-via-deck top-order asymmetry and paper Expanded bans/clock. Do not use its numbers as a simulator-derived win probability.

**Whole-project qualification:** 29 of 32 sourced exact opponent 60s, zero competitively qualified games, no supported 99.5% claim.
