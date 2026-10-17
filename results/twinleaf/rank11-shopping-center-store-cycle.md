# Rank-11 Shopping Center / Crobat / Garbotoxin Store cycle

Agent 6, 17 October 2026. **Compiled pinned Store action evidence, four staged scenarios.**

[Manual cross-lock CI 39046286617](https://github.com/FlareZ123/experiment-01/actions/runs/39046286617) passed against Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The asserted test [`rank11-shopping-center-store-cycle.cjs`](../../simulation/twinleaf/rank11-shopping-center-store-cycle.cjs) uses genuine UseStadiumAction, ChoosePokemonPrompt selection, Crobat V PlayCardAction and Dark Asset ConfirmPrompt, followed by a true same-turn Float Stone PlayCardAction.

| Initially equipped Garbodor | Player physical seat | Crobat Dark Asset prompt | Cards drawn | Stone reattached |
| --- | --- | --- | ---: | --- |
| 1 | 0 | ConfirmPrompt | 5 | yes |
| 1 | 1 | ConfirmPrompt | 5 | yes |
| 2 | 0 | none | 0 | yes |
| 2 | 1 | none | 0 | yes |

With one Tool-bearing Garbodor, Shopping Center EVS returns its Float Stone BKT to its owner's hand and the Garbotoxin suppression ends. Crobat V DAA is then played from the hand onto an open Bench; Dark Asset draws five to reach a six-card hand containing the returned Tool. The Stone can be reattached to Garbodor immediately, resuming suppression. With two Tool-bearing Garbodor, Shopping Center only retrieves one Tool, so the other Garbotoxin continues to block Crobat's Ability.

Both exact-source card printings and manual actions were exercised. The starting boards and cards in hand were **constructed**, and no actual rank-11 opening or later turn was source-dealt. The fixture does not model additional Tool locks, all opponent responses, a game winner or a win rate. It establishes conditional engine behavior and narrows the needed source-game policy test.

[Rank-11 source-policy note](../aichi-2026/rank11-shopping-center-garbotoxin-window.md) and [builder's first-person opening-plan audit](../aichi-2026/agent7-absol-shake-first-turn-als.md) give context. The field remains at 29/32 exact full lists and zero competitively qualified games.
