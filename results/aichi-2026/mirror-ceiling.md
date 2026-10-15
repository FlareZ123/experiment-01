# A symmetric-mirror ceiling for copied Top 32 candidates

**Agent 8 | 15 October 2026 | Mathematical result under explicit assumptions**

## Claim

For an equally weighted field of 32 opposing lists, a candidate that is *identical* to one opponent's entire legal 60-card deck and is evaluated using the same decision-policy distribution, fair random setup and both true starting-turn positions **cannot** achieve a 99.5% game-win rate under the symmetric-mirror model. This is a conditional theorem, not evidence of any deck's actual win rate.

Let W, L and D be probabilities of the candidate winning, losing and drawing against the identical deck. Under exchangeability of both players' identical lists, decision rules, and randomized seat/first-turn assignment, exchanging player labels maps each candidate win into an equally likely candidate loss. Thus W=L. Since W+L+D=1, W=(1-D)/2 <= 1/2.

Even granting an impossible 100% victory rate across *all 31 other placements*, the field-average win fraction is bounded by

`(31 * 1 + 0.5)/32 = 0.984375 = 98.4375%`.

This is **1.0625 percentage points below** the requested 99.5% threshold.

For k identical opponent placements, the same logic gives an upper ceiling of `1-k/64` if all others are victories and ties count as nonwins.

## What the result does and does not establish

The source [Aichi field manifest](field.csv) includes the rank 1 champion's 60-card list among its opponents. Therefore simply submitting that unchanged champion reference as the fixed candidate yields an exact deck mirror against rank 1. Any other copied Top 32 list likewise creates at least one corresponding mirror against itself.

This conclusion requires **matched strategy quality/policies** and exchangeable seat/turn sampling. A much stronger candidate-side pilot could outperform an opponent-side player even on identical cards. A simulator that privileges one bot policy or the starting side could also report asymmetric results. Therefore this is **not** an unconditional game-theoretic upper bound against arbitrarily weak fixed opponents; it is a benchmark-design warning and a reason to separate deck strength from player-policy strength.

The result does **not** apply to a new 60-card list merely sharing an archetype, attacker, or 59 cards with a field list: the mathematical mirror symmetry then disappears.

The current engine runner has only proven A/B player-slot alternation and has not verified actual first-turn randomization. Accordingly, its mirror outcomes must not be used to validate or refute this theorem until first-turn instrumentation and equal decision policies are established.

## Strategic consequence

Because the optimization objective demands a **single unchanged list** against all placements, selecting the champion's deck by tournament rank alone cannot satisfy the symmetric-policy 99.5% target. The field search should focus on genuinely distinct list structures and stronger, equally specified decision policies. A copied list remains a valuable reference benchmark for detecting simulation bugs and identifying favorable and unfavorable matchups.

No card-specific matchup strength is asserted here.
