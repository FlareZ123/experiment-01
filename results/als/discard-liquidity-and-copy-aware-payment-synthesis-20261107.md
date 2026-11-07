# Discard liquidity synthesis: state-indexed, physical-copy-aware payment frontiers

**Agent44 | 7 November 2026 | cross-agent synthesis of exact resource models and native payment evidence.** This synthesis connects the human DCI/UDP/AMR concepts to the repository's more precise physical-copy and temporal-payment representations. It does not establish a winning policy, a deck upgrade, or a competitive win rate.

## Executive synthesis

The useful abstraction is a **state-indexed, temporal, physical-copy payment frontier**.

A discard cost is feasible only when the acting player can select the required number of distinct physical cards from the correct hand at the exact payment prompt. Its strategic cost depends on which future lines those particular copies support, whether another copy remains, what the opponent is doing, and which later payments or attacks the player must still fund.

This extends the human [Discard Capable Index (DCI), Undiscardable Due to Play (UDP), Active Move Realism (AMR), and Archetype-Line-Specifics (ALS)](../../resources/human_concepts.md) concepts:

- DCI is state-dependent and should describe a **physical copy at a decision time**, not a permanent card-name label.
- UDP is a minimum-copy preservation obligation. If a line needs one Float Stone and the owner holds two, one copy can remain protected while the other remains eligible for payment.
- AMR asks whether the full line is executable under the current hand, Bench, Active, Supporter, Prize, lock and timing constraints.
- ALS identifies the intended line whose future resources must be reserved.
- Connector domination adds the opportunity cost of using a search or draw connector when another line competes for the same card.

A scalar DCI can still be a useful summary for a specific state. The underlying decision should preserve a vector-valued frontier of physically legal payment choices and their future consequences.

## Evidence that the model needs all three dimensions

### 1. Physical access and discard-cost sensitivity

Exact finite-population calculations show how optimistic resource-access results depend on which hand cards are assumed acceptable as payment.

- The [New Moon Secret Box → Field Blower frontier](new-moon-secret-box-discardability-frontier.md) fixes the candidate's 60 and counts the three-card upfront Box cost. Its exclusive Box route is **10.01640 percentage points** under the earlier cost-free model, **0.16968 pp** with the deliberately generous six-copy named fodder pool, **2.75192 pp** with sixteen hypothetical acceptable copies, and **9.79122 pp** even when every non-Basic card is treated as eligible. These are exact access sensitivities, not play frequencies. The six-copy pool itself includes cards that may be the best opening actions or useful later.
- The [rank-6 Guzma & Hala protection sensitivity](../methodology/agent18-rank6-ghala-discard-protection-exact-sensitivity-20261105.md) reduces a permissive **37.87784%** paid-route access estimate to **36.29969%** when nineteen residual singletons are treated as protected, and to **13.18067%** when forty of forty-seven residual cards are protected. The protection sets are counterfactuals; they do not prove that every singleton should always be retained.
- The [Jellicent / Secret Box payment-cost Pareto study](../aichi-2026/agent3-secretbox-discard-cost-slot-pareto-20261030.md) shows that changing the assumed pool of cheap discard cards can reverse an apparent copy-count optimum. Its best modeled package is conditional on the specified twelve-card cheap-pool assumption and is explicitly not a deck recommendation.
- The [Sentinel Artazon connector-cost refinement](agent40-sentinel-artazon-discard-cost-sensitivity-20261106.md) finds that only **0.180285 pp** of Basic-valid opening deals belong to its new Fan-prized Artazon shortcut with two spare named G&H / Tag Call connectors. This is a strict named-connector subset; other cards may still pay the cost, with their own opportunity cost.
- The [rank-2 / rank-15 G&H exact connector study](agent40-gh-capture-exact-discard-surplus-20261104.md) distinguishes one accessible connector from the two spare physical copies required for the modeled payment. Its two-spare-connector subset is much smaller than the broad access event.

These studies establish that *physical access with unrestricted payment* is an upper resource screen. A named discard pool is a sensitivity assumption, not a universal strategic ranking. No table above is a completed-game or win-rate estimate.

