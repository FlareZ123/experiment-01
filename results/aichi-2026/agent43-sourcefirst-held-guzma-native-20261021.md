# Native source-held T9 Guzma after source Marnie: correct pivot, zero source attacks, candidate still wins

**Agent 43 | 21 October 2026 | completed original pinned Twinleaf Store game on one deliberately retrospective rank11 source-first physical deal.** The source owner drew and genuinely held `Guzma BUS`, omitted it despite being entitled to a Supporter, and a predeclared alternative was successfully executed. **Not a competitive matchup sample.**

## Source and preregistration

[Independent source-owned hand audit](agent43-sourcefirst-postmarnie-guzma-held-owner-audit-20261021.md), compiled native CI **39685392481**, identifies `Guzma BUS` in source rank11 Absol/Garbodor's **actual** hand after T7 Marnie, throughout its T9/T11/T13 Pass decisions. On T9 original policy attached a Darkness Energy to Active Garbodor (two Darkness total), then passed. One Darkness was attached to its Benched Oranguru V ASR. The source had not played a Supporter that turn.

The additional **T9 Guzma action** was [registered before native test](https://github.com/FlareZ123/experiment-01/blob/agent43-sourcefirst-t7-marnie-native-20261021/results/aichi-2026/registrations/agent43-sourcefirst-t9-held-guzma-native-20261021.md). The source-only root wrapper returns a normal `PlayCardAction Guzma BUS` rather than the bot's actual Pass **only** when source actor's printed own hand, eligible active/bench board, candidate *public* Bench, unspent Supporter quota and unlocked status all qualify. Native `ChoosePokemonPrompt` answers remain the existing default bot/actor-only handler; no hardcoded source or candidate Pokémon target was forced and no candidate hidden hand/deck/Prize was used to choose the move. Branch [source hook, tests, full runner and existing manual workflow](https://github.com/FlareZ123/experiment-01/tree/agent43-sourcefirst-t7-marnie-native-20261021) preserve the experiment.

Source and candidate fixed 60s unchanged, source actually first seat0, New Moon candidate seat1, seed **482443328**, pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, original source-physical deal SHA256 **`60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`**. The original untouched control must match root-action ledger **`b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6`**. The single T7-Marnie baseline must match independently archived treatment ledger **`cfa5672e609ca7854d63e062424b6140d986c7cd220d804b8f18a785921e96e6`**; both did in the final compiled run.

## Original Store results, including negatives

First manual [CI 39686692567](https://github.com/FlareZ123/experiment-01/actions/runs/39686692567) was **red at pure tests** because the mock source Active omitted the Tool array; no native Guzma replay ran there. The fixture was corrected (explicitly empty Tool array), and the follow-up [compiled native CI 39686792051](https://github.com/FlareZ123/experiment-01/actions/runs/39686792051), revision `ae1e44ecd1497c69a1a42a0882446b0cbbc6801b`, passed source-owner decision regressions, original pinned engine compilation, full game replay, exact original action SHA gates and Store acceptance. [Complete 3-arm full-ledger artifact 12386802912](https://github.com/FlareZ123/experiment-01/actions/runs/39686792051/artifacts/12386802912), independently downloaded ZIP SHA256 **`b749cf1a339f291213efaff1a9624d55b814c5887a7369c2161319e781514edd`**.

| Native game outcome | Original T7 Pass | Native T7 Marnie only | Marnie then source T9 Guzma |
| --- | ---: | ---: | ---: |
| First real source deal/seed | exact original | same | same |
| First divergence from original | none | T7 action #46 Marnie | T7 #46 Marnie |
| Additional divergence versus Marnie-only | N/A | none | **T9 action #65 Guzma instead of Pass** |
| Marnie + Guzma Store accepted/rejected | N/A | 1 / 0 | **2 / 0** |
| Guzma `ChoosePokemonPrompt` native resolutions | N/A | N/A | **2 accepted** |
| Settled source attacks | **0** | **0** | **0** |
| Settled candidate attacks | 8 | 6 | 9 |
| Native engine winner, remaining Prizes | candidate, **[6,0]** | candidate, **[6,0]** | candidate, **[6,0]** |
| Global turns / root actions | 36 / 175 | 32 / 153 | **38 / 181** |

The Marnie-only action ledger and Marnie+Guzma ledger match through **65 original Marnie-arm actions**, with the only first new decision T9 ordinal65: original `PassTurnAction`, treatment **`PlayCardAction Guzma`**. Two true native `ChoosePokemonPrompt`s then resolved as original bot/actor-only policy prescribed. Public post-prompt observations show the **opposing Active became `Lunatone OBF`**, and the source successfully switched its Active from **`Garbodor BKP` to the Energy-equipped `Oranguru V ASR`**. The new game-action SHA256 is **`b6ccc668fa4bf99058e57606e4efe7b01e629a9c7505cb2f897b9ea1b6357468`**.

The source passed after that real T9 pivot, Benched its Tapu Lele-GX at T11 and added another Darkness Energy to Active Oranguru at T13, as shown by pre-decision owner-side snapshots. Despite this actual mobility repair, the source policy produced **no AttackAction and no settled source attack** in its 38-turn/181-action game. The candidate eventually took six Prizes and the source none. The T9 source had only one Darkness Energy attached to Oranguru before Guzma; ordinary attack funding remained a meaningful, distinct bottleneck. This one actual successful switch cannot establish competent post-switch Energy allocation or attacking decisions.

## Interpretation and next objective-facing action

The test **proves a specific source policy omission**: there was a held, native-legal T9 Guzma after the real Marnie draw, and its actual native prompt chain moved the source into the intended charged Bench Oranguru. Neither choosing Marnie alone nor this exact subsequent Guzma action saved the source against the unchanged candidate under the weak full-game bot. This does **not** imply every plausible source recovery route is exhausted, justify a blanket claim that Rope wins competitively, or justify a 99.5% projection.

The most informative follow-up is **state-general opponent recovery/development policy**, applied identically to Rope/no-Rope controls in fresh, unselected physical games, accounting for Supporter contention, Bench choice, attack-ready Energy assignment, actual funded attack prompts, K0/K1 information and alternative outs. Remaining successive hand-selected actions in the same retrospective seed risk overfitting. Preserve this three-arm evidence as one diagnostic and shift to reproducible prospective cross-seat comparisons. **29/32** exact source 60s still certified; **zero** competitive-qualified game outcomes.
