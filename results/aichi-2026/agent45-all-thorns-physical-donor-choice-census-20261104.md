# Agent 45: exact physical Energy donor-choice frontier across all three original Aichi Iron Thorns sources

**4 November 2026 | pure exhaustive source-card combinatorics | zero simulated games and zero competitive-qualified wins.**

## Research question

The [registered Rank 6 same-deal native donor replay](agent45-retrospective-both-seat-volt-donor-native-followthrough-20261103.md) showed a genuine source Volt Cyclone after-attack physical Energy choice that changed the following turn from Pass to an accepted attack and, in one previously seen game, gained two Prizes. Is this donor-selection issue a peculiarity of source Rank 6's one Double Colorless Energy and one Spiky Energy, or does the printed original field contain a broader family of potentially costly donor decisions?

The exact [original printed-60 field manifest](full-decklists.json) contains three separate Iron Thorns sources with eight printed Special Energy each:

| Original rank | Player | Speed Lightning | Double Colorless | Capture | Spiky |
| ---: | --- | ---: | ---: | ---: | ---: |
| 6 | Kazuma Kashi | 4 | 1 | 2 | 1 |
| 24 | Ryoya Fujii | 4 | **3** | 1 | **0** |
| 29 | Kohei Hamamichi | 4 | 1 | 2 | 1 |

Each is a full source-authenticated, unchanged 60. The source Rank 24 mix is meaningfully different: repeated Double Colorless, no Spiky. A hook hardcoding a preferred `Spiky Energy` donor would not generalize.

## Method

[Pure physical-copy enumerator](../../simulation/evaluation/aichi-thorns-physical-energy-donor-census.cjs) expands each source's eight Energy cards into distinguishable copy positions and exhaustively enumerates all `C(8,k)` subsets for `k = 2, 3, 4, 5`. For each subset, apply the already tested [bounded printed-cost model](../../simulation/evaluation/agent45-volt-cyclone-donor-debt.cjs) before and after transferring **one physical Energy card** from the Active Iron Thorns ex to a hypothetical available same-owner Bench. The printed Volt Cyclone cost is Lightning+Colorless+Colorless, Speed Lightning supplies one Lightning, Double Colorless supplies two Colorless, Capture/Spiky supply one Colorless. We separately retain the current public Stadium as none, Thunder Mountain Prism Star (one Lightning cost reduction), or Wondrous Labyrinth Prism Star (one extra Colorless cost). Any unknown Energy or Stadium fails closed. Every subset belongs to one mutually exclusive status:

- `beforeUnpayable`: printed attack cost is already unpaid, hence donation is outside the meaningful source attack opportunity;
- `allDonorsUnsafe`: current attack was payable but transferring *any one* physical Energy makes the printed cost unpayable;
- `mixedDonorSafety`: transferring some physical Energy copies preserves the cost and transferring others destroys it;
- `allDonorsSafe`: every possible physical Energy donor leaves printed cost payable.

This is **static resource combinatorics**. It does not say which card is attached in a real game, which Bench exists, whether an attack can be announced, the probability of any subset, which donor is tactically better, or the eventual game outcome. The equal-weight physical-subset fractions below are **not empirical board frequencies**.

The five positive/negative regression tests in [the committed Node CJS suite](../../tests/agent45-aichi-thorns-physical-energy-census.test.cjs) passed locally under Node 22.16.0. They include both authentic energy compositions, Stadium perturbations, subset partition identities, strict source inventory checks and unknown-card refusal. **No post-change GitHub Actions run is claimed.**

## Results: exactly three physical attached Energy

Each deck has `C(8,3) = 56` possible three-card physical Energy-copy subsets.

| Stadium and printed source | Unpayable before | All donors unsafe | Some donors safe, some unsafe | Every donor safe |
| --- | ---: | ---: | ---: | ---: |
| None, Ranks **6 / 29** | 4 | 34 | **18** | 0 |
| None, Rank **24** | 4 | 10 | **42** | 0 |
| Thunder Mountain, all three ranks | 0 | 0 | 0 | **56** |
| Wondrous Labyrinth, Ranks 6 / 29 | 38 | 18 | 0 | 0 |
| Wondrous Labyrinth, Rank 24 | 14 | 42 | 0 | 0 |

With no Stadium, 52 of 56 physical subsets for each source initially pay for Volt Cyclone. Rank 6 and Rank 29 each have **18/52 (34.61538%)** initially payable three-card subsets whose donor choice can preserve or lose printed next-attack payment. Rank 24 has **42/52 (80.76923%)** such conditional subsets under this deliberately equal-subset inventory model.

**Examples:** `Speed + Speed + Double Colorless` permits donating either Speed while keeping a Lightning unit and enough generic Energy; donating the Double Colorless removes two units and makes Volt Cyclone unpayable. `Speed + Double Colorless + Capture` permits donating Capture, while removing either Speed or Double Colorless loses one necessary payment channel. The Rank 24 extra Double Colorless copies substantially increase the representation of such mixed-donor three-card physical subsets.

Thunder Mountain removes the Lightning-specific part of the cost so every donor from a three-card set leaves two or more Colorless units under this model. Wondrous Labyrinth raises the total requirement to four Energy units, so every three-card initially payable subset loses immediate cost payment after moving a card. These are conditional current Stadium mechanics; switching Stadiums or changes in board state can alter them.

## Sensitivity to larger attached-Energy subsets (no Stadium)

| Physically attached | Source style | Unpayable before | All unsafe | Mixed | All safe | Total |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 4 | Rank 6 / 24 / 29 | 1 | 0 | **16** | 53 | 70 |
| 5 | Rank 6 / 24 / 29 | 0 | 0 | **4** | 52 | 56 |

The rank-specific sensitivity at exactly three attached copies converges in these four- and five-copy subset counts. A blanket card-name priority remains fragile because the safe donor set changes with the precise physical attachment multiset and visible Stadium.

## Next decision-quality test

Use Rank 24's exact source list as a **new untouched-source benchmark** for a *single generic, owner-visible Energy-resource choice policy* evaluated under the symmetric two-seat common native policy, alongside existing Rank 6 and Rank 29 controls. Select the donor by testing the printed payment constraint for **every actual physical Energy** in the live source Active, then compare the tactical costs of keeping Spiky, placing Speed on the Bench, or preserving Double Colorless before choosing among viable alternatives. A policy solely focused on current Active cost is not automatically strategically optimal.

The initial native donor prompt must be source-attributed; preserve physical Energy instance and target, `prompt.validate` and an independent paper guard, actual next source attack, opponent reply, Prize outcome, initial source-deal fingerprint, no-opportunities, errors and action caps. Test genuinely independent prospective original source deals under one fixed policy; retain this retrospective Rank 6 experiment as a positive control rather than win-rate data.

**Decision status unchanged:** 29/32 authenticated source decklists, missing ranks 23/25/28, zero competitively qualified games, no proven fixed-60 best deck or 99.5% field win rate.
