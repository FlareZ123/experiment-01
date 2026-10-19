# New Moon versus Iron Thorns: necessary wins in no-direct-Cologne openings

**Agent 38, 19 October 2026. Mathematical consequence of an existing source-locked opening model. No real win probability or legal game success has been measured.**

## Decision context

The fixed New Moon Lockbreaker v1 60 contains two `Canceling Cologne` Items to temporarily suppress **Active** Iron Thorns ex's `Initialization`, potentially allowing Mewtwo & Mew-GX's Ability-based attack that turn. The earlier [exact restricted setup analysis](../als/new-moon-lockbreak-60-candidate.md) gave, against the four-Basic rank6/24/29 Iron Thorns lists, probability `d = 0.284707` (rounded) of **at least one directly visible Cologne** in an accepted legal seven plus next ordinary draw, **taking all optional opponent-mulligan bonus cards**. This does **not** measure whether Cologne is usable, whether the Ability-copy attack can be completed, or whether a game is won. A successful non-direct route can search for Cologne, use native printed Gengar & Mimikyu-GX, or exploit another permitted line.

The proposed full-field target weights all 32 rank placements equally. A frozen candidate capable of at least 99.5% game wins under that estimand must average at least **84% wins against each individual rank**, even if all 31 other ranks were perfect. [Mathematical source](hard-matchup-veto.md).

## Conditional necessary performance

Let `E` denote the strictly defined opening visibility event above, `wE = P(win | E)` and `w0 = P(win | not E)`. For this static source-and-setup distribution, the rank win probability is the law of total probability:

`wRank = d*wE + (1-d)*w0`.

Even granting the unrealistic best case `wE=1` (every direct-Cologne opening becomes a win), the target's necessary `wRank >= 0.84` implies

`w0 >= (0.84-d)/(1-d) = 0.77631544` (approximately **77.63%**).

Therefore, **at least about 77.6% of the games without direct early Cologne visibility must still be won** to be compatible with a 99.5% equal-rank full-field objective, assuming the specific all-optional-bonuses setup model. Any losses inside E demand an even higher `w0`; and wins from alternative lines or searched Cologne all correctly count inside `w0`.

For comparison, with no bonus draws the published direct-Cologne visibility is `d=0.243764594`, making the corresponding lower bound `w0 >= 0.78842567`, or **78.84%**. These are conditional necessary thresholds, not an observed performance interval, and cannot be transferred automatically to a different setup strategy.

## Consequence for actual v2 research

A prospective, source-dealt rank6 Iron Thorns cohort can report **both** direct-Cologne-visible and no-direct-Cologne arms without selecting only favorable starts. The no-direct cohort is especially informative for whether the unchanged New Moon 60 has a credible native-Gengar, search, bench-management and Ability-lock escape policy. However, presence or absence of Cologne is a **post-deal stratifier**; do not filter the official paired inventory comparison on it. Retain every trial, all actual starts, opponent mulligan bonuses offered and accepted, whether Cologne was in the opening/mandatory-draw window, how the opponent pressed and what the candidate legally did. The ranking decision still requires bilateral opponent responses, paper rules and qualified game outcomes.

This calculation alone is **not** proof that New Moon fails rank6, has a 77.6% conditional win rate, or should be modified. It only translates a fixed opening-resource asymmetry into a demanding falsifiable objective threshold.

**Global status unchanged: 29/32 exact opponent 60s; zero independently qualified competitive games; no demonstrated 99.5%.**
