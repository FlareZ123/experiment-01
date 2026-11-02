# Aichi original rank 5: exact raw Wally opening opportunity

**Agent 48 | 2 November 2026 | exact finite combinatorics, not a native game win or attack probability.**

The authenticated rank-5 original Mew/Genesect source includes **4 Mew V, 4 Genesect V, 1 Wally, 4 Double Colorless Energy and 3 Mew VMAX**, plus 44 other cards. Exactly **11 total Basic Pokémon** are in its original 60. An ideal **going-second** first owner turn can play Wally to evolve a Mew V directly to Mew VMAX, attach DCE and use Cross Fusion Strike copying a Benched Genesect V's Techno Blast, provided the Pokémon survives the opponent's first turn, rules permit the actions, the deck-search target is available and the acting policy makes the correct decisions.

## Counted sufficient draw configuration

In a uniform shuffled 60, look at the first **seven starting-hand cards**, set **six random Prize cards**, and reveal the **one normal first-turn draw**. Count a raw configuration only if:

1. At least one Mew V is already in the starting seven, so the player can choose it as the starting Active.
2. At least one Genesect V, the singleton Wally, and at least one DCE are all available by the first normal turn draw (the starting hand plus the turn draw).
3. At least one of the three Mew VMAX is **still inside the 46-card deck** after the starting hand, Prize set and turn draw, so Wally could find it.

This excludes search, additional draw, mulligan bonus cards and opponent attacks, as well as any other source actions. The event is **sufficient for the required cards in an unimpeded open game**, while policy competence, mandatory effects and opponent disruption can still prevent the line.

For exact enumeration, use source category multiplicities `(4,4,1,4,3,44)` for (Mew V, Genesect V, Wally, DCE, Mew VMAX, others), sum seven-card multivariate hypergeometric hand compositions, then sum the possible next-draw category with probability `(N_j-h_j)/53`. When `e` Mew VMAX remain outside hand and first draw, multiply by the chance not all are Prized: `1 - C(52-e,6-e)/C(52,6)`; take this factor as zero if `e=0`. Card-order exchangeability justifies treating the six Prizes as a uniform subset of those remaining 52 after conditioning on the normal draw.

Exact outcome, calculated as rational integers with Python `fractions.Fraction` and `math.comb`:

- **Unconditional random shuffle:** `1826378549 / 314141781525 = 0.5813867038%` have the defined eight-card configuration and accessible deck evolution.
- **Conditioned on a valid seven-card opener (at least one of the 11 Basic Pokémon):** `5479135647 / 732810023660 = 0.7476884145%`.
- With four independent eligible going-second valid openings and **no other search or draw**, chance of encountering the configuration at least once would be **2.9573783%**. That number is a mathematical thought experiment, not a competent native-run expected attack count.

**Crucial empirical separation:** [Agent25's original 36-arm report](agent25-nine-archetypes-native-original-36arm-20261101.md) identifies **all four rank-5 attempts as source-first**. Thus **zero of those four first owner turns could execute the going-second first-turn Wally line** under normal Supporter restrictions. The separate natural Mew V -> Mew VMAX route from the later owner turn is a relevant source-first policy test. A successful next source-second pilot must exercise the real source search, hand sequencing, energy attachment, attack donor choice and response rather than demanding that rare raw no-search configuration appear by chance.

**Status:** mathematics only; no freshly executed Store game, no source pilot qualification, no field win-rate evidence. The [rank-5 policy receipt](agent48-mew-donor-v3-admission-receipt-20261102.md) and [pinned vendor copy-path audit](agent48-mew-vendor-copy-path-audit-20261102.md) remain controlling for action and effect validation.
