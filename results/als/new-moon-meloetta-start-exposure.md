# New Moon Lockbreaker versus Meloetta: lone-Active setup stress

**Agent 4, 17 October 2026.** Exact source-inventory opening arithmetic and 120,000 independently shuffled two-player setups. This analyzes structural first-turn donk exposure, with **zero qualified competitive game outcomes**.

## Source and model

The frozen [New Moon Lockbreaker v1 English-proxy 60](new-moon-lockbreak-english-proxy-60.json), derived from a separately published 52nd-place Aichi deck, has 19 Pokémon including **17 Basics** and two Dusclops. Its source-ID/count SHA-256 is a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4. Exact English-proxy printing lookups show all 17 Basics have printed HP no greater than 270, including one **Klefki SVI 96, Mischievous Lock**. The challenger changes four Trainers from its source and retains those Pokémon counts. Japanese physical-print legality remains unresolved.

The [rank-26 Meloetta Donk 60](../aichi-2026/full-decklists.json) has 12 Basics. Its own reported first-turn strategy aims to give its opponent five Prizes using Exeggcute self-KOs, then use TM: Crisis Punch for 280 damage. A sole Active with no Bench can lose if Knocked Out. The published [live Store test](../aichi-2026/meloetta-cologne-ability-lock-window.md) shows that an Active Klefki blocks Meloetta ex's first-turn Live Debut unless Canceling Cologne removes the lock.

The exact [common solo-start model](../../scripts/aichi_solo_start.cjs) uses valid opening sevens, randomized six Prizes, simultaneous mulligans, all elected opposing bonus draws and the assumption that every additional Basic is Benched. It measures initial setup exposure before the opponent gets a normal turn, as relevant to a Meloetta-first attack. It does not model actual attack success.

## Results

| Source-setup event | Rank-1 Shadow Rider (14 Basics) | New Moon Lockbreaker (17 Basics) |
| --- | ---: | ---: |
| Lone Basic in valid seven | 39.4176% | **29.2782%** |
| Lone Active after rank-26 optional mulligan bonuses | 37.5068% | **27.4628%** |

The challenger has **10.0440 percentage points less** structural lone-Active exposure in this narrow matchup. Its solo-opening probability after bonuses consists of **1.6155% sole Klefki** and **25.8473% sole other Basic** among all valid openings. Printed HP alone does not protect any of these Basics from a successful 280-damage attack. Klefki's Active Ability can deny the first-turn attack until the opponent removes it.

For context only, the [separate rank-26 resource-access model](../aichi-2026/meloetta-stone-pad-joint-access.md) yields **28.2887%** opportunity to reach Cologne through direct draw, Order Pad heads, or Forest Seal Stone plus Crobat V against a 17-Basic opponent. It does not condition on a sole-Klefki start and must never be multiplied into a claimed donk or game-win probability without a justified joint model.

## Verification and next falsification

[Source-audited enumerator](../../scripts/new-moon-meloetta-solo-stress.cjs) and [physical-shuffle test](../../tests/new-moon-meloetta-solo-stress.test.cjs) passed the existing manually dispatched [opening audit CI 39027558164](https://github.com/FlareZ123/experiment-01/actions/runs/39027558164). The test independently re-dealt 120,000 source-count setup scenarios and checked the lone-Active and Klefki-only probabilities.

An authentic source-dealt matchup still needs the turn seat, choice of initial Active and Bench, Item search, five self-KOs, Energy, Crisis Punch, and a competent Klefki/Cologne response. The other seat allows a turn of defensive setup and must be assessed separately.

This comparison supplies an **adversarial test requirement** for the distinct New Moon contender. It is not evidence of winning actual games. The broader Aichi field remains **29/32 exact published source 60s**, with ranks 23, 25 and 28 unavailable.
