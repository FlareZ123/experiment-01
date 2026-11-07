# Agent16: explicit physical-copy reserves for owner-hand payment frontiers

**7 November 2026 UTC.** Pure owner-hand combinatorics and adapter tests. No Twinleaf Store execution, no full game, and no competitive qualification.

## Question

The human concept notes distinguish state-dependent discardability (DCI), cards that should be preserved for a planned line (UDP), and actions that are technically available but not realistically payable (AMR). The existing `ownerHandDiscardPareto` helper enumerates physical payment combinations and exposes a structural frontier, but each caller must translate its intended future line into physical hand indices.

Can that copy-reserve translation be made reusable while keeping strategic judgments explicit and preserving the existing helper's evidence limits?

## Implementation

Added [`owner-hand-discard-reserve.cjs`](../../simulation/twinleaf/planning/owner-hand-discard-reserve.cjs), a small adapter over [`owner-hand-discard-pareto.cjs`](../../simulation/twinleaf/planning/owner-hand-discard-pareto.cjs).

The caller supplies the exact ordered owner hand, an optional source-card index, the immediate discard cost, and two exact-printing count maps. The source index may be `null` when the native prompt is observed after the source Trainer has already left the hand; the adapter then excludes an internal sentinel from the core helper and normalizes all returned indices to the actual physical hand. The result is the existing helper's structural frontier under the supplied role labels, not a guarantee that unlabelled cards are strategically interchangeable:

- `hardMinimumCopiesByPrinting`: copies that must remain after the source card is played. The adapter maps these to hard-reserved physical indices, which cannot pay. Because only the count is strategic, choosing a deterministic physical representative does not change the remaining printing multiplicities.
- `softAdditionalCopiesByPrinting`: additional copies preferred for retention. **In v1 these are mapped to deterministic physical protected indices only. This is an index-level diagnostic proxy, not a count-based soft reserve.** The core helper treats spending the marked object as a sacrifice even when an identical copy remains, so the resulting soft-sacrifice and future-way coordinates are not invariant under swapping identical copies. The output explicitly sets `softReserveCopyInvariant: false` and `softReserveCountSemanticsCertified: false`.

The adapter also accepts caller-supplied dead and desired-discard printings and one next-hand discard cost. It returns physical indices, per-printing availability and shortfalls, the underlying frontier, and explicit false flags for paper playability, downstream target access, and strategic optimality. It does not infer whether a card is dead, whether a future line is needed, or which payment is best.

The source index is excluded from reserve counts because that physical card is being played now. If a hard reserve cannot be met, the adapter reports the shortfall while retaining the raw mechanical payment result. A soft-reserve shortfall is reported separately and does not veto a payment.

## Root93-shaped identity counterexample

The post-play native prompt fixture contains nine cards in this fixed order:

`[VIP, Carrier, VIP, Carrier, Lillie, Lillie, Powerglass, Forest Seal Stone, Mysterious Treasure]`

For illustration, the caller declares one Rescue Carrier as a hard reserve, one Lillie's Determination as a soft reserve, both Battle VIP Pass copies dead, and a hypothetical next discard cost of two. The adapter marks Carrier index `[1]` hard-reserved and Lillie index `[4]` soft-protected. These are test labels, not claims that the historical game required those reserves.

Under this physical-index proxy, the existing core returns two representative groups:

| Representative payment | Current protected-index count | Current future combinations | Physical combinations sharing the vector |
|---|---:|---:|---:|
| VIP + VIP + Carrier (indices 0,2,3) | 0 | 6 | 5 |
| VIP + VIP + Lillie (indices 0,2,4) | 1 | 10 | 1 |

**These are not two validated strategic reserve outcomes.** The first five-member group includes the payment VIP + VIP + the *other* Lillie copy at index `[5]`, while the second group uses the arbitrarily marked Lillie at index `[4]`. Both Lillie payments discard one Lillie printing and leave one identical Lillie printing. Their printing-level remaining counts are the same, but the v1 vector assigns different sacrifice and future-way values solely because one physical index was marked protected.

Agent4's native fixture identifies the two physical Lillies as IDs 80035 and 80036. The adapter marks ID 80035/index4. Agent21's DCI tie-break discards ID 80035 and leaves ID 80036; Agent44's paid fork discards ID 80036 and leaves ID 80035. Both paths leave one Lillie printing. No gameplay difference between these identical-copy outcomes has been demonstrated.

The current group with representative Carrier also contains payments of other printings, so its five members are equivalent only under the incomplete index-level vector. The values 6 and 10 are therefore **not valid copy-count future-liquidity comparisons**. The native bridge validates prompt mapping and physical settlement, not the strategic quality of these groups.

## Important limitation and count-based correction

There are two distinct identity problems in the existing physical-index frontier:

1. **Different protected printings can collapse.** The core grouping key preserves only scalar `protectedSacrificed`, so payments sacrificing different protected printings can merge.
2. **Identical copies of one printing can split.** The adapter deterministically marks one physical duplicate as protected. Spending that object is penalized even when another identical copy remains, while spending the other object is not. A `protectedSacrificedByPrinting` vector alone would fix the first problem but not the second.

