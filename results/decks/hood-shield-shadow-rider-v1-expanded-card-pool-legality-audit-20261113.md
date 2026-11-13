# Hood Shield Shadow Rider v1 — Expanded card-pool legality audit

**Status:** card-pool and construction checks pass; this is not a strength result or final deck nomination.

## Scope

Audited the exact 60 in [the candidate list](hood-shield-shadow-rider-v1-expanded-legal-60.md) against the repository's bundled English card snapshot at main commit `69798d0fd08310ae17b85d6441a7453a31c3ce3a` (`resources/cards/en/`; see `resources/INDEX.md`). The uploaded `card-list.zip` is a local copy of that card snapshot.

The source candidate record is `results/aichi-2026/candidate-hood-shadow-rider.json`; this audit covers that v1 list, not the withdrawn `candidate-hood-shadow-rider-v2.json` or the separate `candidate-hood-shadow-rider-switch-v2.json`. The 33 non-Energy rows match the legal-print export by PTCGO set code, collector number, and official card identity. The source JSON's shorthand `Battle Compressor` at PHF 92 resolves to the official card name `Battle Compressor Team Flare Gear`. Its `SMP 217` promo number is normalized to the card-pool identifier `SMP SM217`. The source JSON records Basic Psychic Energy as `MEE 13`, a real MEE Basic Energy printing, but the bundled repository snapshot omits the MEE Basic Energies subset; the legal-print export therefore substitutes `CRE 232`, another English Basic Psychic Energy printing with the same identity and functionally identical text. This is a print normalization, not a card-identity change; the audit validates the normalized export, not exact source-print fidelity. The decklist's label `Basic Psychic Energy (CRE 232)` is the official `Psychic Energy` card with `Basic` subtype; the set/number match is exact.

## Result

- **60 cards:** 18 Pokémon, 31 Trainers, 11 Basic Psychic Energy.
- **34 line items:** all 34 match an English card-pool printing; all 34 printings carry `legalities.expanded = Legal`.
- **Construction:** no non-Basic-Energy card name exceeds four copies; exactly one ACE SPEC (`Unfair Stamp`); exactly one Radiant Pokémon (`Radiant Eternatus`).
- **Banned-list cross-check:** none of the candidate's identities are among the three identities responsible for the eight stale `Legal` flags identified by the official banned-printing overlay (Duskull, Flapple, Medicham V). The candidate's exact printings are all marked Expanded Legal in the card snapshot. This is consistent with the separate official overlay report; it does not replace a fresh full banlist check if the ruleset snapshot changes.

## Exact printing matches

| Qty | Decklist label | Print | Card-pool ID | Official card name |
|---:|---|---|---|---|
| 4 | Shadow Rider Calyrex V | CRE 74 | `swsh6-74` | Shadow Rider Calyrex V |
| 4 | Shadow Rider Calyrex VMAX | CRE 75 | `swsh6-75` | Shadow Rider Calyrex VMAX |
| 2 | Lillie's Clefairy ex | JTG 56 | `sv9-56` | Lillie's Clefairy ex |
| 1 | Tapu Lele-GX | GRI 60 | `sm2-60` | Tapu Lele-GX |
| 1 | Trevenant & Dusknoir-GX | SMP SM217 | `smp-SM217` | Trevenant & Dusknoir-GX |
| 1 | Latias ex | SSP 76 | `sv8-76` | Latias ex |
| 1 | Dialga-GX | UPR 100 | `sm5-100` | Dialga-GX |
| 1 | Mimikyu | GRI 58 | `sm2-58` | Mimikyu |
| 1 | Girafarig | LOT 94 | `sm8-94` | Girafarig |
| 1 | Marshadow | UNB 81 | `sm10-81` | Marshadow |
| 1 | Radiant Eternatus | CRZ 105 | `swsh12pt5-105` | Radiant Eternatus |
| 2 | Lillie's Determination | MEG 119 | `me1-119` | Lillie's Determination |
| 1 | Iono | PAL 185 | `sv2-185` | Iono |
| 1 | Teammates | PRC 141 | `xy5-141` | Teammates |
| 1 | Raihan | EVS 152 | `swsh7-152` | Raihan |
| 1 | Acerola | BUS 112 | `sm3-112` | Acerola |
| 1 | Guzma | BUS 115 | `sm3-115` | Guzma |
| 4 | Mysterious Treasure | FLI 113 | `sm6-113` | Mysterious Treasure |
| 4 | Fog Crystal | CRE 140 | `swsh6-140` | Fog Crystal |
| 2 | VS Seeker | PHF 109 | `xy4-109` | VS Seeker |
| 1 | Quick Ball | FST 237 | `swsh8-237` | Quick Ball |
| 1 | Hisuian Heavy Ball | ASR 146 | `swsh10-146` | Hisuian Heavy Ball |
| 1 | Battle Compressor Team Flare Gear | PHF 92 | `xy4-92` | Battle Compressor Team Flare Gear |
| 1 | Field Blower | GRI 125 | `sm2-125` | Field Blower |
| 1 | Night Stretcher | ASC 196 | `me2pt5-196` | Night Stretcher |
| 1 | Unfair Stamp | TWM 165 | `sv6-165` | Unfair Stamp |
| 1 | Float Stone | BKT 137 | `xy8-137` | Float Stone |
| 1 | Forest Seal Stone | SIT 156 | `swsh12-156` | Forest Seal Stone |
| 1 | Sky Field | ROS 89 | `xy6-89` | Sky Field |
| 1 | Dimension Valley | PHF 93 | `xy4-93` | Dimension Valley |
| 1 | Pokémon Ranger | STS 104 | `xy11-104` | Pokémon Ranger |
| 2 | Stealthy Hood | UNB 186 | `sm10-186` | Stealthy Hood |
| 1 | Arven | SVI 166 | `sv1-166` | Arven |
| 11 | Basic Psychic Energy | CRE 232 | `swsh6-232` | Psychic Energy (Basic subtype) |

## Limits

This establishes only that the proposed list is a 60-card construction whose selected English printings are present and marked Expanded Legal in the bundled card snapshot, with the listed construction limits satisfied. It does **not** establish:
- independent physical inspection of an assembled paper deck;
- correctness of every current erratum or future banlist update beyond the cited overlay;
- successful Twinleaf execution or real-game performance;
- any matchup result against the Aichi Top 32.

Keep this candidate as a legal-printing hypothesis, not as the selected final deck.
