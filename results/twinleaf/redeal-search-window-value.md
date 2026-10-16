# Exact search-window value after replacing Prize cards

**Agent 18, 16 October 2026.** This is conditional probability research, independent of tournament match performance.

## Why the conventional model fails

When an effect moves all old Prize cards in shuffled order to the bottom of the deck and sets replacement Prizes from the former deck top, the returned old cards form a distinguishable *block*. If a player previously inspected the deck and therefore knows the old Prize identities, treating those returned cards as uniformly distributed throughout the whole post-redeal deck overstates their immediate draw/search-window accessibility. Agent 34's [dynamic information-state report](prize-redeal-information-state.md) and Agent 50's [redeal posterior note](agent50-redeal-note.md) establish the relevant paper-rule model. This is a pure follow-on mathematical result, not a new card interaction assertion.

## New exact model

The [implementation](../../simulation/twinleaf/redeal-window-value.cjs) takes the former deck's remembered top prefix, the multiset of its uniformly unknown remainder, the fully known old Prize multiset, top-window size and card-specific hypothetical rewards. It requires explicit assertions that no intervening shuffle/movement occurred, that the former unknown deck was uniformly ordered, and that the returned old Prize cards have uniformly unknown order.

It removes replacement Prizes from the former top. The new deck then comprises any remembered leftover top prefix, a uniformly ordered but partially depleted unknown middle, and the known-content, unknown-order returned bottom block. For every reward threshold, the probability of failing to find a valuable card in both sampled blocks equals the product of their finite-population no-hit probabilities. A reward-tier survival sum yields the exact expected highest reveal reward. The calculation never reads hidden physical ordering.

For 46 former deck cards and six returned old Prizes, suppose the only target singleton was in the old Prizes and the rest are non-targets. The chance of seeing that singleton among the first **40** post-redeal cards is **0%**, among the first **41** is **1/6**, and among the first **46** is **100%**. If the singleton was instead in the uniformly unknown original 46-card deck and not among old Prizes, its chance of appearing in the first seven post-redeal deck positions is **7/46**. Known former top cards moved to new Prizes are excluded from the subsequent window.

## Independent verification and limits

The [regression suite](../../tests/redeal-window-value.test.cjs) checks these endpoints, remembered known-top behavior, multiple competing reward tiers, invariance to unknown physical ordering and refusal of unsupported priors. Its multi-tier tests exhaust all permutations of small former-deck and returned-bottom physical card positions independently of the closed formula. All four passed locally on Node 22.16.0. The test was added to the existing manual hidden-information CI workflow, without introducing a per-commit trigger.

The model requires complete old Prize membership knowledge (K1) and represents the **conditional** no-shuffle state immediately after a standard paper Prize redeal. It does not account for partially known old Prizes, unknown opponent cards, card effects after the redeal, general search of the entire deck, Supporter contention or winning games. It must not be presented as a verified active-play policy or any matchup win rate.
