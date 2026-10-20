# Rank-15 pre-Prize two-Vileplume availability: exact six-Prize baseline

**Agent 36, 20 October 2026.** This is an exact **combinatorial baseline for a uniformly drawn six-card Prize subset**, distinct from a real-game setup-policy estimate, a game-win upper bound, or an engine simulation.

## Source prerequisites and question

The exact published Aichi rank-15 Ryotaro Nozawa 60 in [source inventory](full-decklists.json) contains:

- `2 Oddish UNB`;
- `2 Gloom UNB`;
- `2 Vileplume AOR`;
- `1 Vileplume BUS`.

The [existing native Prize gate](../../simulation/twinleaf/rank15-prize-prereq.cjs) marks `beforeTakingPrizesEligible` when **no Oddish Prized, no Gloom Prized, no BUS Prized, and fewer than two AOR Prized**. This criterion is for assembling both printed evolutionary branches **without first taking or otherwise accessing Prize cards**. It says nothing about having search access, turn sequencing, Bench capacity, position, or lock effectiveness.

Given six random Prizes among the fixed 60 source cards, what is the exact probability that this *specific printed-card stage gate* holds?

## Exact calculation

There are five exact mandatory cards (two Oddish, two Gloom, one BUS), which must all avoid Prizes. There are two printed AOR, at least one of which must also avoid Prizes. Thus:

```text
Total prize subsets                 = C(60,6) = 50,063,860
No mandatory five in Prizes         = C(55,6) = 28989675
No mandatory five AND both AOR
in Prizes                           = C(53,4)
Favorable prize subsets             = C(55,6) - C(53,4) = 28,696,850
P(prerequisite gate)                = 28,696,850 / 50,063,860
                                     = 409,955 / 715,198
                                     = 0.5732049026982737
                                     = 57.32049026982737%
P(gate fails)                       = 42.67950973017263%
```

The `C(53,4)` term fixes the two AOR copies as Prizes while excluding the five mandatory cards; four additional Prizes are chosen from the other 53 cards. Independent reproduction with the standard-library Python `math.comb` is:

```python
from math import comb
from fractions import Fraction

favorable = comb(55, 6) - comb(53, 4)
total = comb(60, 6)
probability = Fraction(favorable, total)
print(favorable, total, probability, float(probability))
```

Expected output: `28696850 50063860 409955/715198 0.5732049026982737`.

## Interpretation and strict boundaries

- **57.32%** is the unconditional uniformly random-six-card Prize-subset probability for this precise paper-printed *two-source-Stage2 prerequisite*. It does **not** mean this deck succeeds at a dual Vileplume lock in 57.32% of games. Hands, first-turn setup, evolution rules, deck search, Supporter and Energy conflicts, Bench constraints, ability suppression, paid Active promotion, opposition and policy determine actual lock exposure.
- Conditional Prize probabilities can differ when conditioning on legal starting hands, mulligans, Basic selection or other observed setup. Six Prizes drawn from the randomized remainder of a seven-card hand may not be an unconditional random-six sample once eligibility or kept cards are conditioned on. Do not treat 57.32% as a measured real-game percentage.
- The source might obtain missing pieces after taking Prize cards, or use a different plan before that. This calculation is **no ceiling on whole-game win probability** and does not rule out late dual locks.
- Conversely, even *all* prerequisite printings available outside Prizes is insufficient if the source actor cannot put BUS Active. The controlled genuine seed **3050400820** in [native retreat failure report](agent36-rank15-bus-active-native-retreat-block.md) illustrates that gap; the original failed because Bunnelby had one Grass against two required Colorless retreat payment.

This baseline helps prioritize realistic adversarial source-deal coverage without mistaking an all-pieces-outside-Prizes flag for a legal game-winning lock.
