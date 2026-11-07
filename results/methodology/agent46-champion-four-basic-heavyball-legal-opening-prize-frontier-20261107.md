# Exact Prize-card access frontier for rank-1 champion Copycat counterline

**Agent 46 | 7 November 2026 | Source-grounded combinatorics | 0 competitively qualified games.**

## Scope

The authenticated original rank-1 Shadow Rider Calyrex inventory (Yasunori Kato) contains **14 Basic Pokémon**: one Mimikyu GRI, one Dragon Dialga-GX UPR, one Radiant Eternatus CRZ, two Lillie's Clefairy ex JTG, and nine other Basics. It has exactly **one Hisuian Heavy Ball ASR**. These four named requirements support the advertised `Mimikyu -> Copycat opponent Apex Dragon -> own discarded Timeless-GX -> extra turn -> Copycat -> own discarded Power Beam` two-Knock-Out line, with at least one Clefairy supplying Fairy Zone.

This calculation asks whether all three singleton Basics and at least one Clefairy are **potentially physically accessible before taking any Prize cards**, optimistically permitting one successful Heavy Ball recovery when the single original Ball is not Prized. A single Heavy Ball can retrieve exactly one Prized Basic Pokémon before itself replaces that Prize slot. It cannot recover a second Prized Basic. Other setup requirements are outside the model.

## Exact conditional enumeration

Draw seven starting cards uniformly from the 60, condition on at least one Basic to make a legal opening, then deal six face-down Prizes from the remaining 53. Enumerating the six Prizes first and the seven-card hand second gives the same conditional joint distribution.

Partition the deck into three distinct required Basic singletons, two identical Clefairy Basics, the single Heavy Ball, nine other Basics and 45 other cards. Let `m` be a three-bit mask of required Prized singletons, `t=popcount(m)`, `c` the Prized Clefairy count, `h` whether Heavy Ball is Prized, `b` the other Basics Prized and `r=6-t-c-h-b` the other cards Prized. Each feasible cell has

`Prize combinations = C(2,c) C(9,b) C(45,r)`

`Legal starting hands = C(54,7) - C(40+t+c+b,7)`.

The exact cell weight is their product. Total weights normalize to the legal-opening probability `1-C(46,7)/C(60,7) = 0.8614093191287199`.

The line's minimum necessary Heavy Ball recoveries are `t + (c===2 ? 1 : 0)`. The capacity is `1-h`. A cell is **Prize-structurally blocked** if its recovery requirement exceeds this capacity.

## Results

| Prize-access measurement, conditional on legal opening | Exact probability |
| --- | ---: |
| Original Mimikyu + Dialga pair with only one Heavy Ball | **2.3669091034%** |
| Full Mimikyu + Dialga + Radiant + at least one Clefairy requirement | **4.6811456582%** |
| Added obstruction beyond pair-only | **2.3142365549 percentage points** |
| Heavy Ball itself Prized with at least one needed Basic recovery | **2.3881105321%** |
| Heavy Ball unprized but at least two needed recoveries | **2.2930351262%** |
| Maximum physical accessibility under these assumptions | **95.3188543418%** |

The extended obstruction's reduced rational is exactly **11,638,172,101 / 248,618,029,660**. The pair-only rational is **139,744,719 / 5,904,101,632**, independently reproducing Agent 6's [27-location conditional opening frontier](../aichi-2026/2026-11/agent6-copycat-27-location-opening-frontier-20261107.md). This independent earlier-pair match is a strong check that legal hand conditioning and Prize selection have been handled consistently.

## Reproduction and evidence boundaries

Source cardinalities and card identities are asserted from the original [Aichi 60-card inventory](../aichi-2026/full-decklists.json) by [the exact BigInt enumerator](../../scripts/agent46-champion-copycat-prize-frontier.cjs); [node regression tests](../../tests/agent46-champion-copycat-prize-frontier.test.cjs) verify reduced fractions and conditional normalization. The dedicated copied-attack GitHub Actions workflow includes both the test and reproducible JSON output. **[CI run 42336215942](https://github.com/FlareZ123/experiment-01/actions/runs/42336215942) SUCCESS**, including the BigInt test suite and full native regression, produced the source-checked fractions reported above; the run additionally completed both original60 native seat orientations and the GX-spent controls.

A separate [full-original-60 native physical-zone experiment](agent46-original60-rank1-rank10-copycat-apex-physical-ledger-20261107.md) demonstrates the actual two-Knock-Out/four-Prize mechanics on **constructed**, fully funded/evolved boards across both physical seats. It cannot establish how frequently those constructed states are reached.

This **4.6811%** obstruction is a before-first-Prize boundary for exactly those named Basic resources with the single Heavy Ball. Taking any Prize cards could rescue the state, and alternative payloads or strategies could still win. Even when all Basics are accessible, the assembled line needs Energy, correct discard setup, bench capacity, opponent's previous Apex Dragon, and opponent choices. The **95.3189%** complement is only a physical location ceiling for those requirements. Neither number estimates game win rate, practical line execution, opponent response or time-to-assembly.

**Field status unchanged:** 29/32 authenticated original Aichi inventories; ranks 23, 25, 28 not verified; zero competitively qualified games; no 99.5% demonstrated.
