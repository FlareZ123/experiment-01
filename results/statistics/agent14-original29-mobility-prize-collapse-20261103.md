# Agent14: exact core-mobility Prize collapse after a legal starting hand

**3 November 2026 | exact counting, all 29 authenticated Aichi original 60-card lists | no gameplay inference | 0 competitively qualified games**

## Question and provenance

The prior [exact-name mobility census](agent14-authentic-source-mobility-census-20261103.md) established that all 29 available original 60s hold at least one **Guzma**, **Float Stone**, or **Escape Rope**. It did not measure how frequently those named cards are unavailable because they are among the initial six face-down Prizes. The physical rank11 Counter Catcher falsification demonstrates why availability and tactical play matter.

This report evaluates the narrow event **every printed copy of those three named Trainer families is simultaneously among the initial six Prize cards**, conditional on the player's first accepted seven-card opening having at least one Basic Pokémon. A named family need not be strategically useful, and other mobility or Prize-recovery effects can still exist. All observations are **pre-turn deck-composition probabilities**.

- [Deterministic CJS reproducer](../../simulation/evaluation/agent14-mobility-prize-collapse.cjs), [exhaustive small-deck and full-roster regression tests](../../tests/agent14-mobility-prize-collapse.test.cjs), and existing [manual-only lightweight workflow](../../.github/workflows/agent14-source-mobility-census.yml).
- [Actual CI **41706196433**](https://github.com/FlareZ123/experiment-01/actions/runs/41706196433) succeeded at commit **84d118ed668bcb18c14becb6cdcbdcb4d66c086b**: **7/7 tests**, printed-stage and exact original-60 auditors, no Twinleaf compilation or heavy simulation.
- Exact-name original-source roster blob **`ae773f6201d7aa69d31914dbfee66f3bfa692200`** verified by existing [Agent14 original-source auditor](../../simulation/evaluation/agent14-authenticated-mobility-roster-audit.cjs). Every source card name and quantity comes from that archived roster.
- Basic counts are independently resolved by **exact Pokémon set/number and stage** through the previously validated [Agent28 printing-aware source audit](../../scripts/aichi-opening-basics.cjs), checking all **102** different printed Pokémon identities present among 29 originals. No guess based on species name or archetype.

## Exact finite-population model

Let `N=60` cards, `B` exact printed Basic Pokémon copies, `m` total copies of the three named Trainer families, `H=7` initial hand, and `P=6` initial Prizes. A uniformly shuffled seven is accepted only if it contains at least one Basic. If it fails, the player reshuffles, so the accepted seven is uniformly distributed over Basic-valid hands.

Conditional on such an accepted seven and a subsequent uniformly sampled six Prizes from the 53 remaining cards,

\[
\Pr(\text{all }m\text{ named mobility copies Prized}\mid\text{legal opening})
=\frac{\left[\binom{60-m}{7}-\binom{60-m-B}{7}\right]\binom{53-m}{6-m}}
{\left[\binom{60}{7}-\binom{60-B}{7}\right]\binom{53}{6}}.
\]

The unconditional reference is \(\binom{6}{m}/\binom{60}{m}\), for \(m\leq6\). Every binomial count is evaluated as exact `BigInt` before the final ratio is displayed in floating point. An independent brute-force enumeration over small complete opening-hand and Prize-card arrangements matches the implementation in CI.

This model does **not** equate resource presence with a playable escape. It ignores search, Prize recovery, remaining Item/Supporter/Tool restrictions, opposing switch choices, the timing of control locks, hidden Prize knowledge, and alternate cards. It does not score games or infer any win rate. Optional mulligan bonus draws occur after Prize setting and are outside this initial seven-plus-six calculation.

## Full authenticated field

`m` is the count of those **three names only**. Percentages are conditional on a valid opening seven.

| Rank | Original archetype | Printed Basics B | Named mobility copies m | All named copies Prized |
| ---: | --- | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 14 | 2 | 0.858419% |
| 2 | Vileplume Control | 14 | 2 | 0.858419% |
| 3 | Snorlax Stall | 11 | 2 | 0.861901% |
| 4 | Raichu Electrode Combo | 13 | 3 | 0.059695% |
| 5 | Mew Genesect | 11 | 5 | 0.000115% |
| 6 | Iron Thorns | 4 | 3 | 0.061002% |
| 7 | Snorlax Stall | 12 | **1** | **10.077777%** |
| 8 | Absol Garbodor | 10 | 5 | 0.000115% |
| 9 | Absol Electrode | 11 | 4 | 0.003182% |
| 10 | Regidrago | 15 | 2 | 0.857375% |
| 11 | Absol Garbodor | 11 | **6** | **0.00000210%** |
| 12 | Regidrago | 15 | 2 | 0.857375% |
| 13 | Regidrago | 11 | 2 | 0.861901% |
| 14 | Regidrago | 14 | 2 | 0.858419% |
| 15 | Lopunny Vileplume | 14 | 3 | 0.059579% |
| 16 | Absol Garbodor | 11 | 5 | 0.000115% |
| 17 | Raichu Electrode Combo | 13 | 3 | 0.059695% |
| 18 | Regidrago | 16 | 3 | 0.059366% |
| 19 | Raging Bolt | 16 | 3 | 0.059366% |
| 20 | Regidrago | 14 | 2 | 0.858419% |
| 21 | Regidrago | 14 | 2 | 0.858419% |
| 22 | Absol Garbodor | 12 | 5 | 0.000114% |
| 24 | Iron Thorns | 4 | 2 | 0.871828% |
| 26 | Meloetta Donk | 12 | 2 | 0.860683% |
| 27 | Regidrago | 15 | 2 | 0.857375% |
| 29 | Iron Thorns | 4 | 3 | 0.061002% |
| 30 | Lillie's Clefairy | 16 | 4 | 0.003140% |
| 31 | Dusknoir Chimecho | 15 | **1** | **10.058618%** |
| 32 | Regidrago | 13 | 2 | 0.859522% |

The exact count distribution across 29 sources is: **two decks with m=1, thirteen with m=2, seven with m=3, two with m=4, four with m=5, one with m=6**. Both one-copy cases are independently verified, and their conditional event probabilities are about 10.08% and 10.06%. With two named copies, the conditional joint event is usually about 0.86%; with six, it is below 0.000003%.

For transparency, the **equal-list-weight** arithmetic mean of the 29 per-original-source conditional event probabilities is **1.0945841848%**, against **1.0838848347%** if the Basic-valid opening condition is dropped. These 29 decks have different Basic counts, so the conditional correction varies by rank. An equal-weight mean is a descriptive summary of those 29 deck-specific physical-layout probabilities, **not a metagame game-win fraction**, not a claim of independence across player turns, and not a result for the three unverified lists.

## Practical consequence

A symmetric opponent decision policy should include Prize-aware mobility access and actual alternative routes, particularly in singleton source builds. The fact that some names are Prized is only one possible limitation. For rank11 specifically, a six-card named-resource total makes complete initial Prize collapse extraordinarily rare, and the observed T33 failure came from **ignoring a genuinely held Float Stone**, as independently proved by the previously completed [native same-deal rescue](agent14-rank11-postclaw-six-native-result-20261103.md). It would be wrong to attribute that native stall to Prize scarcity.

The benchmark remains **29/32 authenticated original printed decks, zero competitively qualified games, no selected fixed 60, and no demonstrated 99.5% win rate**. Additional Prize-collapsed states should be treated as coverage fixtures for a more competent opponent policy, never as automatic wins.

## Named-card scope and alternate routes in the two singleton lists

The pinned rank7 list also has **Jet Energy PAL 190**, which can switch a Benched Energy recipient Active, and **Gladion CIN 95**, which can retrieve a face-down Prize card when played from hand. Conditional on its legal opening, the probability that all three specific cards, **Guzma, Jet Energy and Gladion**, are Prized is **0.059817754%**. The 10.077777% single-Guzma event is therefore a poor surrogate for actual inability to move.

The pinned rank31 list also has **Basic Latias ex SSP 76** with the Skyliner no-Retreat-Cost Ability for Basic Pokémon, and **two Hisuian Heavy Ball ASR 146** that can recover a Prized Basic. Conditional on its legal opening, **Escape Rope and Latias ex both Prized** is **0.837904577%**; those two plus both Heavy Balls Prized is **0.003080162%**. These are initial availability events, with all actual play and lock prerequisites still unresolved.

The [mixed Basic/Trainer exact function](../../simulation/evaluation/agent14-mobility-prize-collapse.cjs) separately counts Basic targets removed into Prizes. Its rank31 single-Basic Latias event is **9.824147%**, versus **10.058618%** for the single non-Basic Escape Rope. Conditioning on a Basic-valid hand moves those probabilities in opposite directions. Neither is a game-win rate.
