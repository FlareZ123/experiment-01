# New Moon Perfection: initial Prize feasibility of the exact hand-lock line

**Agent 27, 16 October 2026.** Evidence class: exact combinatorics on the [visually transcribed 60](new-moon-perfection-source-60.md), with an independently enumerated miniature-deal regression. This is a necessary-card-zone screen for the [pilot's advertised Horror House → Powerglass → Cursed Bomb → Ace Trainer → Path/New Moon → Night Watch sequence](new-moon-perfection-aichi-2026.md), before the pilot takes any Prize cards. It is **not** a win-rate or reliable turn-two execution probability.

## Source-locked required roles

The 60 contains 17 Basic Pokémon, two Stage 1 Dusclops, two Hisuian Heavy Ball, and 33 other cards after categorization into the required roles below. The model requires access to at least one copy of each named role.

| Potentially recoverable Basic role | Copies |
| --- | ---: |
| Mewtwo & Mew-GX | 2 |
| Gengar & Mimikyu-GX; Trevenant & Dusknoir-GX | 1 each |
| Solrock; Lunatone | 1 each |
| Duskull | 2 |

Four required roles are **not** Hisuian Heavy Ball targets: Dusclops, Ace Trainer, Path to the Peak and Powerglass (**two of each**). The other nine Basics can legally start but do not substitute for one of these named roles.

A fully Prized Basic role consumes one accessible Heavy Ball rescue. Two non-Prized Balls can recover at most two such roles. Any entirely Prized non-Basic role is unavailable through that designated rescue effect. This deliberately assumes all non-Prized resources are instantly searchable and usable, and that every rescue is otherwise legal.

## Exact conditional results

The probability space deals seven initial cards from 60, conditions on at least one Basic in that hand, then deals six face-down Prizes from the remaining 53.

| Structural event, given a valid initial seven | Probability |
| --- | ---: |
| More fully Prized Basic roles than unprized Heavy Balls | 1.090438727% |
| All copies of any named non-Basic role Prized | 3.403086778% |
| Either blockage (union, overlaps counted once) | **4.484944319%** |
| Neither blockage (optimistic Prize-feasibility ceiling) | **95.515055681%** |

The Basic/non-Basic failure overlap is 0.008581185 percentage points. The exact union fraction is `15764333287/351494515099`.

Method: enumerate joint multivariate-hypergeometric Prize allocations across each disjoint role, rescuers, other Basics and filler. Weight each Prize configuration by its number of legal seven-card opening hands. Normalize by `[C(60,7) - C(43,7)] * C(53,6)`. This is equivalent to physically dealing the hand before the Prizes.

The [general exact calculator](../../scripts/combo_prize_feasibility.py), [source-locked entry point](../../scripts/new_moon_prize_audit.py), and [independent indexed-card miniature-deal tests](../../tests/test_combo_prize_feasibility.py) passed [manual-only CI run 38877161841](https://github.com/FlareZ123/experiment-01/actions/runs/38877161841). The exact source counts are loaded directly from the 33-entry transcription, without guessing print IDs.

## Interpretation

The reported line cannot execute unchanged *before taking its own Prizes* in those 4.48494% of accepted starting configurations, even with perfect access to every non-Prized piece. A player can win through alternative attacks, a different lock route, subsequent Prize-taking, or exploiting an opponent's decisions. Conversely, the remaining 95.51506% can still fail because of drawing/search sequencing, energy, Supporter use, Bench positions, Abilities, opponent locks, or timing.

The two Heavy Balls materially protect the singleton Basic roles under this static model; the non-Basic 3.40309% cut remains regardless of their number. This tests fragility of one exact tactical sequence, and supplies a concrete failure-state sampler for future full-game policies. It does not disqualify this 52nd-place list as a candidate or establish a 99.5% overall-game ceiling.
