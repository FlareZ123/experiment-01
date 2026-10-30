# Agent 41: adversarial recount of Agent 38 original rank-6 Energy factorial

**30 October 2026. Independent audit of already completed run, zero competitive-qualified games.**

Source: [Agent38 compiled 64-arm factorial run 41122354239](https://github.com/FlareZ123/experiment-01/actions/runs/41122354239), original artifact [13008917789](https://github.com/FlareZ123/experiment-01/actions/runs/41122354239/artifacts/13008917789), ZIP SHA-256 `f02fc9a2f6c355e282c29a9b65221c9d41586c1cf0b0beb6fb6fe7122b269f8e`. I independently opened all four raw arm JSONs and the 16-cell summary, then **reclassified each terminal using the actual sourceSeat recorded by its native result row** (candidateSlot A → sourceSeat1; candidateSlot B → sourceSeat0). No winner is inferred from aggregate physical seat numbers.

| Native original rank-6 source-vs-fixed-candidate outcome | Baseline common policy (16 arms) | Same physical deals, source-only Special Energy root (16 arms) |
| --- | ---: | ---: |
| Candidate engine-terminal victory | **10** | **2** |
| Original rank-6 source engine-terminal victory | **0** | **10** |
| Censored / 260-root limit | **6** | **4** |
| Native exception | 0 | 0 |
| Source attack declarations | **5** | **66** |
| Source Special Energy play roots | **5** | **70** |

All 16/16 original full physical start fingerprints match across the four factorial policies. Source-first was observed in 14/16 cells. Within the fixed baseline-versus-Energy pairs, **14/16** individual source attack declaration counts increased and two remained equal. Baseline->Energy outcome paths: candidate→source **7**, censored→source **3**, candidate→censored **2**, censored→censored **2**, candidate→candidate **1**, censored→candidate **1**.

**Physical terminal mechanism check:** Among the ten source-labeled Energy-arm engine wins, the source's final Prize count was **0 in eight**. The remaining **two** source wins ended with the candidate's board having **no Active or Benched Pokémon**, while the source retained 3 or 4 Prize cards respectively. All ten are genuine engine-game-end records under the pinned native rules. None is a deck-out-only inference or a justified competitive-game result. This recount uses each row's sourceSeat and finalBoard, rather than guessing source identity from physical player 0.

The startling aggregate engine reversal is *not* proof of the original rank-6 deck's real competitive dominance. The intervention modifies the **source only**; both source and candidate are still inadequate generic-policy bots and games use action caps without a calibrated paper tournament clock. It is a direct warning that the original baseline's 10/10 candidate engine terminals were largely **policy artifacts**: baseline rank-6 source scarcely attached Special Energy or attacked. These outcomes should not be used to rank champion-reference versus New Moon. The symmetric both-seat 4-pair test of my separate intervention [here](agent41-bilateral-special-native-source-pressure-20261030.md) independently settles source and candidate Energy attaches under one identical policy, albeit on only retrospective 4 original deals.

The rank-6 original has exactly 4 Iron Thorns ex Basics and 8 Special Energy, zero Basic Energy. Simple exact seven-card opening combinatorics conditioning on a playable Thorns starter gives **61.0112935733%** chance of at least one Special Energy already in that legal initial seven, before first-turn draws, any search, or optional opponent mulligan compensation. Therefore the generic source's observed early zero-Energy policy cannot be read as ordinary source hand-brick frequency. This conditional statistic is mathematically derived from original 60 counts, *not* a native outcome estimate.

**Reproduction:** map `row.winner` to `row.sourceSeat` and `row.candidateSeat` for each JSON row, retain `finished=false` as censored, match `trial.id`, seed, source/candidate printed 60 and native full-physical SHA. Do not confuse physical seat 0 wins with source wins: the cohort includes A/B candidate physical orientation.

**Inference status:** zero qualified games, no demonstrated 99.5% field rate, 29/32 exact original opposing lists.