The current v1 adapter therefore remains useful for deterministic index mapping and hard-reserve feasibility, but its soft-reserve frontier is diagnostic only. The one-soft-printing guard is retained as a conservative guard against cross-printing collapse; it does **not** make the soft result copy-invariant. Do not integrate v1 soft-sacrifice or future-way scores into a strategic policy.

I built a **local-only count-based v2 prototype**, not yet committed. It enumerates physical payment combinations, then computes each printing's remaining count after payment:

- soft deficit: `max(0, softRequired - max(0, remainingCopies - hardRequired))`;
- unprotected remaining copies: `max(0, remainingCopies - hardRequired - softRequired)`.

The frontier key and componentwise dominance retain the per-printing soft-deficit vector, per-printing unprotected remainder, desired-discard multiplicities, dead-card count, and future combinations. Physical indices remain only as representatives for prompt mapping. The two identical Lillie payments now share one printing-count group with `equivalentPhysicalPayments: 2` and identical reserve/future metrics, while different remaining Carrier/Lillie compositions remain distinguishable. The prototype supports multiple soft-reserved printings and passed **8/8 local tests**, including a 144-case count-invariant sweep. It has not been committed or CI-tested; Agent36 and Agent44 have been asked whether they prefer an adapter-owned v2 or a shared-core extension.

## Validation

- Runtime: Node v22.16.0.
- Local tests: **15/15 passed**.
- Coverage includes hard and soft reserve mapping, additive hard/soft counts for one printing, source-card exclusion, explicit hard shortfalls, non-vetoing soft shortfalls, future unprotected payment counts, the root93-shaped fixture, the multi-soft-printing fail-closed guard, input immutability, invalid inputs, and a deterministic 144-case small-domain invariant sweep.
- The existing core Pareto regression is also wired into the repository's existing manual [Aichi benchmark statistics workflow](../../.github/workflows/aichi-benchmark-stats.yml), alongside the new adapter test. No new workflow or push-triggered CI was introduced.
- Manual Aichi statistics CI runs [42356996900](https://github.com/FlareZ123/experiment-01/actions/runs/42356996900) (12 tests), [42357346860](https://github.com/FlareZ123/experiment-01/actions/runs/42357346860) (13 tests), [42357588709](https://github.com/FlareZ123/experiment-01/actions/runs/42357588709) (14 tests), and [42358235892](https://github.com/FlareZ123/experiment-01/actions/runs/42358235892) (15 tests) all succeeded. Latest run `42358235892` completed on head `3f79a9ec`; repository-wide preflight and the Agent16 test step passed with the exact nine-card post-play fixture included. The prior run [42356811491](https://github.com/FlareZ123/experiment-01/actions/runs/42356811491) failed before the Agent16 step because two other workflows had prohibited push triggers; only those trigger blocks were removed, retaining `workflow_dispatch`.
- Agent4 added a staged native bridge in [`agent4-secret-box-copy-reserve-native.cjs`](../../simulation/twinleaf/agent4-secret-box-copy-reserve-native.cjs) and [its test](../../tests/agent4-secret-box-copy-reserve-native.test.cjs). Existing manual workflow [run 42358100339](https://github.com/FlareZ123/experiment-01/actions/runs/42358100339), using the `secretbox_dci_only` mode, succeeded. Its native witness step validated two representative physical payments in both seats with fresh fixtures, genuine `prompt.validate`, the Agent4 paper payment guard, physical Store settlement of three cards, and the next Secret Box search prompt. The first current index-level group has five members, but only its representative was individually tested and the members are not proven strategically equivalent. This is a native prompt/payment mapping witness for v1, not validation of its soft-reserve ranking or a full game.
- The repository's pinned Twinleaf submodule remains `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This pure adapter did not invoke Twinleaf or alter the submodule.

## Limits and next work

This adapter does not inspect deck or Prize identities, opponent hidden information, K0/K1 provenance, card text, target availability, Bench capacity, Item/Tool/Supporter locks, or opponent responses. The current v1 soft reserve is explicitly index-based and must not be treated as count-based strategic evidence. The local v2 prototype is not yet a repository artifact.

Next steps:

1. Obtain Agent36/Agent44's decision on whether the count-based v2 belongs in a separate adapter-owned module or in the shared Pareto core. Do not modify the core or common v8 runner without coordination.
2. Add/retain an adversarial regression proving that paying either of two identical printing copies produces the same per-printing reserve deficit and future-liquidity vector.
3. Once count-based semantics are accepted, rerun Agent4's native prompt bridge with the revised API, preserving actual prompt indices and physical Store settlement. Keep the native test scoped to prompt/payment evidence.
4. Only integrate a validated frontier into a shared policy after matched fresh-deal tests and meaningful source responses. Preserve no-target, prompt, and response failures.
5. Do not promote this local tactical line or any DCI score into deck-strength or win-rate evidence.

The overall objective remains unmet: 29/32 original Aichi source lists are authenticated, no final fixed 60-card deck is selected, and competitively qualified games remain zero. No 99.5% result is claimed.
