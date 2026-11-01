# Agent 35: exact Supporter visibility in a valid initial seven across 29 original Aichi 60s

**1 November 2026.** This is a **card-location combinatorial calculation**, independent of weak native play policies. It supplies an authentic-field denominator for two-player Supporter decision work. It makes **zero legal-PlayCard opportunity, engine-win, or competitive-win claims**.

## Question and input

For each of the 29 authenticated original published Aichi Top 32 60s, what is the probability that the first *valid* seven-card setup hand contains a Supporter, **conditioning on at least one Basic Pokémon**? This is more accurate for opening possession than treating an unconditional seven-card draw as playable after mulligans.

- Fixed source: [published original 60s](../aichi-2026/full-decklists.json), provenance [Limitless May 2026 Top 32](https://limitlesstcg.com/tournaments/566/decklists).
- Classification: bundled [English card database](../../resources/cards/en), checking `supertype` and `subtypes`, with the two printed Prism Star spellings `♢` and `◇` reconciled. Twenty-two evolution/VSTAR/VMAX names among the 92 unique source Pokémon names are excluded from Basic totals. Source Pokémon with misleading names, notably **Mega Absol ex** and **Mega Kangaskhan ex**, remain **Basic** under the actual card metadata.
- Reproducible calculator: [scripts/agent35-original-supporter-opening-census.cjs](../../scripts/agent35-original-supporter-opening-census.cjs); [six source and combinatorial regressions](../../tests/agent35-original-supporter-opening-census.test.cjs). Its full-roster path fails closed on unclassified or stage-ambiguous original printed names; old out-of-scope catalog ambiguity does not poison the 29 lists.
- **Database exceptions are explicit and printing-locked:** three 2014 Phantom Forces cards are shortened by the original-list provider: `Battle Compressor PHF92`, `Target Whistle PHF106`, and `Robo Substitute PHF102`. The English database has the same exact prints with `Team Flare Gear` suffix; see [official Pokémon Phantom Forces checklist](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/checklist/xy4_web_cardlist_en.pdf). Three Japanese-only printed original Trainers are absent from the English card database and are independently verified as *non-Supporters*: [Player's Ceremony SP127 Stadium](https://bulbapedia.bulbagarden.net/wiki/Player%27s_Ceremony_%28SM-P_Promo_248%29), [Palace Book SMP NAN25 Item](https://bulbapedia.bulbagarden.net/wiki/Palace_Book_%28XY-P_Promo%29), and [Palace Belt BWP153 Pokémon Tool](https://bulbapedia.bulbagarden.net/wiki/Palace_Belt_%28BW-P_Promo_153%29). These exceptions affect type counts only, with no claim of implementation or legality in Twinleaf.

- Independent verification during authoring: the source 29 originals were tallied by printed name in a separate JavaScript calculation and the local full card ZIP was inspected for Pokémon stage, Prism symbols and Supporter subtype. This report's numeric rows come from that standalone census; the first compiled Node22 run [41355314705](https://github.com/FlareZ123/experiment-01/actions/runs/41355314705) passed five pure tests but correctly failed full roster classification on the shortened Battle Compressor name. The corrected full-roster Node22 rerun [41355693542](https://github.com/FlareZ123/experiment-01/actions/runs/41355693542) **succeeded**: all six updated regressions passed, the 29-original census executed and the existing joint-bonus workflow uploaded both machine-readable results. [Compiled artifact 13103232046](https://github.com/FlareZ123/experiment-01/actions/runs/41355693542/artifacts/13103232046), SHA-256 `c17c7db38a9edb91118b16df3a144f7a651da86dac02eada3884d64294b351bd`.

## Exact model

Let `K` be the number of Basic Pokémon in the actual 60, and `S` the number of printed Supporters. These card categories are disjoint. For `x` target cards, set

`q(x) = C(60-x,7) / C(60,7)`, the probability of missing all `x` in a uniformly shuffled seven-card hand.

Then

`P(Supporter present | at least one Basic) = [1 - q(K) - q(S) + q(K+S)] / [1 - q(K)]`.

Repeated independent mulligan sevens followed by acceptance of the first Basic-containing hand have exactly this conditional law **before any optional opponent-mulligan bonus cards**, chosen setup Bench, extra draw, deck search, or card play. This is an availability probability, **not** a legal-use probability or an ALS-success probability.

## Authenticated original field

| Final rank | Printed original archetype | Basic K | Supporter S | Guzma copies | Supporter in valid seven |
| ---: | :--- | ---: | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 14 | 9 | 1 | 68.29% |
| 2 | Vileplume Control | 14 | 15 | 2 | 87.15% |
| 3 | Snorlax Stall | 11 | 21 | 1 | 95.27% |
| 4 | Raichu Electrode Combo | 13 | 4 | 0 | 38.24% |
| 5 | Mew Genesect | 11 | 7 | 2 | 57.65% |
| 6 | Iron Thorns | 4 | 21 | 3 | 94.39% |
| 7 | Snorlax Stall | 12 | 21 | 1 | 95.36% |
| 8 | Absol Garbodor | 10 | 8 | 1 | 62.70% |
| 9 | Absol Electrode | 11 | 5 | 2 | 45.19% |
| 10 | Regidrago | 15 | 11 | 2 | 76.37% |
| 11 | Absol Garbodor | 11 | 8 | 2 | 62.94% |
| 12 | Regidrago | 15 | 9 | 2 | 68.48% |
| 13 | Regidrago | 11 | 10 | 2 | 71.86% |
| 14 | Regidrago | 14 | 9 | 2 | 68.29% |
| 15 | Lopunny Vileplume | 14 | 8 | 2 | 63.58% |
| 16 | Absol Garbodor | 11 | 7 | 1 | 57.65% |
| 17 | Raichu Electrode Combo | 13 | 4 | 0 | 38.24% |
| 18 | Regidrago | 16 | 8 | 3 | 63.94% |
| 19 | Raging Bolt | 16 | 9 | 2 | 68.65% |
| 20 | Regidrago | 14 | 10 | 2 | 72.49% |
| 21 | Regidrago | 14 | 10 | 2 | 72.49% |
| 22 | Absol Garbodor | 12 | 8 | 1 | 63.16% |
| 24 | Iron Thorns | 4 | 24 | 2 | 96.77% |
| 26 | Meloetta Donk | 12 | 2 | 0 | 20.93% |
| 27 | Regidrago | 15 | 9 | 2 | 68.48% |
| 29 | Iron Thorns | 4 | 21 | 3 | 94.39% |
| 30 | Lillie's Clefairy | 16 | 5 | 3 | 46.09% |
| 31 | Dusknoir Chimecho | 15 | 4 | 0 | 38.55% |
| 32 | Regidrago | 13 | 10 | 2 | 72.29% |

The **equal-original-list mean** is **66.54817%**; it is simply the mean of 29 opening-hand visibility probabilities, without independent-game sampling or matchup weights. The range is **20.93189%** (rank 26 Meloetta Donk, 2 Supporters) to **96.77112%** (rank 24 Iron Thorns, 24 Supporters). The 29 known published 60s contain **297 Supporter copies**, and **25/29** include Guzma. **Five** original lists (ranks 3, 6, 7, 24, 29) exceed 90% Supporter visibility in a Basic-valid starting hand.

Crucial original-source distinctions:

- Rank 11 Absol Garbodor: **11 Basics / 8 Supporters**; **62.93697%** conditional Supporter exposure, including two Guzma copies in the list. This is consistent with [Agent43's genuine held-Guzma census](../aichi-2026/agent43-rank11-held-guzma-supporter-root-bottleneck-20261101.md), which observed 322 first owner roots with Guzma and zero accepted Supporter roots in a selected replay cohort, but the latter roots are repeated dependent observations, not independent hands. We cannot infer a legal gust-KO opportunity from mere held Guzma.
- Rank 6 and rank 29 Iron Thorns: each **4 Basics / 21 Supporters**, **94.38950%** conditional visibility. Rank 24 is **4 / 24**, **96.77112%**. These lists are especially useful for testing whether the opponent actor handles resource Supporter plays in a **real** constrained four-Basic setup, distinct from recent valuable empty-Bench Volt Cyclone policy work.
- Ranks 4 and 17 Raichu Electrode: both **13 Basics / 4 Supporters**, **38.23577%** conditional visibility. A uniform Supporter-first heuristic across all archetypes would ignore different setups and could be actively damaging.
- Rank 26 Meloetta Donk: **12 Basics / 2 Supporters**, **20.93189%**. Supporter presence is structurally rare in an opening hand; Item and Pokémon-driven lines dominate its source design.

## Interpretation and next executable gate

The optimal comparison is a **two-player owner-observed root-action and native-settlement census** for *actual* source games, stratified by source rank and real starting seat, with categories:

1. physically held Supporter; actual first-player turn restriction, quota and card-specific lock;
2. native legal action with all real targets available;
3. compared tactical value versus other same-root opportunities (attacks, Energy, Bench, draw, Item);
4. genuine native accepted `PlayCardAction`, settled printed effect, opponent response and game outcome.

That progression is necessary because playing a Supporter is forbidden on the first turn for the **player going first** in paper rules, while Supporter contention and ALS make many held Supporters strategically unplayable or dominated. Drawing one is neither sufficient to play it nor evidence that the bot made a mistake. The existing [rank11 16-pair owner-root study](../aichi-2026/agent43-rank11-held-guzma-supporter-root-bottleneck-20261101.md) supplies real repeated-game opportunity samples that this purely mathematical source-opening distribution complements.

**Scope / remaining blockers:** ranks **23, 25, 28** lack authenticated original printed 60s, so their numerical entries are intentionally absent. No fixed candidate 60 is competitively validated, and there remain **zero competitively qualified full games** and no evidence for the 99.5% target. The probabilities have no opponent-mulligan compensation, search, additional draw, true paper clock or turn-decision model. The local card database is a classification aid, not an automatic statement that every English printing is Japanese paper legal.