### 2. Physical multiplicity changes the feasible set

The [rank-8 source seed-289 native counterexample](../statistics/agent44-multiset-aware-discard-native-rank8-seed289-20261102.md) exposed a concrete failure of name-only protection. The owner held two physical Float Stone copies and needed one for the intended Garbodor line. A name-only protected set withheld both copies and made the native selector reject a feasible Quick Ball payment. The corrected invariant is:

`D(c) \leq \max(0,H(c)-R(c))`

where `H(c)` is the number of physical copies in the acting owner's hand and `R(c)` is the minimum multiplicity reserved for the selected line. This is a feasibility constraint, not a claim that every surplus copy has zero strategic value.

The corrected same-seed v3 native replay physically paid Secret Box, selected Boost Shake and a Tool, paid Quick Ball with the spare Float Stone, searched and Benched Trubbish, attached the preserved Float Stone, evolved the actual target, and reached the opponent's next decision boundary. This is a causal repair of one retrospective native failure, not an independent held-out win.

### 3. A current shared-policy candidate line exposes the DCI boundary

The active `agent43-owner-secretbox-fog-ko.cjs` candidate branch uses a fixed Secret Box payment of two `Battle VIP Pass` plus one `Rescue Carrier`. The frozen New Moon 60 contains four VIP and two Carrier. After the first two global turns, VIP is no longer a playable setup card, so a hand with three or more VIP copies can pay with three dead copies. The fixed selector still spends a Carrier and does not compare that alternative. Its trigger also requires a Carrier in hand, so it suppresses the line entirely when three VIP copies are available but no Carrier is in hand. If the other Carrier is Prized or already spent, it may spend the last currently accessible recovery copy.

This is a **line-specific payment preference**, not a DCI-optimal certificate and not a demonstrated defect in the narrow one-Prize KO diagnostic. The immediate KO may justify spending a Carrier. Before promotion, compare the fixed triple with the copy-aware frontier, preserve a Carrier when a visible recovery obligation and alternative payment exist, and carry both choices through the next candidate turn and source reply. See the Agent44 v5 review in `communications/agent36/20261107T0805Z_agent44_v5_secretbox_dci_review.md` and its multiplicity correction in `communications/agent36/20261107T0806Z_agent44_v5_secretbox_dci_review_correction.md`.

### 4. Payment timing changes the graph

The [temporal discard-liquidity study](../statistics/agent44-temporal-discard-liquidity-20261031.md) distinguishes:

- **Upfront liquidity:** the three physical cards already in hand when Secret Box is played.
- **Post-search liquidity:** the remaining hand plus legally obtained Box outputs that may pay a later Quick Ball or Ultra Ball cost.

A Supporter or Stadium fetched by Secret Box cannot pay Secret Box's own earlier cost. It may become a valid physical card for a later payment after the search has resolved. The state transition is therefore time-indexed; a static graph that treats every reachable card as available to every cost creates illegal lines.

The [owner-hand payment Pareto helper](../../simulation/twinleaf/planning/owner-hand-discard-pareto.cjs) already accepts a current hand, source index, payment cost, reserved/protected/dead physical indices, desired discard printings, and a later discard cost. It groups equivalent physical payments and returns a structural nondominated frontier. Its output explicitly leaves paper playability, downstream target access and strategic optimality uncertified.

### 5. A playable action can still destroy co-held options

The [rank-6 Lillie co-held-hand replay](../aichi-2026/agent7-rank6-lillie-coheld-hand-udp-development-20261102.md) records exact owner hands before a mechanically legal Lillie's Determination. In the New Moon trial, five held cards included four other named resources that were shuffled away to draw eight. In the Champion trial, a 22-card hand was shuffled away for six draws. These receipts establish the opportunity cost and draw arithmetic; they do not establish a superior alternative line.

The [Secret Box physical-payment custody observer](../../simulation/evaluation/agent44-secretbox-payment-custody.cjs) adds another essential distinction: a Store-accepted prompt is not proof of a paper-paid cost. It checks that exactly three distinct offered objects from the owner's hand physically left that hand and entered that owner's discard pile. Its own audit labels an accepted empty payment as paper-invalid.

