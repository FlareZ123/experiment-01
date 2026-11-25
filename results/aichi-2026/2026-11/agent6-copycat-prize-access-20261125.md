# Copycat → Apex Dragon → Timeless-GX: exact Prize-access collision

**Date:** 25 November 2026  
**Decision relevance:** fixed-60 candidate risk assessment; the reliability of a matchup-specific counter-ALS.  
**Evidence class:** exact combinatorial calculation plus card-text-derived access conditions. No game, matchup, or win-rate result.

## Question

The Hood Shield Shadow Rider v1 and Lockbridge Shadow Rider v1 lists both retain one Mimikyu GRI 58, one Dialga-GX UPR 100, and one Hisuian Heavy Ball. What is the probability that the Mimikyu Copycat → opponent's Apex Dragon → own Dialga-GX Timeless-GX counterline is inaccessible solely because its two Pokémon pieces and the single Prize-recovery Item collide in the six Prize cards?

The underlying rules line is documented in [Agent49's Copycat / Regidrago / Timeless-GX analysis](../../methodology/2026-11/agent49-mimikyu-copycat-regidrago-timeless-als-20261113.md). Both target Pokémon are Basic, so Hisuian Heavy Ball can retrieve one of them from the Prizes. The fixed 60 contains no second Hisuian Heavy Ball or other card that retrieves a Pokémon from the Prize cards.

## Exact one-copy calculation

Assume the six Prizes are a uniformly random six-card subset of the 60:

\[
\binom{60}{6}=50{,}063{,}860.
\]

Let the three specified cards be Mimikyu (M), Dialga-GX (D), and Hisuian Heavy Ball (H). With one H, the two-piece counterline cannot be recovered from Prizes if at least two of M, D, and H are Prized:

- M and D are both Prized: H can retrieve only one, leaving the other unavailable.
- M and H are Prized, or D and H are Prized: the only recovery Item is itself unavailable.
- If at most one of the three is Prized, the line's two Pokémon pieces remain accessible: either both are in the deck, or H can retrieve the single Prized Basic.

The exact numerator is therefore:

\[
3\binom{57}{4}+\binom{57}{3}
=3(395{,}010)+29{,}260
=1{,}214{,}290.
\]

Thus:

\[
P(\text{Prize-only counterline failure})
=\frac{1{,}214{,}290}{50{,}063{,}860}
=\frac{83}{3422}
\approx \mathbf{2.42548\%}.
\]

The components are three mutually exclusive cases with exactly two of the three specified cards Prized (395,010 sets each, 0.78901% apiece), plus all three Prized (29,260 sets, 0.05845%).

For context, Mimikyu and Dialga-GX alone are both Prized with probability:

\[
\frac{\binom{58}{4}}{\binom{60}{6}}
=\frac{1}{118}
\approx 0.84746\%.
\]

That is only one part of the failure event; the other part is the recovery Item being Prized alongside either target.

## Two-Hisuian-Heavy-Ball counterfactual

If a second Hisuian Heavy Ball replaced another card, define four specified cards: M, D, H1, H2. The line is Prize-inaccessible only when at least three of these four are Prized:

- two target Pokémon plus at least one Heavy Ball leaves fewer than two recovery Items;
- one target Pokémon plus both Heavy Balls leaves no recovery Item.

The exact numerator is:

\[
4\binom{56}{3}+\binom{56}{2}
=112{,}420,
\]

giving:

\[
\frac{112{,}420}{50{,}063{,}860}
=\frac{73}{32509}
\approx \mathbf{0.22455\%}.
\]

This is a 10.8-fold reduction in this narrow Prize-only failure event. It is **not** a recommendation to add the second copy: the slot cost, Item-lock exposure, and competition for Heavy Ball among the deck's other Basic one-ofs are not modeled.

## Interpretation

- The single-Hood-Shield and single-Lockbridge lists have the same 2.42548% Prize-only failure probability for this counterline; this calculation does not rank them against each other.
- The result is a hard access constraint for this particular two-Pokémon line, not a 2.42548% matchup-loss estimate and not the probability that the line is otherwise assembled.
- Even with both pieces Prize-accessible, the line still requires the opponent to have used Apex Dragon on the immediately preceding turn, Mimikyu to be Active with its own Copycat cost paid, Dialga-GX UPR 100 in the discard pile, and the player's GX attack marker unused.
- Losing this counterline to Prizes does not imply losing the Regidrago matchup; Fairy Zone / Max Geist and other game plans remain outside this calculation.

## Reproduction

The calculation uses only the 60-card deck size, six Prizes, and the listed one-/two-copy counts. It is an exact hypergeometric count, not a Monte Carlo estimate. The 2-Hisuian-Heavy-Ball result is a counterfactual sensitivity calculation, not an approved deck edit.

## Limitations

The model assumes a uniform six-card Prize subset. It excludes mulligan conditioning, draw/search sequencing, ordinary search outs (which cannot retrieve a card while it is in the Prizes), Prize manipulation, recovery after a target is discarded, opponent interaction, and the opportunity cost of consuming Heavy Ball on another Basic Pokémon. It does not establish a complete game line, policy competence, matchup performance, or any win rate.


## Broader shared Prize-recovery capacity across singleton Basic tech

The same fixed 60 contains eight singleton Basic Pokémon that support distinct lines: Tapu Lele-GX, Trevenant & Dusknoir-GX, Latias ex, Dialga-GX, Mimikyu, Girafarig, Marshadow, and Radiant Eternatus. Each can be retrieved from the Prizes by Hisuian Heavy Ball if it is the one stranded target. They share the same recovery copy; the calculation below treats all eight as potential targets, not as eight cards that must all be recovered in every game.

For a Prize set, let (X) be the number of these eight targets in the Prizes and (Y) the number of Heavy Ball copies in the Prizes. With (H) copies in the deck, the maximum number of Prized targets recoverable by Heavy Ball is (H-Y), so the stranded target count is:

\[
S=\max(0, X-(H-Y)).
\]

Exact enumeration over the 60-card deck gives:

| Heavy Ball copies | Probability at least one of the 8 targets is stranded | Expected stranded targets per game |
|---:|---:|---:|
| 1 | 21.79788% | 0.25973 |
| 2 | 5.23743% | 0.05803 |

For one copy, a target is stranded whenever at least two of the nine specified cards (eight targets plus Heavy Ball) are Prized. The exact failure numerator is 10,912,860 of 50,063,860 Prize sets. For two copies, a target is stranded whenever at least three of the ten specified cards (eight targets plus two Heavy Balls) are Prized; the numerator is 2,622,060.

This is a **Prize-recovery capacity metric**, not a game-loss estimate or a recommendation to add Heavy Ball. The eight targets have unequal, matchup- and state-dependent value; many have ordinary search outs while in the deck; only their Prize state requires Heavy Ball. The second copy also consumes a fixed deck slot and remains vulnerable to Item lock. The result makes the shared-recovery bottleneck measurable without pretending all eight tech Pokémon are equally essential.
