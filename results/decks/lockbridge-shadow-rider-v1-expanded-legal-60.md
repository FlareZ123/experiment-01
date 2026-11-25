# Lockbridge Shadow Rider v1 — English Expanded-printing-normalized 60

**Disposition:** development challenger only. This is the same 60-card Lockbridge list recorded in `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`; it is not a new deck variant, a nomination, or a strength claim.

## Pokémon — 18

| Count | Card | Printing |
|---:|---|---|
| 4 | Shadow Rider Calyrex V | CRE 74 |
| 4 | Shadow Rider Calyrex VMAX | CRE 75 |
| 1 | Lillie's Clefairy ex | JTG 56 |
| 1 | Tapu Lele-GX | GRI 60 |
| 1 | Trevenant & Dusknoir-GX | SMP SM217 |
| 1 | Latias ex | SSP 76 |
| 1 | Dialga-GX | UPR 100 |
| 1 | Mimikyu | GRI 58 |
| 1 | Girafarig | LOT 94 |
| 1 | Marshadow | UNB 81 |
| 1 | Radiant Eternatus | CRZ 105 |
| 1 | Wobbuffet | PHF 36 |

## Trainers — 31

| Count | Card | Printing |
|---:|---|---|
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
| 2 | Stealthy Hood | UNB 186 |
| 1 | Arven | SVI 166 |
| 1 | Temple of Sinnoh | ASR 155 |

## Energy — 11

| Count | Card | Printing |
|---:|---|---|
| 11 | Basic Psychic Energy | CRE 232 |

**Total: 18 Pokémon + 31 Trainers + 11 Energy = 60 cards.**

## Printing normalization and legality

- The source JSON's `MEE 13` Psychic Energy entry does not resolve to an English printing in the supplied set map. This export normalizes those 11 Basic Psychic Energy cards to **CRE 232** (`swsh6-232`), which is marked Expanded Legal in the repository card pool.
- The source shorthand `Battle Compressor PHF 92` is rendered under the card-pool name **Battle Compressor Team Flare Gear**.
- `Trevenant & Dusknoir-GX SMP 217` resolves to the promo card-pool entry `smp-SM217`.
- All 35 distinct rows resolve to English card-pool entries marked `expanded: Legal` after those two name/printing normalizations. No card is marked Expanded Banned.
- Construction checks: exactly 60 cards; 18/31/11 category totals; no card name exceeds four copies; exactly one ACE SPEC (Unfair Stamp); exactly one Radiant Pokémon (Radiant Eternatus).

The original JSON is intentionally unchanged so its candidate identity and prior research references remain stable. This export establishes card-pool legality for the normalized English 60, not physical-copy certification, Japanese Extra legality, policy competence, matchup strength, or final nomination.
