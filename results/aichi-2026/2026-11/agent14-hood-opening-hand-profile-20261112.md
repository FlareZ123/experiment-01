# Hood Shield opening-hand structural comparison

**Prepared:** 12 November 2026  
**Candidate:** Hood Shield Shadow Rider v1  
**Reference:** official Aichi champion Shadow Rider list, deck code `QnLLQ9-qvPVqa-g9gi6Q`  
**Reproduction:** `agent14-hood-opening-hand-profile-20261112.py`

## Question

What does the candidate's structural change from the Aichi champion reference do to raw opening-hand access to its primary attacker, without pretending that opening-hand consistency is game strength?

## Exact composition comparison

Both 60-card lists have:

- 14 Basic Pokémon;
- 11 Basic Psychic Energy;
- 9 Supporters;
- 9 direct Shadow Rider search items (4 Mysterious Treasure, 4 Fog Crystal, 1 Quick Ball);
- 5 total copies across Shadow Rider V and Tapu Lele-GX.

The candidate changes that last five-card split from **3 Shadow Rider V + 2 Tapu Lele-GX** to **4 Shadow Rider V + 1 Tapu Lele-GX**. It therefore changes the identity of the opener, not the total number of those two Basic Pokémon. The candidate also exchanges the champion's Carmine/Tulip slots for Arven/Pokémon Ranger, adds two Stealthy Hood, and reduces VS Seeker and Sky Field by one each.

## Raw seven-card probabilities

These are exact hypergeometric probabilities for a uniformly sampled seven-card opening hand from 60, **before mulligan redraws, Prize placement, turn draws, costs, sequencing, or opponent interaction**.

| Event in opening 7 | Hood candidate | Champion reference | Difference |
| --- | ---: | ---: | ---: |
| At least one Basic Pokémon | 86.14% | 86.14% | 0.00 pp |
| At least one Shadow Rider V | 39.95% | 31.54% | **+8.41 pp** |
| At least one Tapu Lele-GX | 11.67% | 22.15% | **−10.48 pp** |
| At least one Shadow Rider V or Tapu Lele-GX | 47.46% | 47.46% | 0.00 pp |
| At least one Psychic Energy | 77.76% | 77.76% | 0.00 pp |
| At least one Supporter | 70.02% | 70.02% | 0.00 pp |
| At least one of the 9 direct V-search items | 70.02% | 70.02% | 0.00 pp |
| At least one Shadow Rider V **and** one Psychic Energy | 29.46% | 23.16% | **+6.30 pp** |
| At least one Shadow Rider V or V-search item **and** one Psychic Energy | 63.63% | 61.36% | **+2.28 pp** |

The chance to open at least one of the candidate's two Stealthy Hood is 22.15%. This describes access to the new defensive slot, not the value of its effect.

## Interpretation

1. **Mulligan exposure is unchanged by Basic count.** Both lists have 14 Basics, so the raw probability of a seven-card hand with no Basic is 13.86%.
2. **The candidate deliberately biases the same five-card Basic-Pokémon allocation toward Shadow Rider V.** It gains 8.41 percentage points in raw V-open probability while losing 10.48 points in raw Tapu Lele-GX-open probability. The probability of opening either card is unchanged because the combined count remains five.
3. **The direct V-plus-Energy start is more frequent in the candidate.** The exact raw seven-card probability rises from 23.16% to 29.46%. This is a structural consequence of the extra V, not evidence that the resulting starts are more likely to win.
4. **Counting V-search access narrows the difference.** When the 9 search items are grouped with Shadow Rider V, the candidate's V-access-plus-Energy probability is 63.63% versus 61.36%. The 2.28-point gap is small and does not account for discard costs, whether the search item can be used in the actual hand, or later sequencing.
5. **The Supporter count and search-item count are unchanged.** The candidate changes their identities and the Tool/Stadium balance; a simple opening-count metric cannot establish whether Arven/Pokémon Ranger/Stealthy Hood outperform Carmine/Tulip/VS Seeker/Sky Field.

## Formula and limitations

For a group of (k) cards in a 60-card deck and a seven-card hand:

[
P(geq 1	ext{ from }k)=1-\frac{\binom{60-k}{7}}{\binom{60}{7}}.
]

For two disjoint groups of sizes (a,b):

[
P(A\geq1,B\geq1)=1-
\frac{\binom{60-a}{7}}{\binom{60}{7}}-
\frac{\binom{60-b}{7}}{\binom{60}{7}}+
\frac{\binom{60-a-b}{7}}{\binom{60}{7}}.
]

The script uses only Python's standard library and asserts the composition assumptions. The search group is exactly 4 Mysterious Treasure, 4 Fog Crystal and 1 Quick Ball; each can find Shadow Rider V, but the calculation does not model discard costs or hand quality.

**Do not use these figures as a deck score, matchup win rate, or substitute for native game evidence.** Their value is to make the candidate's specific opening-hand trade-off explicit before testing: more direct Shadow Rider V access, less Tapu Lele-GX access, and unchanged Basic/Supporter/search counts.
