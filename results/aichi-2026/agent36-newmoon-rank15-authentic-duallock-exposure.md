# Rank-15 New Moon source-dealt dual-Vileplume exposure: zero observed BUS in eight generic-policy games

**Agent 36 | 18 October 2026 | fixed-source diagnostic, unqualified for game-strength inference.**

## Frozen test and compiled provenance

- **Exact published opponent:** Aichi rank 15 Lopunny / Vileplume `results/aichi-2026/full-decklists.json`, 60 printed cards including 2 Vileplume **AOR** (Bench-capable Item-lock Ability) and 1 Vileplume **BUS** (Active-only Basic attack restriction). Rank 15 owns two Oddish and two Gloom.
- **Fixed challenger:** `results/als/new-moon-lockbreak-english-proxy-60.json`, the already-frozen 60-card English-mechanics proxy, **unchanged** across all eight trials. It has two Dusclops SFA with printed 50-damage Will-o-Wisp; it has no Stealthy Hood.
- **Preregistered source seeds:** `deriveSlotSeeds(20261018, 'pilot', 15, repeat)[seat]` for repeats `0..3` and challenger physical seats `0,1`, one game per cell. This is a preselected bounded opportunity census, not retrospective cherry-picking.
- **Engine:** pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both seats use generic `SimpleTacticsAi`, with declared existing headless prompt/fidelity corrections and isolated policy randomness, under a 260-action ceiling. Neither policy has independent competitive qualification. Paper print legality of the English-mechanics proxy remains uncertified.
- **Actual root observation:** `simulation/twinleaf/newmoon-rank15-source-duallock-census.cjs` instruments `Store.prototype.dispatch` only for the genuine Store created by an `AddPlayerAction`; speculative bot simulation Stores are excluded. It observes board identity only after the real dispatch. Every trial asserts physical 60 names, engine-draw-verified true start, a nonempty root ledger and successful root ordinal completeness. A pure root/restoration test `tests/newmoon-rank15-source-duallock-census.test.cjs` passed.
- **Passing manual CI:** [39146829670](https://github.com/FlareZ123/experiment-01/actions/runs/39146829670), `newmoon` job, `Show source-dealt rank15 lock exposure summary` step; archived [unqualified JSON artifact 12144185459](https://github.com/FlareZ123/experiment-01/actions/runs/39146829670/artifacts/12144185459), zipped SHA-256 `83a09177061e80a949bdcb14850c1d56dd1cf3e3df69045c3f0b02557d2354b6`. Raw rows include both source-60 deck hashes, chronological first board events, and root action ledger digests. The earlier first run [39146372261](https://github.com/FlareZ123/experiment-01/actions/runs/39146372261) also compiled successfully, but did not display its aggregate in log.

## Genuine-source root board states observed

| Repeat | Challenger physical seat | Actual first slot | Actions | Engine finished? | First AOR Vileplume global turn | First BUS Vileplume | First challenger Dusclops global turn |
| ---: | ---: | ---: | ---: | :---: | ---: | :---: | ---: |
| 0 | 0 | 0 | 260 | No | — | — | 15 |
| 0 | 1 | 0 | 253 | Yes | — | — | 4 |
| 1 | 0 | 1 | 260 | No | 27 | — | — |
| 1 | 1 | 1 | 260 | No | — | — | 33 |
| 2 | 0 | 1 | 260 | No | — | — | 18 |
| 2 | 1 | 0 | 207 | Yes | — | — | — |
| 3 | 0 | 1 | 260 | No | 45 | — | 12 |
| 3 | 1 | 1 | 260 | No | 38 | — | — |

**Actual true-start coverage:** challenger first in **3/8**, second in **5/8**.

**Source lock opportunity counts:** AOR Vileplume in **3/8**, at global turns **27, 45, and 38**; BUS Vileplume in **0/8**; BUS Active in **0/8**; simultaneous AOR+BUS in **0/8**. Candidate Stage1 Dusclops appeared in **5/8** games, with **0 observed simultaneously against a dual-Vileplume board**.

**Game completion:** only **2/8** engine games reached a terminal phase; the other six stopped at the 260-action cap. None is a qualified competitive game or win rate. AOR/BUS presence would still require separately verifying operating Abilities and action effects before claiming effective lock.

## Interpretation and next action

The [staged printed-action matrix](../twinleaf/newmoon-rank15-dusclops-pinned-attack-name.md) confirms Dusclops's 50-damage attack *can* be announced under an injected AOR Item lock + BUS Basic attack lock. These eight authentic physical 60 starts **did not reach that tactical state**, because the unqualified rank-15 policy never put its BUS Vileplume in play and brought AOR out very late when it appeared.

This is **failure of matchup-threat exposure under the current policy**, neither a New Moon victory nor evidence that dual lock is rare with competent rank-15 play. Next compare source-locked Bunnelby/Technical Machine: Evolution priority and Guzma & Hala resource planning under the *same* original deals; verify the actual autonomous opponent's root decisions, discard costs and Stage2 chronology. Retain the generic-policy negative arm. Only then attempt a challenger Stage1 attack/response and game-end qualification.

**Benchmark denominator remains 29/32 exact field lists, zero independently qualified competitive games, 99.5% not demonstrated.**
