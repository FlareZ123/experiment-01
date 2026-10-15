# Regidrago response access against Temple of Sinnoh

**Agent 20, 16 October 2026. Evidence level: exact opening-hand combinatorics on the nine published Regidrago lists, not matchup outcomes.**

The [Temple Shadow Rider v1 proposal](candidate-temple-shadow-rider.md) includes two Temple of Sinnoh. The [pinned-engine attack fixture](../twinleaf/apex-dragon-regression.md) shows Temple changes the Energy available from Double Dragon Energy. A separate question is how often a Regidrago player has a *direct resource* to remove an opposing Temple. The source-deck manifest contains full lists for nine Regidrago placements, with ranks 23 and 28 missing.

## Source counts and exact direct-access rates

From [the full, printing-aware event manifest](full-decklists.json) and independently maintained [Basic-Pokémon audit](opening-hand-audit.json), the table reports percentages **conditional on an opening seven with at least one Basic**, after the mandatory turn draw to eight cards. The opponent's Temple is assumed to be in play. The Regidrago hand, Prize cards and deck are modeled as uniform random without replacement.

| Rank | Basics | Stadiums | Stadium removal Items | Faba | Resetting Hole Marshadow | Stadium only | Stadium/Item/benchable Marshadow | Plus Faba |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 15 | 1 | 0 | 1 | 1 | 12.825% | 23.897% | 34.017% |
| 12 | 15 | 2 | 1 | 0 | 1 | 24.208% | 42.956% | 42.956% |
| 13 | 11 | 2 | 1 | 0 | 0 | 23.808% | 33.759% | 33.759% |
| 14 | 14 | 1 | 1 | 0 | 1 | 12.773% | 33.852% | 33.852% |
| 18 | 16 | 3 | 0 | 0 | 1 | 34.401% | 43.122% | 43.122% |
| 20 | 14 | 2 | 1 | 0 | 1 | 24.116% | 42.776% | 42.776% |
| 21 | 14 | 2 | 1 | 0 | 1 | 24.116% | 42.776% | 42.776% |
| 27 | 15 | 2 | 0 | 0 | 1 | 24.208% | 34.017% | 34.017% |
| 32 | 13 | 2 | 1 | 0 | 0 | 24.018% | 34.037% | 34.037% |

The equal-placement mean direct resource access is **36.799%** before Faba and is higher when Faba is legally playable. This is a mean of nine separate source-list probabilities, not a rate estimated from played turns.

The observed Stadium printings are Parallel City, Path to the Peak, Sky Field, and Silent Lab. The removal Item in these lists is Megaton Blower. Rank 10 alone also carries Faba as an additional Supporter-stage direct Stadium answer. Seven lists carry **Marshadow UNB 81**, whose Resetting Hole Ability can remove a Stadium only from the Bench. When Marshadow appears in the initial seven as its *only* Basic, it must begin Active and the model correctly withholds its Bench Ability; a Marshadow drawn as card eight can be Benched after a valid opening. Stadiums, Item removal and Marshadow are disjoint resource categories.

## What this result does and does not establish

This model records hand-access opportunities, subject to card text, Bench placement, turn-order restrictions, Item lock, Ability lock, one Stadium play per turn, search and discard costs, and strategic choice. It ignores all deck searches (Quick Ball, Mysterious Treasure, Forest Seal Stone, etc.), VS Seeker/Faba recovery, opposing mulligan bonus draws, attackers and damage, and turn-by-turn sequencing. Consequently it **cannot** estimate the chance that Temple remains in play or that Regidrago wins or loses. Search can improve access, while locks and contention can reduce actual response execution.

Marshadow's printed Resetting Hole is an Ability on a Psychic-type Basic, so opposing ability denial and an unavailable Bench matter. Faba is a Supporter, so a first-turn Supporter prohibition or consumption by another Supporter changes the Faba-enabled column. The opposing Temple player must also have found and legally played Temple. Do not multiply these opening-access figures by the Temple player's opening probability and call the product a match probability.

## Reproducibility

[Exact category enumerator](../../scripts/regidrago-temple-answers.cjs) uses integer binomial weights for the full first seven and eighth draw, excludes mulligan openings and treats a lone-Active Marshadow separately. [Independent exhaustive small-deck tests](../../tests/regidrago-temple-answers.test.cjs) cover these distinctions. [Manual-only workflow](../../.github/workflows/regidrago-temple-answers.yml) runs without Twinleaf compilation or per-commit triggers. Outcome is source-card access evidence; real decision-policy validation and counterplay remain necessary.
