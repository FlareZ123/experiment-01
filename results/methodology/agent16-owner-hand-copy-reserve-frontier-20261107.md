# Agent16: explicit physical-copy reserves for owner-hand payment frontiers

**7 November 2026 UTC.** Pure owner-hand combinatorics and adapter tests. No Twinleaf Store execution, no full game, and no competitive qualification.

## Question

The human concept notes distinguish state-dependent discardability (DCI), cards that should be preserved for a planned line (UDP), and actions that are technically available but not realistically payable (AMR). The existing `ownerHandDiscardPareto` helper enumerates physical payment combinations and exposes a structural frontier, but each caller must translate its intended future line into physical hand indices.

Can that copy-reserve translation be made reusable while keeping strategic judgments explicit and preserving the existing helper's evidence limits?

## Implementation

Added [`owner-hand-discard-reserve.cjs`](../../simulation/twinleaf/planning/owner-hand-discard-reserve.cjs), a small adapter over [`owner-hand-discard-pareto.cjs`](../../simulation/twinleaf/planning/owner-hand-discard-pareto.cjs).

The caller supplies the exact ordered owner hand, an optional source-card index, the immediate discard cost, and two exact-printing count maps. The source index may be `null` when the native prompt is observed after the source Trainer has already left the hand; the adapter then excludes an internal sentinel from the core helper and normalizes all returned indices to the actual physical hand. The result is the existing helper's structural frontier under the supplied role labels, not a guarantee that unlabelled cards are strategically interchangeable:

- `hardMinimumCopiesByPrinting`: copies that must remain after the source card is played. The adapter maps these to hard-reserved physical indices, which cannot pay.
- `softAdditionalCopiesByPrinting`: additional copies preferred for retention. The adapter maps these to protected physical indices, which remain eligible to pay and are counted as protected sacrifices in the frontier. Soft counts are additive to hard counts for the same printing.

The adapter also accepts caller-supplied dead and desired-discard printings and one next-hand discard cost. It returns physical indices, per-printing availability and shortfalls, the underlying frontier, and explicit false flags for paper playability, downstream target access, and strategic optimality. It does not infer whether a card is dead, whether a future line is needed, or which payment is best.

The source index is excluded from reserve counts because that physical card is being played now. If a hard reserve cannot be met, the adapter reports the shortfall while retaining the raw mechanical payment result. A soft-reserve shortfall is reported separately and does not veto a payment.

## Root93-shaped illustration

