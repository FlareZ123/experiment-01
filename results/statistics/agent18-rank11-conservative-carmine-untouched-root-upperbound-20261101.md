# Rank11 first-turn Carmine strict selector: exact untouched-root rarity

**Agent18 | 1 November 2026 | source-locked mathematical eligibility upper bound, no native game.**

## Concrete research question

The existing opt-in [Agent48 conservative first-turn Carmine selector](../../simulation/twinleaf/agent48-conservative-first-carmine.cjs) requires global turn 1, a held `Carmine TWM`, no Supporter used, and **every other card remaining in the owner hand to also be Carmine**. It intentionally protects every other resource from Carmine's discard-the-hand cost, which is a cautious strategic assumption. Does this selector have meaningful chance to nominate the Supporter **at the first untouched owner-root** of an authentic rank11 original deck, before any owner turn actions?

Rank11's verified original source 60 contains **11 Basic Pokémon**, **3 Carmine**, and **46 other cards**. Paper setup places a Basic into the Active Spot, optionally up to five other Basics onto the Bench, then six unseen Prizes; the going-first player takes the ordinary first-turn draw. We **condition on an initial Basic-valid seven** and **decline all optional opponent-mulligan compensation draws** so that this is a precise single-draw experiment. The original rank11 full list is [here](../aichi-2026/full-decklists.json).

## Exact necessary hand configuration

At the **first untouched root**, all source hand cards except Carmine must already have left the hand through **setup Basic placement**. There has been no turn action yet, so no Trainer played, Energy attached, or card discarded. The newest ordinary draw must therefore be a Carmine; if it is a Basic or other card, the selector fails immediately. For the valid initial seven, every non-Carmine card must be a Basic, and there cannot be more than **six** such Basics: Active + five Bench spaces.

Since the source deck has only three Carmine and the first ordinary draw must consume one, the initial seven has exactly **one or two** Carmine:

- **One Carmine initially:** the other six opening cards must be Basics, all staged into Active/Bench, and the next draw must be one of the two remaining Carmine.
- **Two Carmine initially:** the other five opening cards must be Basics, all staged, and the next draw must be the last Carmine.

A seven-Basic zero-Carmine opening cannot empty the Basic cards into a six-Pokémon play area, and an initial three-Carmine opening leaves no Carmine available to be drawn eighth. The paper Bench cap supplies the important exclusion of the zero-Carmine configuration.

With `C(n,k)` as exact binomial coefficients, number of eligible ordered 7-card *subsets plus eighth-card identity* before choosing physical setup Basic positions:

```text
Numerator =
    C(3,1) * C(11,6) * (3-1)
  + C(3,2) * C(11,5) * (3-2)
  = 4,158

Denominator =
    [C(60,7) - C(49,7)] * 53
  = 15,916,235,808

P(necessary untouched first-root hand |
  rank11 Basic-valid initial seven,
  opponent bonus declines, ordinary first draw) =
    63 / 241,155,088
  = 0.00000026124267384314945
  = **0.0000261242673843%**
```

That is about **one potentially eligible opening out of 3.83 million Basic-valid opening hands**. It is only an **upper bound**: the selector also demands an actual in-play Active, precise Supporter quota, adequate deck count and unlocked Supporters; the player is free to bench fewer Basics for strategic reasons. Exact stage placement is part of the physical condition and cannot increase the probability.

Contrast: the exact chance that rank11 **physically holds any Carmine** by the same first ordinary draw is **33.7591002849%**, computed by the [first-eight Supporter access model](../statistics/agent18-original29-valid-basic-opening-supporter-priors-20261101.md) on the three Carmine copies. Conditional on holding a Carmine, the strict untouched-root event is **63/81,411,788 = 0.0000773843709%**. This disparity isolates a selector's discard-preservation criterion and initial-stage resource geometry as the bottleneck rather than card access.


## Generalization to the other authentic Carmine sources

The 29 original 60s have **15 Carmine physical copies across 12 source ranks**: ten ranks carry **one** Carmine (1, 4, 8, 10, 14, 16, 17, 19, 26, 27), rank **18** carries two, and rank **11** carries three. Under the same no-bonus, unchanged first-root model, the Agent48 strict condition is **mathematically impossible** for every one-copy Carmine source, independent of its Basic count. If its only Carmine begins in the initial seven, the next ordinary draw is necessarily a non-Carmine left in hand. If that Carmine is drawn eighth, the initial seven would all have to be Basic; only six Basic Pokémon can be put into play during setup, leaving at least one non-Carmine card in hand. No other card can leave the hand before the first root.

Original rank18 has **16 Basic printings and two Carmine**. Its only potential untouched-root composition has one Carmine and six Basics in the opening, all six Basics placed, and the other Carmine as eighth. The exact necessary-event probability is

```text
C(2,1)*C(16,6)*1 /
  ([C(60,7)-C(44,7)]*53)
= 91/104761231 = 0.000086864195%.
```

Across the **12 authentic Carmine-containing source lists**, the default-off strict selector can theoretically propose Carmine at a virgin first-player root under this model only for rank11 or rank18 and at less than one in a million valid openings for each. This is a structural *sampling limit* of a deliberately cautious experimental predicate, not a judgment on Carmine itself or later-turn hand compression. 

## What this proves and what it does not

The above is a source-locked *mathematical* cap **only at the very first root of the first player's first turn**, before owner actions. A later root in the same turn after Items, Bench placement, Energy attachment or other legal card movements may have a different hand distribution and can satisfy Agent48's strict predicate much more readily. Actual opponent-mulligan bonus draws can be taken or declined and are excluded from this exact calculation. Other source decks have different Basic counts and Carmine copy numbers. In many states discarding a strategically protected singleton may be irrational, so one cannot conclude that a more permissive Carmine policy is automatically better.

This is **not a native Store assertion** and does not demonstrate Agent48's experimental selector has been triggered or missed an action in an actual match. It does imply that a policy evaluation sampling exclusively untouched first owner-roots is an ineffective way to detect this particular extremely conservative Carmine action. Test after meaningful hand reduction, with opponent reply and real discard settlement, if pursuing this opt-in branch.

One *qualitatively distinct* first-player gate remains: the physical card `Carmine TWM` expressly permits first-turn use going first under its printed text, while Marnie and Guzma ordinarily do not. This is separate from the restrictive discard cost.

**Reproduction:** exact integer combination arithmetic with Python `math.comb` and `fractions.Fraction` independently evaluated the above. No CI or native games were run for this specific upper-bound proof. The shared result remains **29/32 authenticated original source 60s, zero competitively qualified games, no established 99.5% win rate**.
