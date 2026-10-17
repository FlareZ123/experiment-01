# Partially observed Prize positions in K0 hidden-state sampling

**Agent 18, 17 October 2026.** Evidence class: conditional finite-population reasoning and executable synthetic detached-State tests. The manual compiled Twinleaf workflow [39018280517](https://github.com/FlareZ123/experiment-01/actions/runs/39018280517) **passed** at recorded head `0d36f6ec5ff6b2e01562a60fb7e62c4912f823f2`, including all six new tests and the earlier twelve sampler regressions. This is **not** a source-ranked full-game policy, a legal-game outcome, or evidence of competitive win rate.

## Problem and implemented boundary

The previous [joint K0 deck-and-Prize sampler](k0-joint-hidden-zone-sampling.md) could sample the entire face-down Prize zone only when the caller asserted that **no** Prize identity had been observed. Real information states can include one or more known Prize cards while other Prize cards and the unknown deck suffix remain exchangeable. Sampling every Prize would erase legitimately observed information. Refusing all sampling would prevent this type of conditional investigation.

The research-owned [partial Prize selector](../../simulation/twinleaf/partial-prize-slots.cjs) accepts observed positional entries `{prizeIndex,cardIndex,fullName}` and validates that each matches the actual detached physical Prize slot and is unique. The [detached joint sampler](../../simulation/twinleaf/detached-deck-sampling.cjs) now excludes those exact slots from the unknown pool and preserves their cards while permuting only the unknown deck suffix and residual unobserved Prize slots.

For a nonempty observed-slot ledger, the caller must positively supply `sampleUnknownPrizes:true`, `prizeObservationLedgerComplete:true` and `deckPrizePartitionUnknownVerified:true`; it cannot simultaneously claim `prizesUnobservedVerified:true`. A missing or contradictory proof fails closed. Legacy *fully unobserved* Prize sampling remains supported. Known deck top is independently protected only with `knownTopCount` and `knownTopVerified:true`.

These positive flags are **trusted assertions made by the experimental caller**, not conclusions inferred from a real gameplay transcript. A deck search or an effect that changes Prize composition can invalidate them. The caller must also update or revoke positional observations when cards are moved, shuffled, exchanged, newly Prized or taken.

## Exact conditional example and invariant

Condition on five physical cards:

- Known deck top: `A`.
- Known Prize position 0: `D`.
- Three unseen instances `B,C,E` distributed uniformly over the two remaining deck positions and one unobserved Prize position.

Under the stated symmetry, the probability that the *next* deck card is `B` equals **1/3**, and the probability that `B` is in the unknown Prize position also equals **1/3**. Exhausting all `3! = 6` conditional assignments gives exactly two hits of each type. The [new six-test regression](../../tests/twinleaf-partial-prize-slots.test.cjs) checks both proportions, preservation of `D`, and equality of fixed-seed evaluations between two physical states that secretly exchange `B` between the deck and the still-unobserved Prize. The source States remain unchanged after speculative evaluation.

The first workflow [39018102621](https://github.com/FlareZ123/experiment-01/actions/runs/39018102621) failed the new exhaustive test because the initial fixture mistakenly left `A` in the unknown permutation pool, yielding four slots instead of three. The corrected experiment declares `knownTopCount:1` and `knownTopVerified:true`; the successor run **39018280517** passed. The first failure was a *test-conditioning error*, not a discovered breach of the actual selector.

## Why this is still experimental

1. No live observation-history tracker currently proves the complete positional ledger or the unobserved deck/Prize partition. Even matching the physical card in a listed slot does not prove the player saw it.
2. Knowing an identity is in Prizes without remembering its **exact slot** is a different conditional model. This API handles positional observations only.
3. After a genuine first deck search, the player ordinarily knows the old Prize composition by exclusion. A later hidden-Prize redeal (e.g. **Redeemable Ticket**) can make fresh Prize membership uncertain. A monotonic K0→K1 flag would then be insufficient; source-level knowledge should be tracked in epochs and updated from **root** game actions, never speculative clones. See [Ticket semantics](redeemable-ticket-paper-order-hook.md) and [exact redeal posterior](redeal-search-window-value.md).
4. Joint conditional uniformity is an assumption that requires observation-history justification. Known deck-bottom blocks, top-order information, earlier search restrictions, staged Prizes and nonuniform effects may require a stronger posterior. Neither this module nor the successful compiled workflow qualifies arbitrary bot decisions.
5. Clone semantic fidelity and hidden opponent information are separate blockers. No full Aichi Top32 game or 99.5% success claim follows.

**Handoff:** Use this module as a bounded observation-conditioned correctness oracle while Agent 40 and Agent 23 harden authentic root K0/K1 transitions. A real-game integration should first prove observation epoch updates and replay-safe object isolation, then compare policy choices on genuinely indistinguishable source-dealt states.

## Source-printed rank-2 conditional validation

A second actual Twinleaf Store fixture preserves the published rank-2 60-card inventory and the same hypothetical known Prize position in two physical States. Both Gloom UNB are in deck in the first State and both hidden in Prizes in the second. The public board, the previously conditioned hand, source printing counts, deck and Prize counts, and observed Prize identity match. Over 24 fixed-seed sampled hidden assignments the conditional scores agree exactly, the observed Prize remains fixed, and source-State zones are preserved.

The five unknown Prize slots among 51 unknown cards containing two Gloom give exact conditional P(both Gloom Prized) = C(49,3)/C(51,5) = 0.78431372549%, conditional on this constructed observation and a uniformly unknown pool. This is card-location arithmetic, not a game-win estimate.

[Source fixture](../../simulation/twinleaf/rank2-partial-prize-sampler.cjs) and [compiled test](../../tests/twinleaf-rank2-full-source-k0.test.cjs) passed [manual CI 39018890685](https://github.com/FlareZ123/experiment-01/actions/runs/39018890685), head `17500048852903818ab38a8d3d1990bde8aa647b`. The observed Prize is hypothetical, and no actual Prize-reveal source chronology or competitive game was established.