The test uses the ten-card owner-hand contents documented in [Agent21's DCI report](agent21-secret-box-discard-cost-index-20261107.md), in a fixed fixture order:

`[VIP, Secret Box, Carrier, VIP, Carrier, Lillie, Lillie, Powerglass, Forest Seal Stone, Mysterious Treasure]`

For illustration only, the caller declares one Rescue Carrier as a hard reserve, one Lillie's Determination as a soft reserve, both Battle VIP Pass copies dead, and a hypothetical next discard cost of two. These are explicit test assumptions, not claims that the historical game required those reserves.

The resulting reserve indices are hard Carrier `[2]` and soft Lillie `[5]`. The current structural frontier contains two non-dominated groups:

| Representative payment | Protected copies sacrificed | Dead VIP copies spent | Unprotected next-payment combinations |
|---|---:|---:|---:|
| VIP + VIP + Carrier | 0 | 2 | 6 |
| VIP + VIP + Lillie | 1 | 2 | 10 |

The first group represents five physical payments equivalent under the supplied vector; the second represents one. The second choice spends the soft Lillie reserve while retaining the hard Carrier reserve, increasing the helper's count of future combinations. The values 6 and 10 are combinations of unprotected remaining hand cards, not probabilities or proof that a future Trainer is legally playable.

This representation preserves the two alternatives without assigning DCI weights. It complements [Agent21's ordinal DCI selector](../../simulation/twinleaf/agent21-secret-box-dci-payment.cjs) and [Agent44's discard-liquidity synthesis](../als/discard-liquidity-and-copy-aware-payment-synthesis-20261107.md). It does not validate either selector's strategic ranking.

## Important limitation discovered in the underlying frontier

A synthetic counterexample exposed a grouping limitation in the existing Pareto helper. With one soft reserve each for Carrier and Lillie, the payments VIP + VIP + Carrier and VIP + VIP + Lillie can have identical scalar coordinates:

- `protectedSacrificed = 1`
- `deadCardsSpent = 2`
- `nextUnprotectedPaymentWays = 1`

The current grouping key does not retain the exact printing of a protected card sacrificed. It can therefore merge these two payments and keep only one representative, despite their different remaining printing multiplicities.

I sent this counterexample and a proposed additive fix to Agent44. The proposed core change is a sorted `protectedSacrificedByPrinting` vector in the grouping key and componentwise dominance, while retaining the scalar for compatibility. Until that is reviewed, adapter v1 **fails closed when more than one exact printing has a nonzero soft reserve**. Multiple hard reserves remain supported. This restriction prevents the adapter from presenting the current grouped frontier as complete across distinct soft-reserve roles.

A further future extension may need desired-discard multiplicities as well as distinct desired-printing sets. The current adapter deliberately does not change the shared Pareto implementation.

## Validation

- Runtime: Node v22.16.0.
- Local tests: **14/14 passed**.
- Coverage includes hard and soft reserve mapping, additive hard/soft counts for one printing, source-card exclusion, explicit hard shortfalls, non-vetoing soft shortfalls, future unprotected payment counts, the root93-shaped fixture, the multi-soft-printing fail-closed guard, input immutability, invalid inputs, and a deterministic 144-case small-domain invariant sweep.
- The existing core Pareto regression is also wired into the repository's existing manual [Aichi benchmark statistics workflow](../../.github/workflows/aichi-benchmark-stats.yml), alongside the new adapter test. No new workflow or push-triggered CI was introduced.
- Manual GitHub Actions run [42356996900](https://github.com/FlareZ123/experiment-01/actions/runs/42356996900) succeeded on head `50ee0e2` with the original 12 adapter tests. Follow-up run [42357346860](https://github.com/FlareZ123/experiment-01/actions/runs/42357346860) also succeeded: repository-wide preflight passed, and the Agent16 step passed with the 13th test for multiple hard printing reserves. The 14th test adds post-play prompt hands where the source card is already absent; it passes locally and awaits a fresh manual CI run. The prior run [42356811491](https://github.com/FlareZ123/experiment-01/actions/runs/42356811491) failed before the Agent16 step because two other workflows had prohibited push triggers; only those trigger blocks were removed, retaining `workflow_dispatch`.
- The repository's pinned Twinleaf submodule remains `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This pure adapter did not invoke Twinleaf or alter the submodule.

## Limits and next work

This is a resource-label adapter, not a card-strength model. It does not inspect deck or Prize identities, opponent hidden information, K0/K1 provenance, card text, target availability, Bench capacity, Item/Tool/Supporter locks, prompt validation, native action acceptance, or opponent responses. The caller must aggregate simultaneous line obligations and choose which alternative line is being evaluated. The single `nextHandDiscardCost` remains a coarse structural count and does not model a multi-stage future plan.

Next steps:

1. Obtain Agent44's review of the protected-printing identity limitation. If approved, extend the shared Pareto vector and remove the one-soft-printing guard with a dedicated regression.
2. Have the shared policy steward decide whether this adapter belongs at the native owner-hand selector boundary. Keep it default-off until the caller supplies line-specific roles and the actual prompt's physical cards.
3. Compare candidate payment choices on fresh, matched physical deals with the real Store validator and a meaningful source response. Preserve no-target, prompt, and response failures.
4. Do not promote this local tactical line or any DCI score into deck-strength or win-rate evidence.

The overall objective remains unmet: 29/32 original Aichi source lists are authenticated, no final fixed 60-card deck is selected, and competitively qualified games remain zero. No 99.5% result is claimed.
