# Rank-11 held-Seal line: exact opening resource screen

**Agent 1, 19 October 2026. Evidence:** exact combinatorial model, independently checked with physical shuffled deals. This measures opening-card resources in the original published 60, not Store actions, real line execution, board lock, or game outcomes.

## Question and denominator

How frequently does the separate `Forest Seal Stone -> Star Alchemy -> Boost Shake -> Garbodor` route have its physical ingredients *directly among the opening seven plus mandatory first normal draw*, conditional on an opening seven containing at least one Basic? This is a narrow screen for the opt-in `rank11-held-seal-policy.cjs` line. It omits later or extra drawing, preliminary Pokemon search, opponent mulligan-bonus cards and cards played before the first normal draw. A line with other search or draw actions may still be executable outside this screen. Physical visibility does not itself establish the actual board, legal prompts, action ordering or strategic desirability.

Published Aichi rank-11 Wataru Yano list: 60 cards, **11 Basic Pokemon** (2 Oranguru V, 1 Crobat V, 2 Trubbish and six other Basics), 2 Stage-1 Garbodor, 2 Forest Seal Stone, 4 alternative Tools (3 Float Stone, 1 Muscle Band), 4 Battle VIP Pass, 2 Boost Shake and 35 remaining cards. The 11-versus-13 distinction matters: the source list contains 13 Pokemon cards **including 2 Garbodor evolutions**.

The first 8 visible cards are 7 opening cards plus 1 normal turn draw after six face-down Prizes. The following gates are cumulative. Forest Seal Stone must be held, along with a separate alternative Tool or its second copy. At least one Oranguru V/Crobat V and one Trubbish/Battle VIP Pass must be directly visible. The source policy rejects a Boost Shake already held, since that is a different route; both Garbodor in hand also disables its K0 deck-search expectation. The final gate requires at least one Boost Shake and one Garbodor outside Prizes and outside these eight cards, physically remaining in the deck.

| Physical-card gate conditional on Basic-valid opening seven | Exact probability |
| --- | ---: |
| Forest Seal Stone + separate Tool + V + Trubbish/VIP visibility | **1.86546712%** |
| Above, zero Boost Shake in first eight | **1.58172628%** |
| Above, not both Garbodor in first eight | **1.57365894%** |
| Above, unprized Boost Shake and Garbodor remaining in deck | **1.51316376%** |

The initial Basic-valid seven probability for this 11-Basic list is **77.75788585%**. The final conditional fraction is **869347470093 / 57452305854944**. If independent physical deals were sampled from exactly this screen, 32 deals would average 0.484 qualifying resource arrangements and have a 61.39% probability of zero; 128 would average 1.937 arrangements and have a 14.20% probability of zero. These are mathematical screen frequencies, not estimates of source-policy opportunities or game wins.

## Method and checks

[`scripts/rank11-held-seal-direct-visibility-exact.cjs`](../../scripts/rank11-held-seal-direct-visibility-exact.cjs) reads the published list, partitions it into eight exclusive card categories and the remainder, and enumerates every size-eight category composition with multivariate hypergeometric weights. A composition with exactly one Basic in the eight receives a 7/8 chance the Basic appeared in the initial seven, while zero Basics is rejected. The six-Prize conditional draw is enumerated combinatorially with inclusion-exclusion to ensure at least one unprized deck copy of each required search target. All counting uses BigInt integers and reduced rational fractions. [`tests/rank11-held-seal-direct-visibility-exact.test.cjs`](../../tests/rank11-held-seal-direct-visibility-exact.test.cjs) asserts the fractions and independently samples 150,000 seeded physical seven/Prize/draw deals. The tests passed locally under Node 22. No compiled Node-20 CI is yet claimed.

## Operational implication and live-test state

The preceding `held_seal_probe` 128-deal compiled action workflow **39162859902** was cancelled after the 15-minute job limit while processing the held-Seal observation (the preceding pure tests and simulator compilation passed). No completed sample denominator or policy-completion claim can be salvaged from the cancelled step. The mathematical 1.513% first-eight screen explains why blind small samples often contain zero immediate natural-resource opportunities, though additional draw/search sequences can greatly change source-policy opportunities.

A compact real source-dealt sample, or prospectively registered enriched opportunity seeds with a complete unconditional exposure denominator, is preferable to assuming a large unfiltered source campaign will yield many informative line executions. Any compiled positive requires observing the real owner-information-constrained Forest Seal Stone attachment, Star Alchemy own-deck prompt, unprized Boost Shake selection, Garbodor evolution, surviving Tool, and actual opponent response. The now-validated rank-11 adversarial opponent-policy reversals on seed 1244180408 remain a more direct gate toward qualifying competitive strength. **29/32 exact field lists; zero qualified competitive games; no validated 99.5% fixed deck.**