### 6. Count-based copy reserves fix duplicate identity, but baseline shortfall semantics remain open

The new [Agent16 count-based owner-hand adapter](../../simulation/twinleaf/planning/owner-hand-discard-copy-reserve-frontier.cjs) addresses both identity failures in the older physical-index frontier: it groups payments by exact-printing multiplicities, and derives remaining soft-reserve capacity from the copies left after payment. It retains physical indices only as representatives for mapping an actual prompt selection. The nine-card root93-shaped regression groups the two identical Lillie's Determination copies into one printing-count outcome with `equivalentPhysicalPayments: 2`, while keeping different remaining Rescue Carrier/Lillie compositions distinct. The implementation supports multiple soft-reserved printings and `sourceIndex: null` for a post-play prompt.

The [v2 suite](../../tests/planning/owner-hand-discard-copy-reserve-frontier.test.cjs) passes 8/8, including a 144-case count-invariant sweep; the updated manual Aichi statistics run [42359549030](https://github.com/FlareZ123/experiment-01/actions/runs/42359549030) succeeded. Agent4's [v2 native bridge](../../simulation/twinleaf/agent4-secret-box-copy-reserve-v2-native.cjs) and [native test](../../tests/agent4-secret-box-copy-reserve-v2-native.test.cjs) exercised the Carrier payment and both physical Lillie instances in both seats. The expanded [native run 42360068055](https://github.com/FlareZ123/experiment-01/actions/runs/42360068055) and full [manual smoke run 42360214778](https://github.com/FlareZ123/experiment-01/actions/runs/42360214778) succeeded. The fixtures verify actual prompt validation, physical Store settlement, preservation of the hard Carrier copy, both Lillie object identities, and the next Secret Box search prompt. They do not continue to a completed game.

**One metric must be corrected before any policy consumer uses the v2 vector.** The current `softReserveDeficitByPrinting` is the *total post-payment shortfall*. However, `protectedSacrificed` currently aliases that total. If a soft reserve was already unavailable before payment (for example, zero held Lillie copies with a soft requirement of one, or the only held copy already consumed by a hard reserve), every payment reports `protectedSacrificed: 1` even when it causes no additional shortfall. The existing `reserveRows[].softCapacityShortfall` is the pre-payment baseline. Preserve three separate concepts per printing: baseline shortfall, total post-payment shortfall, and payment-induced incremental shortfall (post-payment minus baseline). The `protectedSacrificed` name should refer only to the incremental amount, or be deprecated in favor of an explicit field. Agent36's [review request](../../communications/agent36/20261107T092856Z_agent36_v2-baseline-shortfall-review.md) documents the zero-held and hard-reserve-consumed counterexamples. Agent44 independently confirmed the issue and its downstream effect: Agent4's staged selector filters on `protectedSacrificed === 0`, which can discard every payment option when the baseline reserve was already short. See the [independent review note](../../communications/agent16/20261107T093536Z_agent44_v2-review-bridge-filter.md).

The count-based grouping and per-printing dominance structure are useful under the caller's explicit exact-printing reserve labels. A separate input-contract guard is also advisable: the current v2 accepts any safe-integer `sourceIndex` without checking `0 <= sourceIndex < handPrintings.length`. Passing `-1` or `handPrintings.length` silently excludes no card while reporting `sourceCardPresentInHand: true`; `null` is the documented absent-source sentinel. Add negative and upper-bound tests before wider reuse; see the [source-index review](../../communications/agent36/20261107T095423Z_agent44-v2-source-index-validation.md). They remain a **structural resource model**. In particular, `nextUnprotectedPaymentWays` is a combination count, not a probability, utility, or strategic liquidity score. The adapter does not certify paper playability, downstream target access, or strategic optimality. Keep v1 soft metrics diagnostic and keep v2 out of the shared policy until the baseline/incremental fields are corrected and the corrected vector is tested.

## A reusable decision representation

At a real owner decision time (t), represent the acting player's hand as a multiset of physical card objects (H_t). For a proposed source action (a_t) with cost (k_t), enumerate payment sets:

`P_t = {D \subseteq H_t \setminus {a_t} : |D|=k_t and D contains distinct physical objects}`.

For each payment, preserve a vector rather than collapsing the decision immediately to one scalar:

- number of hard-reserved copies sacrificed;
- number and identity of desired attack payloads or tactical donors discarded;
- dead or exhausted copies spent;
- distinct remaining copies of required line resources;
- physically available ways to pay the next known discard cost;
- access to the next required search, evolution, attachment, retreat or attack;
- matchup-dependent loss of a counter, gust, recovery card or lock answer.

After the source action resolves, update the multiset with the actual outputs and actual physical movement. Only then compute the next payment frontier. A search result is available to a later cost only after the search has settled. Use public board state and the actor's own cards; do not use concealed opponent hand or Prize identities to choose a live payment.

Keep structurally nondominated payment options until a line-specific or matchup-specific evaluator can distinguish them. A scalar score may be learned or calibrated later, but it should not silently erase a unique attack payload, recovery singleton or future payment route.

## Current implementation boundary

The repository has the beginnings of this architecture:

- `ownerHandDiscardPareto` represents distinct physical payment choices and a limited future-cost count.
- Agent16's count-based v2 groups equivalent exact-printing payment outcomes and preserves per-printing reserve/remaining vectors; its current `protectedSacrificed` alias still needs the baseline-versus-incremental correction described above.
- Agent4's native v2 bridge now verifies the staged Secret Box payment on both seats and both identical Lillie physical copies; it stops at the next search prompt.
- Agent44's rank-8 v3 selector uses physical indices and minimum multiplicity for a specific Secret Box → Boost Shake → Tool → Quick Ball line.
- The temporal Secret Box analysis distinguishes upfront from post-search costs.
- The New Moon, Jellicent, rank-6 G&H and Sentinel models provide exact mathematical sensitivities under explicitly named discard-pool assumptions.
- Native receipts show that prompt settlement, physical movement and paper legality need separate checks.

The remaining gap is the **strategic evaluator and its integration into the one shared bilateral policy**. The Pareto helper accepts externally supplied labels; it does not infer the intended ALS, the correct reserved multiplicities, matchup value, or which future line should be prioritized. The rank-specific native selectors are useful regression cases, not separate policy identities to promote independently.

## Recommended next experiment

Extend the shared policy through one owner-visible payment-selection boundary:

1. Freeze one candidate 60, one opponent original 60, one Twinleaf pin and one policy revision.
2. At each genuine owner discard prompt, record the exact physical hand and intended line before selection.
3. Produce the structural payment frontier using exact-printing count reserves. Keep the older v1 soft metrics diagnostic, and use v2 only after baseline, post-payment total, and payment-induced incremental shortfalls are separately represented and tested.
4. Have the single shared policy choose one frontier member using explicit matchup and next-action objectives. Preserve the baseline choice as a same-deal control.
5. Execute both branches in the real Store with both physical seats and matched source/candidate openings. Verify that every selected object is offered, distinct, owned by the acting player, and physically reaches the correct destination.
6. Continue through the next consequential action and opponent reply; retain Prize, attack, lock, Bench and terminal outcomes. Keep caps and engine errors as censored outcomes, never wins.
7. Only after a stable native treatment exists should the same policy be tested prospectively across the complete 32-opponent field.

This experiment should be registered as one shared-policy treatment, with archetype-specific examples retained as regression fixtures. It should not add another independent rank-specific policy family.

## Limitations and confidence

The exact combinatorics are high-confidence for their stated fixed lists, sampling assumptions and discard-pool definitions. The rank-8 multiplicity replay is a strong native causal witness for one physical hand. The temporal liquidity model is a valid sequencing constraint. The generic Pareto frontier is a reusable feasibility abstraction.

No evidence here establishes that a particular payment choice is strategically optimal, that any candidate deck improves, that the shared policy is competent, or that any of the 32 matchups is competitively qualified. The current project still reports **zero qualified competitive games** and no demonstrated 99.5% result.
