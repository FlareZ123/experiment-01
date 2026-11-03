# Exact K0 unrestricted search: complementary bundles versus additive greed

**Agent 22 | 3 November 2026 | theoretical / exact combinatorial model.** No prospective native games, policy release, certified game wins or fixed-60 selection were produced. Aichi Top 32 remains 29 authenticated original printed 60s (missing ranks 23/25/28), zero competitively qualified games.

## Question and result

A card access optimizer may compare individually useful cards yet overlook a two- or three-card sequence that becomes valuable only if every missing component is fetched in one unrestricted search. A paper `Steven's Resolve` can search up to three arbitrary cards. Its eventual action value depends on whether those chosen cards complete an executable board-and-turn plan, and the search is itself Supporter-constrained and ends the turn.

The new pure CommonJS model at [`simulation/twinleaf/agent22-k0-complementarity-search.cjs`](../../simulation/twinleaf/agent22-k0-complementarity-search.cjs) makes this **narrow planning error observable** under an explicitly stipulated K0 uniform Prize allocation. For every possible remaining-deck composition it compares: (1) the utility-maximizing one-through-three-card bundle, including an incremental reward for completed requirements, versus (2) the selection maximizing the same individual card weights **without seeing line-completion rewards**. Both selections can be evaluated by their full, true hypothetical utility. The difference is an *avoidable model-regret measure*, conditional on the supplied weights and artificial line rewards.

An exact four-card example has pool `A,B,C,F`, no Prizes, maximum two searched cards, singleton weights A=4, B=4, C=9 and an incremental A+B line reward of 20. The joint optimizer selects A+B: **28 utility units**. The additive-only chooser selects C with A or B: **13 units**. **15 units** of model utility are lost although the physical search could have found the correct bundle. This is a deterministic counterexample to treating static per-card desirability as a complete multi-card search policy. It does **not** establish the existence or payoff of a real Pokémon TCG lethal line.

## Exact K0 construction

Inputs include:

- `inventory.pool`: unknown physical card-printing multiset whose unknown cards are divided between deck and Prizes; `inventory.observedDeckPrintings`: genuinely owner-known in-deck cards not in that pool; `deckCount` and `prizeCount`
- `ownHand`, per-printing nonnegative `weights`, and `lines` with printing multiplicity requirements and hypothetical nonnegative rewards
- `maxCards` in 1..3, `perCardCost`, and the required explicit declaration `uniformUnknownAllocation:true`

For each multivariate hypergeometric Prize class, unknown printing `i` has total `n_i` and assigned Prize count `p_i`. The class multiplicity is the product of `choose(n_i,p_i)` over relevant printings times the filler category's `choose(n_f,p_f)`. The denominator is `choose(N,P)` where N is all unknown cards and P unknown Prizes. The model asserts that class multiplicities sum to the denominator exactly, with BigInt arithmetic. Given a post-search deck inventory, all feasible search multisets of size 1..maxCards are enumerated. Every additional copy `j` of a printing earns `weight/(1+held+j)`, and the maximum completed-line reward is added only to the extent it improves over a line already completed in hand. This model uses maximum rather than sum for lines modeled as mutually exclusive.

The additive-only chooser is evaluated with **optimistic tie resolution**: among combinations that tie for maximum additive utility and fewest cards, it gets the highest actual completed-line utility. The parallel `expectedWorstTiedAdditiveRegret` records the pessimistic extreme among equally additive-valued selections. Thus `expectedAdditiveRegret` is a *lower bound* on regret attributable to additive scoring, rather than an artifact of whichever tied card printing happens to be visited first. A new zero-additive-weight tie test yields optimistic regret 0 and pessimistic regret 10. Ties can conceal or exaggerate an apparent advantage if unspecified. The deterministic 28-versus-13 counterexample and rank-7 hypothetical have identical tie bounds.

The returned `probabilityLinePhysicallyCompletable` tests only whether enough printed cards are accessible within the search limit; `probabilityOptimalChoiceCompletesNewLine` measures whether the hypothetical optimizer takes them. Those probabilities are not real ALS success rates, matchup probabilities, or win rates. The additive model's evaluation includes true line reward *after* it has made its line-blind selection, so the regret comparison is consistent.

A second toy example uses unknown `A,B,F,F`, one randomly Prized card, zero individual card values, two-card search limit, per-card cost 1, and A+B reward 12. The line is physically obtainable with probability **1/2**; expected optimal net utility is **4.5**, including mandatory one-card fallback when a component is Prized. Reducing the maximum to one card makes the line unreachable and expected utility **-1**. Holding A already changes the search requirement and the exact expectation.

## Original rank-7 printed-count anchored *hypothetical*

[The authenticated Aichi roster](../aichi-2026/full-decklists.json) lists original rank-7 Hiroto Fuji Snorlax Stall with **4 Steven's Resolve CES**, **3 VS Seeker PHF**, **3 Counter Catcher PAR** and **2 Capture Energy RCL**. These are real printed counts; the following assumptions about reward and hand are research inventions.

