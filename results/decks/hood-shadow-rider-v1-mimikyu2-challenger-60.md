# Hood Shield Shadow Rider v1 — Mimikyu-2 / Dialga-1 / Heavy Ball-1 challenger

<text>**Status:** parked structural comparison arm; not a replacement for the frozen v1 baseline, not the next active experiment, and not a gameplay or matchup result.</text>

This is a one-slot, 60-card challenger built from the current Hood Shield Shadow Rider v1 list. It increases the Mimikyu GRI 58 Copycat package from one to two copies and removes one Trevenant & Dusknoir-GX. All other card identities and counts are unchanged. Basic Psychic Energy is normalized to CRE 232 for an English Expanded paper list.

## Pokémon — 18

| Count | Card | Printing |
| ---: | --- | --- |
| 4 | Shadow Rider Calyrex V | CRE 74 |
| 4 | Shadow Rider Calyrex VMAX | CRE 75 |
| 2 | Lillie's Clefairy ex | JTG 56 |
| 1 | Tapu Lele-GX | GRI 60 |
| 1 | Latias ex | SSP 76 |
| 1 | Dialga-GX | UPR 100 |
| 2 | Mimikyu | GRI 58 |
| 1 | Girafarig | LOT 94 |
| 1 | Marshadow | UNB 81 |
| 1 | Radiant Eternatus | CRZ 105 |

## Trainers — 31

| Count | Card | Printing |
| ---: | --- | --- |
| 2 | Lillie's Determination | MEG 119 |
| 1 | Iono | PAL 185 |
| 1 | Teammates | PRC 141 |
| 1 | Raihan | EVS 152 |
| 1 | Acerola | BUS 112 |
| 1 | Guzma | BUS 115 |
| 4 | Mysterious Treasure | FLI 113 |
| 4 | Fog Crystal | CRE 140 |
| 2 | VS Seeker | PHF 109 |
| 1 | Quick Ball | FST 237 |
| 1 | Hisuian Heavy Ball | ASR 146 |
| 1 | Battle Compressor Team Flare Gear | PHF 92 |
| 1 | Field Blower | GRI 125 |
| 1 | Night Stretcher | ASC 196 |
| 1 | Unfair Stamp | TWM 165 |
| 1 | Float Stone | BKT 137 |
| 1 | Forest Seal Stone | SIT 156 |
| 1 | Sky Field | ROS 89 |
| 1 | Dimension Valley | PHF 93 |
| 1 | Pokémon Ranger | STS 104 |
| 2 | Stealthy Hood | UNB 186 |
| 1 | Arven | SVI 166 |

## Energy — 11

| Count | Card | Printing |
| ---: | --- | --- |
| 11 | Basic Psychic Energy | CRE 232 |

**Deck totals:** 18 Pokémon + 31 Trainers + 11 Energy = 60 cards. The list retains 14 Basic Pokémon.

## Exact structural access comparison

The existing exact BigInt enumerator `scripts/agent43-copycat-early-access.cjs` compares the current 1/1/1 package with this 2/1/1 package. The horizon is six Prizes, a seven-card opening hand, two natural draws after the opening hand (the second player by their second turn), and one Arven search opportunity. All results are conditional on a valid opening with at least one Basic, except the final joint column.

| Package (Mimikyu / Dialga / Heavy Ball) | Other Basics | Valid-opening probability | Core recovery feasible by horizon, given valid opening | Hard Prize-only obstruction | Recoverable but not seen by horizon | Valid opening and core recovery |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Current 1/1/1 | 12 | 86.1409% | 85.9140% | 2.3669% | 11.7190% | 74.0072% |
| Challenger 2/1/1 | 11 | 86.1409% | 92.2004% | 0.9399% | 6.8597% | 79.4223% |

The challenger improves the modeled conditional core-recovery event by **6.2863 percentage points** and the joint valid-opening-plus-recovery event by **5.4151 points**, without changing the 14-Basic opening rate. The hard Prize-only obstruction falls by **1.4270 points**.

This is an access-feasibility bound, not a prediction of Copycat use or a game outcome. It optimistically treats every unprized Mimikyu/Dialga as otherwise accessible, assumes Heavy Ball can be played when seen or Arven can fetch one unprized copy while an eligible Tool remains, and assumes no opponent disruption. It does not model the opponent actually using Apex Dragon, Mimikyu promotion, Energy funding, Bench capacity, Fairy Zone, GX-marker availability, action sequencing, or competing search costs.

The full Aichi source metadata contains 11 Regidrago placements among 32. Multiplying the 5.4151-point joint access-event delta by 11/32 gives **1.8614 percentage points of field-wide access opportunity** under the extreme assumption that every additional early-access event occurs in a Regidrago game and converts a loss into a win. This is not an expected win-rate improvement; most access events may not produce an executable counterline, and ranks 23 and 28 remain unavailable.

## Why this is the first one-slot cut to test

The proposed cut is Trevenant & Dusknoir-GX, not a card already identified as a field-wide engine or counter. In the intended Regidrago counterline, its Pale Moon-GX competes for the once-per-game GX attack with Dialga-GX Timeless-GX. The card still has a meaningful non-GX Night Watch attack (150 damage plus random hand disruption), so removing it has a real opportunity cost; this is a prioritization hypothesis, not proof that it is expendable.

The other Basic techs are retained for specific reasons:

- **Girafarig LOT 94:** all nine published Regidrago lists contain Super Rod; Get Lost can target recovery resources after they enter the opponent's discard. This does not prove the attack is timely or worth a turn.
- **Marshadow UNB 81:** all 29 published source lists contain at least one Stadium, including all nine published Regidrago lists. Its Resetting Hole is a potential extra Stadium answer alongside the candidate's two Stadiums and Field Blower.
- **Latias ex:** Skyliner supports Basic-Pokémon mobility and the post-Timeless Copycat-to-Shadow-Rider retreat line.
- **Radiant Eternatus:** Climactic Gate is the candidate's VMAX setup engine.
- **Tapu Lele-GX:** Wonder Tag supplies matchup-conditioned Supporter access.
- **Two Lillie's Clefairy ex:** Fairy Zone is important to the Regidrago damage line and the duplicate preserves redundancy.

The source-list counts above describe published list composition, not how often any tech will be used or how many games it wins.

## Decision and next gate

Register this as a **structural challenger only**. Keep the original Hood v1 60 unchanged as the baseline. Do not promote the challenger from the combinatorial result alone. Once the V3 policy trust boundary and owner seed-disclosure decision are resolved, compare frozen baseline and challenger policies under matched conditions, both seats and first-player assignments, with failure-inclusive records. The complete field remains incomplete (29/32 published lists), five unchanged Japanese-Extra lists are not international-Expanded-legal, and the opponent-format contract is unresolved.

Supporting files:
- [Machine-readable challenger 60](hood-shadow-rider-v1-mimikyu2-challenger-60-20261114.json)
- [Exact early-access enumerator](../../scripts/agent43-copycat-early-access.cjs)
- [Exact model and full 2/2/1 frontier](../statistics/agent43-copycat-early-access-bound-20261114.md)
- [Matched 2/1/1 versus 1/2/1 comparison](../statistics/agent43-core-copy-asymmetry-pair-20261114.md)
- [Hood DCI/AMR policy specification](../aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md)
