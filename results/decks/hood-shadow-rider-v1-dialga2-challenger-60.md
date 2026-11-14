# Hood Shield Shadow Rider v1 — Mimikyu-1 / Dialga-2 / Heavy Ball-1 challenger

**Status:** paired structural challenger; unselected and not a gameplay or matchup result.

This is the matched 1/2/1 counterpart to the [Mimikyu-2 / Dialga-1 challenger](hood-shadow-rider-v1-mimikyu2-challenger-60.md). Both use the same one-slot cut from the baseline: remove Trevenant & Dusknoir-GX SMP SM217, then add one copy of the chosen counterline Basic. This version adds a second Dialga-GX UPR 100. All other identities/counts are unchanged. Basic Psychic Energy is normalized to CRE 232.

## Pokémon — 18

| Count | Card | Printing |
| ---: | --- | --- |
| 4 | Shadow Rider Calyrex V | CRE 74 |
| 4 | Shadow Rider Calyrex VMAX | CRE 75 |
| 2 | Lillie's Clefairy ex | JTG 56 |
| 1 | Tapu Lele-GX | GRI 60 |
| 1 | Latias ex | SSP 76 |
| 2 | Dialga-GX | UPR 100 |
| 1 | Mimikyu | GRI 58 |
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

## Matched comparison with the 2/1/1 arm

The exact Prize/hand/draw model is symmetric between 2 Mimikyu / 1 Dialga / 1 Heavy Ball and 1 Mimikyu / 2 Dialga / 1 Heavy Ball. Both have 11 other Basics, 14 total Basics, **92.2004%** conditional core-recovery feasibility by the second-player second-turn horizon, **0.9399%** hard Prize-only obstruction, and **79.4223%** joint valid-opening/core-recovery probability.

The asymmetry is in card function and forced starts:

- With 14 Basics, the duplicated species is the sole Basic in **5.6311% of valid opening hands**; the singleton core species is the sole Basic in **2.8155%**. These probabilities are identical in magnitude for the two variants, but the forced Active differs.
- The 2/1/1 arm doubles the Mimikyu-only Basic start. Mimikyu GRI 58 is a 70-HP one-Prize Pokémon with Filch for one Colorless Energy and Copycat. It is a fragile but potentially live attacker.
- The 1/2/1 arm doubles the Dialga-only Basic start. Dialga-GX is a 180-HP two-Prize Pokémon whose printed attacks require Metal Energy, which this Psychic-only list does not play. It is more durable but can be a stranded two-Prize Active.
- Mimikyu has four Fog Crystal, four Mysterious Treasure and one Quick Ball as printed search routes; Dialga has four Mysterious Treasure, Quick Ball and Battle Compressor routes to deck/hand/discard. A second Dialga may provide a safer donor after one payload is secured, but one Dialga in the discard is sufficient for the Copycat line. These are strategic hypotheses, not evidence-backed rankings.

Agent35's [core-copy asymmetry screen](../aichi-2026/2026-11/agent35-core-copy-asymmetry-screen-20261114.md) gives a weak prior to 1/2/1 because Dialga is the discard payload and Mimikyu already has more search routes. The forced-start and dead-card costs counterbalance that prior. There is no evidence-backed winner; the two arms should be compared with the same displaced card and policy.

## Execution caveat

The access model assumes Arven can fetch Heavy Ball, but the current candidate actor-root policy has no explicit Heavy Ball branch for this counterline. The existing policy audit identifies this as an unimplemented DCI/AMR integration gap. In addition, no further V3 fixture should run on the current in-process policy architecture; an OS-enforced process boundary and owner seed-disclosure decision are still required.

Keep the baseline 1/1/1 deck unchanged. This is a paired research arm only; compare it with the 2/1/1 arm and baseline only after the trust boundary, policy route and opponent policies are fit for whole-game evaluation.