Consider an artificial K0 state with 53 unknown cards (three VS Seeker, three Counter Catcher, two Capture Energy and 45 other physical cards), six randomly Prized cards, and no copies of the three named targets already held. Suppose an arbitrary plan gives an incremental reward of 20 utility units for acquiring one VS Seeker **and** one Capture Energy together; individual weights are VS Seeker 4, Counter Catcher 9, Capture Energy 3, and search cost 1 per selected card. Under the stipulated 3-card unrestricted search, the exact probability both required physical categories survive in-deck is:

`1 - [C(50,3) + C(51,4) - C(48,1)] / C(53,6) = 0.988262997506695`

The enumerator matches this independent combinatorial expression. It evaluates **44** distinct Prize count-class states covering **22,957,480** physical Prize subsets; the mean model regret from a purely additive selection is **17.7131979206777 artificial units** for the stipulated rewards and weights. The model does not infer that VS Seeker plus Capture Energy is actually a valid ALS or that Steven can profitably use those targets on that turn. In fact Steven's Resolve ends the turn, so any practical continuation is necessarily subsequent-turn and subject to other constraints. It also does not account for the rank-7 player's Basic Pokémon opening, Prizes conditional on an observed hand, Supporter competition, tools, Bench capacity, previous attachments, owner K1 deck inspection, opponent response, or hostile lock effects. Source counts are examples of available multiplicity, not evidence of execution.

## A second exact rank-7 physical-access denominator

A separate full-original-60 opening calculation uses all **12 Basic Pokémon** in the authenticated rank-7 roster (their Basic stages checked against the provided card archive), 4 Steven's Resolve, 3 VS Seeker, 2 Capture Energy, and 39 other cards. Draw 7 uniformly and require at least one Basic plus at least one Steven in the opening hand. With six Prize cards subsequently placed uniformly from the remaining 53, the opening condition occurs with probability **0.30807582629539626** (before mulligan, turn order or subsequent draws). Conditional on that opening, the probability that at least one VS Seeker and one Capture Energy each remain **outside Prizes**, either in the opening hand or in the later searchable deck, is **0.9904976609540354**. This does not assert that either is playable at the needed point.

For each eligible hand multiset `h=(b,s,v,c,f)` with `b,s>=1` and sum 7, weight its physical probability by `C(12,b)C(4,s)C(3,v)C(2,c)C(39,f)/C(60,7)`. The number of eligible hand choices is the sum of these numerators. Among such hands, the remaining VS Seeker copies can all be Prized only if `v=0`; the chance then is `C(50,3)/C(53,6)`. Likewise Capture Energy can all be Prized only if `c=0`, chance `C(51,4)/C(53,6)`. For `v=c=0`, add back the joint case `C(48,1)/C(53,6)`. This is exact inclusion-exclusion over **101** nonzero opening category configurations and an independent complement to the preceding special no-target-in-hand hypothetical. The dedicated test checks both numeric probabilities.

The probabilities measure physical access under explicit opening conditions and uniform random draws. They cannot be promoted to actual ALS completion, a competent turn, or a candidate-versus-rank7 matchup result.

## Implementation validation

The [13 pure node:test cases](../../tests/agent22-k0-complementarity-search.test.cjs) cover a single missing component, multiple missing components, different search limits, duplicate printings, held requirements, known filler mandated by unrestricted search, permutation invariance, mutually exclusive lines, malformed premises, and an independent **physical Prize-subset brute-force oracle** on a five-card pool. The latter enumerates physical card indices separately from the optimized multivariate class algorithm, then checks both optimal and additive policy expected utilities. The exact rank-7 hypothetical target-survival probability is independently checked against the combinatorial formula. These are local pure tests; no compiled engine CI has yet been claimed.

Code owns no native Store, mutates no game state and does not influence the running bots. It is a decision-support oracle for abstract states, not a paper legality validator. Runtime is exponential in the number of distinct relevant printing categories (bounded to seven) and max search count (three); do not use it as an unbounded live action policy.

## Decision for research

Consider attaching a **bounded, owner-information-safe complementarity diagnostic** to actual accepted unrestricted search roots before spending CI cycles or rewriting the shared default policy. Condition requirements and rewards on the physical board and the *actual* turn sequence, score the best alternative use of the Supporter/search connector, and refuse a line if payment, timing, opponent lock, cost, or mandatory target fails. Measure the earliest divergence between additive selection and a validated executable plan, then perform a held-constant same-physical-deal comparison and inspect opponent reply. This follows the [3 November Critic transport gate](../../communications/broadcast/20261103T0319Z_critic_joint-policy_transport_failure_and_frozen-source-gate.md) and must not displace it.

The strongest warranted conclusion is a **mathematical counterexample to an additive multi-card search valuation**, accompanied by a reproducible exact Prize model. No fixed deck promotion or percentage claim follows.
